import 'dart:async';
import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';

class MeteorClient {
  static final MeteorClient _instance = MeteorClient._internal('http://10.0.2.2:3000');

  factory MeteorClient({String serverUrl = 'http://10.0.2.2:3000'}) {
    return _instance;
  }

  MeteorClient._internal(this.serverUrl);

  static MeteorClient get instance => _instance;

  final String serverUrl;
  late WebSocketChannel _channel;
  final Map<String, dynamic> subscriptions = {};
  final Map<String, Map<String, dynamic>> collections = {};
  final StreamController<MeteorMessage> _messageController =
      StreamController.broadcast();
  final Map<String, Completer<dynamic>> _pendingMethods = {};
  bool isConnectedInternal = false;
  int _methodId = 0;
  int _subscriptionId = 0;
  String? _authToken;
  String? _authUserId;
  Completer<void>? _authCompleter;
  void Function()? onAuthError;

  void setAuth(String token, String userId) {
    _authToken = token;
    _authUserId = userId;
    
    // If we are setting auth, it means we have a token.
    // Ensure any pending waitForAuth call is completed.
    _authCompleter ??= Completer<void>();
    if (!_authCompleter!.isCompleted) {
      _authCompleter!.complete();
    }
  }

  void clearAuth() {
    _authToken = null;
    _authUserId = null;
    _authCompleter = null;
  }

  Future<void> waitForAuth() async {
    if (_authToken == null) {
      return; // No auth needed
    }
    
    // If completer doesn't exist yet, create one and wait
    if (_authCompleter == null) {
      _authCompleter = Completer<void>();
      await _authCompleter!.future;
    } else if (!_authCompleter!.isCompleted) {
      // If completer exists but not completed, wait for it
      await _authCompleter!.future;
    }
    // If completer exists and is already completed, future resolves immediately
  }

  bool get isConnected => isConnectedInternal;
  Stream<MeteorMessage> get messages => _messageController.stream;
  String? get authToken => _authToken;
  String? get authUserId => _authUserId;

  Future<void> connect() async {
    try {
      final wsUrl = serverUrl.replaceFirst('http://', 'ws://');
      _channel = WebSocketChannel.connect(Uri.parse('$wsUrl/websocket'));

      _channel.stream.listen(
        (message) {
          final json = jsonDecode(message as String) as Map<String, dynamic>;
          _handleMessage(json);
        },
        onError: (error) {
          isConnectedInternal = false;
        },
        onDone: () {
          isConnectedInternal = false;
        },
      );

      isConnectedInternal = true;
      
      // Reset auth completer for new connection
      _authCompleter = null;
      
      await _sendMessage({'msg': 'connect', 'version': '1', 'support': ['1']});
    } catch (e) {
      isConnectedInternal = false;
      rethrow;
    }
  }

  Future<void> disconnect() async {
    isConnectedInternal = false;
    await _channel.sink.close();
  }

  Future<void> subscribe(String name, {Map<String, dynamic>? params, List<dynamic>? args}) async {
    final id = (++_subscriptionId).toString();
    final subscription = <String, dynamic>{
      'msg': 'sub',
      'id': id,
      'name': name,
    };
    
    // Use args if provided (direct array), otherwise wrap params in array
    if (args != null) {
      subscription['params'] = args;
    } else if (params != null) {
      subscription['params'] = [params];
    }

    final readyCompleter = Completer<void>();
    subscriptions[id] = <String, dynamic>{
      'name': name,
      'params': params ?? args,
      'ready': readyCompleter,
    };

    await _sendMessage(subscription);
    
    await readyCompleter.future.timeout(
      Duration(seconds: 15),
      onTimeout: () {
        throw Exception('Subscription to $name timed out after 15 seconds');
      },
    );
  }

  Future<dynamic> call(
    String method,
    List<dynamic> params,
  ) async {
    await waitForAuth();
    if (!isConnectedInternal) {
      throw Exception('Not connected to Meteor server');
    }

    final id = (++_methodId).toString();
    final completer = Completer<dynamic>();
    _pendingMethods[id] = completer;

    try {
      final message = <String, dynamic>{
        'msg': 'method',
        'method': method,
        'params': params,
        'id': id,
      };

      if (_authToken != null) {
        message['token'] = _authToken!;
      }

      await _sendMessage(message);

      final response = await completer.future.timeout(
        const Duration(seconds: 30),
        onTimeout: () {
          _pendingMethods.remove(id);
          throw Exception('Method call to $method timed out after 30 seconds');
        },
      );

      return response;
    } catch (e) {
      _pendingMethods.remove(id);
      rethrow;
    }
  }

  Future<void> _sendMessage(Map<String, dynamic> message) async {
    if (!isConnectedInternal) {
      throw Exception('Not connected to Meteor server');
    }
    _channel.sink.add(jsonEncode(message));
  }

  void _sendAuth() {
    // Send login method call with auth token
    final id = (++_methodId).toString();
    // Reuse existing completer if one is waiting, otherwise create new one
    _authCompleter ??= Completer<void>();
    _pendingMethods[id] = _authCompleter!;
    
    final method = {
      'msg': 'method',
      'method': 'login',
      'params': [
        {
          'resume': _authToken,
        }
      ],
      'id': id,
    };
    _channel.sink.add(jsonEncode(method));
  }

  void _handleMessage(Map<String, dynamic> message) {
    final msg = message['msg'] as String?;

    switch (msg) {
      case 'connected':
        isConnectedInternal = true;
        // Send authentication if available
        if (_authToken != null && _authUserId != null) {
          _sendAuth();
        }
        break;
      case 'added':
        final collection = message['collection'] as String?;
        final id = message['id'] as String?;
        final fields = message['fields'] as Map<String, dynamic>?;
        
        if (collection != null && id != null) {
          if (!collections.containsKey(collection)) {
            collections[collection] = {};
          }
          collections[collection]![id] = {
            '_id': id,
            ...?fields,
          };
        }
        break;
      case 'changed':
        final collection = message['collection'] as String?;
        final id = message['id'] as String?;
        final fields = message['fields'] as Map<String, dynamic>?;
        
        if (collection != null && id != null && fields != null) {
          final doc = collections[collection]?[id];
          if (doc != null) {
            doc.addAll(fields);
          }
        }
        break;
      case 'removed':
        final collection = message['collection'] as String?;
        final id = message['id'] as String?;
        
        if (collection != null && id != null) {
          collections[collection]?.remove(id);
        }
        break;
      case 'ready':
        final subId = message['subs'] as List?;
        if (subId != null && subId.isNotEmpty) {
          final subscription = subscriptions[subId[0]];
          if (subscription != null && subscription['ready'] is Completer) {
            final completer = subscription['ready'] as Completer;
            // Remove to prevent double-completion if server sends multiple ready messages
            subscription.remove('ready');
            if (!completer.isCompleted) {
              completer.complete();
            }
          }
        }
        break;
      case 'result':
        final id = message['id'] as String?;
        final error = message['error'] as Map<String, dynamic>?;
        final resultData = message['result'];
        
        if (id != null && _pendingMethods.containsKey(id)) {
          final completer = _pendingMethods.remove(id);
          
          if (error != null) {
            final errorMessage = error['reason'] ?? error['message'] ?? 'Unknown error';
            final errorCode = error['error']?.toString();
            
            if (errorCode == '403' || errorCode == '401' || 
                errorMessage.toString().toLowerCase().contains('not authorized') ||
                errorMessage.toString().toLowerCase().contains('not logged in')) {
              onAuthError?.call();
            }
            
            completer?.completeError(
              Exception(errorMessage),
            );
          } else {
            // Handle various result types: Map, String, or other types
            dynamic result;
            if (resultData is Map<String, dynamic>) {
              result = resultData;
            } else if (resultData is String) {
              result = resultData;
            } else if (resultData != null) {
              result = resultData;
            } else {
              result = {};
            }
            completer?.complete(result);
          }
        }
        break;
      case 'error':
        final id = message['id'] as String?;
        final error = message['error'] as Map<String, dynamic>?;
        
        if (id != null && _pendingMethods.containsKey(id)) {
          final completer = _pendingMethods.remove(id);
          final errorMessage = error?['message'] ?? 'Unknown error';
          completer?.completeError(
            Exception('Meteor error: $errorMessage'),
          );
        }
        break;
    }

    _messageController.add(MeteorMessage(message));
  }

  Map<String, dynamic> getSubscriptionData(String subscriptionName) {
    for (final sub in subscriptions.values) {
      if (sub['name'] == subscriptionName) {
        return sub;
      }
    }
    return {};
  }

  List<Map<String, dynamic>> getCollectionDocuments(String collectionName) {
    final docs = collections[collectionName];
    if (docs == null) return [];
    return docs.values.cast<Map<String, dynamic>>().toList();
  }
}

class MeteorMessage {
  final Map<String, dynamic> data;
  MeteorMessage(this.data);
}
