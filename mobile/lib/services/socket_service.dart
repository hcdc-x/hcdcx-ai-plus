import 'package:socket_io_client/socket_io_client.dart' as io;
import '../utils/constants.dart';

class SocketService {
  io.Socket? _socket;
  bool _isConnected = false;
  final Map<String, List<Function(dynamic)>> _listeners = {};

  bool get isConnected => _isConnected;

  void connect(String token) {
    if (_socket?.connected == true) return;

    _socket = io.io(
      Constants.wsBaseUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .enableAutoConnect()
          .setAuth({'token': token})
          .build(),
    );

    _socket!.onConnect((_) {
      _isConnected = true;
      print('Socket connected');
    });

    _socket!.onDisconnect((_) {
      _isConnected = false;
      print('Socket disconnected');
    });

    _socket!.onConnectError((err) {
      _isConnected = false;
      print('Socket connect error: $err');
    });

    // 重新绑定之前注册的监听器
    _listeners.forEach((event, callbacks) {
      for (var cb in callbacks) {
        _socket!.on(event, (data) => cb(data));
      }
    });
  }

  void disconnect() {
    _socket?.disconnect();
    _socket = null;
    _isConnected = false;
  }

  void on(String event, Function(dynamic) callback) {
    if (_listeners.containsKey(event)) {
      _listeners[event]!.add(callback);
    } else {
      _listeners[event] = [callback];
    }
    _socket?.on(event, (data) => callback(data));
  }

  void off(String event) {
    _listeners.remove(event);
    _socket?.off(event);
  }

  void emit(String event, [dynamic data]) {
    _socket?.emit(event, data);
  }
}
