import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
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
  Completer<void>? _connectionCompleter;
  String? _loginMethodId;
  void Function()? onAuthError;

  void setAuth(String token, String userId) {
    if (kDebugMode) {
      print('[MeteorClient] setAuth: token=${token.isNotEmpty ? "..." : "EMPTY"}, userId=$userId');
    }
    
    final bool tokenChanged = _authToken != token;
    _authToken = token;
    _authUserId = userId;
    
    if (tokenChanged) {
      // reset auth completer since we have new credentials
      _authCompleter = null;
      
      // If we are already connected, trigger the login immediately
      if (isConnectedInternal && token.isNotEmpty) {
        if (kDebugMode) {
          print('[MeteorClient] Already connected, triggering login for new token...');
        }
        _sendAuth();
      }
    }
  }

  void clearAuth() {
    if (kDebugMode) {
      print('[MeteorClient] clearAuth');
    }
    _authToken = null;
    _authUserId = null;
    _authCompleter = null;
  }

  Future<void> waitForAuth() async {
    // If no token, we can't authenticate anyway
    if (_authToken == null || _authToken!.isEmpty) {
      if (kDebugMode) {
        print('[MeteorClient] No auth token available, skipping wait');
      }
      return; 
    }
    
    if (!isConnectedInternal) {
      if (kDebugMode) {
        print('[MeteorClient] Not connected, triggering connect from waitForAuth');
      }
      await connect();
    }
    
    // Ensure we have a completer and wait for it
    if (_authCompleter == null) {
      if (kDebugMode) {
        print('[MeteorClient] No active auth completer, triggering session login');
      }
      _sendAuth();
    }
    
    if (kDebugMode && !_authCompleter!.isCompleted) {
      print('[MeteorClient] Waiting for authentication to complete...');
    }
    
    try {
      await _authCompleter!.future.timeout(
        const Duration(seconds: 15),
        onTimeout: () {
          if (kDebugMode) {
            print('[MeteorClient] Auth timeout - session might be unauthenticated');
          }
          throw Exception('Authentication timed out. Please try again.');
        },
      );
    } catch (e) {
      if (kDebugMode) {
        print('[MeteorClient] Auth failure: $e');
      }
      rethrow;
    }
  }

  bool get isConnected => isConnectedInternal;
  Stream<MeteorMessage> get messages => _messageController.stream;
  String? get authToken => _authToken;
  String? get authUserId => _authUserId;

  Future<void> connect() async {
    // If already connecting, return current future
    if (_connectionCompleter != null && !_connectionCompleter!.isCompleted) {
      return _connectionCompleter!.future;
    }

    try {
      _connectionCompleter = Completer<void>();
      isConnectedInternal = false;
      
      final wsUrl = serverUrl.replaceFirst('http://', 'ws://');
      if (kDebugMode) {
        print('[MeteorClient] Connecting to $wsUrl...');
      }
      _channel = WebSocketChannel.connect(Uri.parse('$wsUrl/websocket'));

      _channel.stream.listen(
        (message) {
          final json = jsonDecode(message as String) as Map<String, dynamic>;
          _handleMessage(json);
        },
        onError: (error) {
          if (kDebugMode) print('[MeteorClient] WebSocket Error: $error');
          isConnectedInternal = false;
          if (!_connectionCompleter!.isCompleted) {
            _connectionCompleter!.completeError(error);
          }
        },
        onDone: () {
          if (kDebugMode) print('[MeteorClient] WebSocket Closed');
          isConnectedInternal = false;
          if (!_connectionCompleter!.isCompleted) {
            _connectionCompleter!.complete();
          }
        },
      );

      // Send connect message
      _channel.sink.add(jsonEncode({'msg': 'connect', 'version': '1', 'support': ['1']}));
      
      // Wait for 'connected' message from server
      await _connectionCompleter!.future.timeout(
        const Duration(seconds: 10),
        onTimeout: () {
          throw Exception('Timeout waiting for DDP connected message');
        },
      );
    } catch (e) {
      isConnectedInternal = false;
      _connectionCompleter = null;
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
    if (_authToken == null || _authToken!.isEmpty) return;
    
    // If a login is already pending, don't send another
    if (_loginMethodId != null && _pendingMethods.containsKey(_loginMethodId)) {
      return;
    }

    final id = (++_methodId).toString();
    _loginMethodId = id;
    
    // Reuse existing completer if one is waiting, otherwise create new one
    _authCompleter ??= Completer<void>();
    _pendingMethods[id] = _authCompleter!;
    
    if (kDebugMode) {
      print('[MeteorClient] Sending login method request (id: $id)...');
    }
    
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
        if (kDebugMode) print('[MeteorClient] DDP session connected');
        if (_connectionCompleter != null && !_connectionCompleter!.isCompleted) {
          _connectionCompleter!.complete();
        }
        
        // Send authentication if available
        if (_authToken != null && _authToken!.isNotEmpty) {
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
            
            if (kDebugMode) {
              print('[MeteorClient] Method $id error: $errorMessage ($errorCode)');
            }

            if (errorCode == '403' || errorCode == '401' || 
                errorMessage.toString().toLowerCase().contains('not authorized') ||
                errorMessage.toString().toLowerCase().contains('not logged in')) {
              onAuthError?.call();
            }
            
            if (completer != null && !completer.isCompleted) {
              completer.completeError(
                Exception(errorMessage),
              );
            }
          } else {
            // Handle login result specially
            if (id == _loginMethodId) {
              _loginMethodId = null;
              if (resultData is Map<String, dynamic> && resultData.containsKey('id')) {
                _authUserId = resultData['id'];
                if (kDebugMode) {
                  print('[MeteorClient] Login successful for user: $_authUserId');
                }
              }
            }

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

            if (completer != null && !completer.isCompleted) {
              completer.complete(result);
            }
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
