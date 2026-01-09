import 'dart:async';
import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';

class MeteorClient {
  final String serverUrl;
  late WebSocketChannel _channel;
  final Map<String, dynamic> subscriptions = {};
  final Map<String, Map<String, dynamic>> collections = {};
  final StreamController<MeteorMessage> _messageController =
      StreamController.broadcast();
  final Map<String, Completer<Map<String, dynamic>>> _pendingMethods = {};
  bool isConnectedInternal = false;
  int _methodId = 0;
  String? _authToken;

  MeteorClient({required this.serverUrl});

  void setAuth(String token, String userId) {
    _authToken = token;
  }

  void clearAuth() {
    _authToken = null;
  }

  bool get isConnected => isConnectedInternal;
  Stream<MeteorMessage> get messages => _messageController.stream;

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

  Future<void> subscribe(String name, {Map<String, dynamic>? params}) async {
    final id = DateTime.now().millisecondsSinceEpoch.toString();
    final subscription = <String, dynamic>{
      'msg': 'sub',
      'id': id,
      'name': name,
    };
    if (params != null) {
      subscription['params'] = [params];
    }

    final readyCompleter = Completer<void>();
    subscriptions[id] = <String, dynamic>{
      'name': name,
      'params': params,
      'ready': readyCompleter,
    };

    await _sendMessage(subscription);
    
    await readyCompleter.future.timeout(
      Duration(seconds: 5),
      onTimeout: () {
        throw Exception('Subscription to $name timed out after 5 seconds');
      },
    );
  }

  Future<Map<String, dynamic>> call(
    String method,
    List<dynamic> params,
  ) async {
    if (!isConnectedInternal) {
      throw Exception('Not connected to Meteor server');
    }

    final id = (++_methodId).toString();
    final completer = Completer<Map<String, dynamic>>();
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

  void _handleMessage(Map<String, dynamic> message) {
    final msg = message['msg'] as String?;

    switch (msg) {
      case 'connected':
        isConnectedInternal = true;
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
            (subscription['ready'] as Completer).complete();
          }
        }
        break;
      case 'result':
        final id = message['id'] as String?;
        final result = message['result'] as Map<String, dynamic>?;
        
        if (id != null && _pendingMethods.containsKey(id)) {
          final completer = _pendingMethods.remove(id);
          completer?.complete(result ?? {});
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
