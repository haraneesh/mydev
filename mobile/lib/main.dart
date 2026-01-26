import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:provider/provider.dart';
import 'config/theme.dart';
import 'config/onesignal_config.dart';
import 'models/auth_state.dart';
import 'models/invoice.dart';
import 'providers/cart_provider.dart';
import 'providers/auth_provider.dart';
import 'screens/public/home_screen.dart';
import 'screens/public/login_screen.dart';
import 'services/meteor_client.dart';
import 'services/order_service.dart';
import 'services/auth_service.dart';
import 'services/settings_service.dart';
import 'services/onesignal_service.dart';
import 'screens/public/payment_dashboard_screen.dart';
import 'screens/public/select_invoices_for_payment_screen.dart';
import 'screens/public/payment_status_screen.dart';
import 'services/payment_session_manager.dart';
import 'services/invoice_cache_manager.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Load environment variables from .env file
  await dotenv.load(fileName: '.env');

  // Initialize OneSignal
  try {
    final appId = OneSignalConfig.getAppId();
    await OneSignalService.initialize(appId);
    OneSignalConfig.logConfigStatus();
    OneSignalService.logStatus();
  } catch (e) {
    debugPrint('❌ Failed to initialize OneSignal: $e');
    // Continue app startup even if OneSignal fails
  }

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
    meteorClient.setAuth('', '');
    orderService = OrderService.instance;
    authService = AuthService(meteorClient: meteorClient);
    
    settingsService = SettingsService.instance;
    settingsService.setMeteorClient(meteorClient);
    settingsService.clearCache();
    
    _initializePaymentServices();
    _initializeMeteorConnection();
  }
  
  
  Future<void> _initializePaymentServices() async {
    try {
      await Future.wait([
        PaymentSessionManager.instance.initialize(),
        InvoiceCacheManager.instance.initialize(),
      ]);
      
      debugPrint('✅ Payment services initialized');
    } catch (e) {
      debugPrint('❌ Failed to initialize payment services: $e');
    }
  }
  
  Future<void> _initializeMeteorConnection() async {
    try {
      if (!meteorClient.isConnected) {
        await meteorClient.connect();
        debugPrint('✅ Meteor connected');
      }
    } catch (e) {
      debugPrint('❌ Failed to connect to Meteor: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) {
            final authProvider = AuthProvider(authService: authService);
            
            meteorClient.onAuthError = () async {
              debugPrint('[Auth] Authentication error detected, logging out...');
              try {
                await authProvider.logout();
              } catch (e) {
                debugPrint('[Auth] Error during logout: $e');
              }
            };
            
            authProvider.restoreAuthState();
            return authProvider;
          },
        ),
        ChangeNotifierProvider(
          create: (_) => CartProvider(orderService: orderService),
        ),
        Provider<OneSignalService>.value(
          value: OneSignalService.instance,
        ),
      ],
      child: MaterialApp(
        title: 'Suvai',
        theme: buildAppTheme(),
        home: const AuthRouter(),
        routes: {
          '/payments': (context) => const PaymentDashboardScreen(),
          '/payments/select-invoices': (context) {
            final args = ModalRoute.of(context)?.settings.arguments;
            List<Invoice>? preSelectedInvoices;
            
            if (args is List) {
              preSelectedInvoices = args.cast<Invoice>();
            }
            
            return SelectInvoicesForPaymentScreen(
              preSelectedInvoices: preSelectedInvoices,
            );
          },
          '/payments/status': (context) {
            final args = ModalRoute.of(context)?.settings.arguments;
            
            if (args is Map<String, dynamic>) {
              return PaymentStatusScreen(
                selectedInvoices: args['selectedInvoices'] as List<Invoice>,
                orderId: args['orderId'] as String?,
                isSuccess: args['isSuccess'] as bool? ?? false,
                errorMessage: args['errorMessage'] as String?,
              );
            }
            
            // Fallback for old argument style
            if (args is List) {
              return PaymentStatusScreen(
                selectedInvoices: args.cast<Invoice>(),
              );
            }
            
            return const PaymentStatusScreen(selectedInvoices: []);
          },
        },
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
