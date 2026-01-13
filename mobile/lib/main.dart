import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'config/theme.dart';
import 'models/auth_state.dart';
import 'providers/cart_provider.dart';
import 'providers/auth_provider.dart';
import 'screens/public/home_screen.dart';
import 'screens/public/login_screen.dart';
import 'services/meteor_client.dart';
import 'services/order_service.dart';
import 'services/auth_service.dart';
import 'services/settings_service.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  late MeteorClient meteorClient;
  late OrderService orderService;
  late AuthService authService;
  late SettingsService settingsService;

  @override
  void initState() {
    super.initState();
    const String meteorServerUrl = 'http://10.0.2.2:3000';
    meteorClient = MeteorClient(serverUrl: meteorServerUrl);
    orderService = OrderService(meteorClient: meteorClient);
    authService = AuthService(meteorClient: meteorClient);
    
    // Initialize SettingsService and clear cache on app launch
    // This ensures fresh settings are fetched every time the app starts
    settingsService = SettingsService(meteorClient: meteorClient);
    settingsService.clearCache();
    debugPrint('📱 App started - Settings cache cleared, will fetch fresh settings on first request');
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => AuthProvider(authService: authService)..restoreAuthState(),
        ),
        ChangeNotifierProvider(
          create: (_) => CartProvider(orderService: orderService),
        ),
      ],
      child: MaterialApp(
        title: 'Suvai',
        theme: buildAppTheme(),
        home: const AuthRouter(),
      ),
    );
  }
}

class AuthRouter extends StatelessWidget {
  const AuthRouter({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, _) {
        if (authProvider.authState == AuthState.initial) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        if (authProvider.isAuthenticated) {
          return const HomeScreen();
        }

        return const LoginScreen();
      },
    );
  }
}
