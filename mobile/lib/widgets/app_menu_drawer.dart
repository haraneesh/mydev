import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../config/theme.dart';
import '../screens/public/cart_screen.dart';
import '../screens/public/home_screen.dart';
import '../screens/public/login_screen.dart';
import '../screens/public/pending_orders_screen.dart';
import '../screens/public/user_profile_screen.dart';
import '../screens/public/invoice_list_screen.dart';
import '../screens/public/refund_list_screen.dart';
import '../screens/public/payment_dashboard_screen.dart';

class AppMenuDrawer extends StatelessWidget {
  const AppMenuDrawer({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: Colors.white,
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          DrawerHeader(
            decoration: const BoxDecoration(color: AppColors.primary),
            child: Consumer<AuthProvider>(
              builder: (context, authProvider, _) {
                final user = authProvider.currentUser;
                final displayName = user != null && user.salutation != null && user.firstName != null
                    ? '${user.salutation} ${user.firstName}'
                    : 'Guest';
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Text(
                      displayName,
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        color: Colors.white,
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
          ListTile(
            leading: const Icon(Icons.store, color: AppColors.textPrimary),
            title: const Text('Place Order', style: TextStyle(color: AppColors.textPrimary)),
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const HomeScreen()),
              );
            },
          ),
          ListTile(
            leading: const Icon(Icons.shopping_bag, color: AppColors.textPrimary),
            title: const Text('Cart', style: TextStyle(color: AppColors.textPrimary)),
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const CartScreen()),
              );
            },
          ),
          Consumer<AuthProvider>(
            builder: (context, authProvider, _) {
              if (authProvider.isLoggedInUser) {
                return ListTile(
                  leading: const Icon(Icons.update, color: AppColors.textPrimary),
                  title: const Text('Pending Orders', style: TextStyle(color: AppColors.textPrimary)),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const PendingOrdersScreen()),
                    );
                  },
                );
              }
              return const SizedBox.shrink();
            },
          ),
          Consumer<AuthProvider>(
            builder: (context, authProvider, _) {
              if (authProvider.isLoggedInUser) {
                return ListTile(
                  leading: const Icon(Icons.receipt_long, color: AppColors.textPrimary),
                  title: const Text('Invoices', style: TextStyle(color: AppColors.textPrimary)),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const InvoiceListScreen()),
                    );
                  },
                );
              }
              return const SizedBox.shrink();
            },
          ),
          Consumer<AuthProvider>(
            builder: (context, authProvider, _) {
              if (authProvider.isLoggedInUser) {
                return ListTile(
                  leading: const Icon(Icons.receipt, color: AppColors.textPrimary),
                  title: const Text('Refunds', style: TextStyle(color: AppColors.textPrimary)),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const RefundListScreen()),
                    );
                  },
                );
              }
              return const SizedBox.shrink();
            },
          ),
          Consumer<AuthProvider>(
            builder: (context, authProvider, _) {
              if (authProvider.isLoggedInUser) {
                return ListTile(
                  leading: const Icon(Icons.payment, color: AppColors.textPrimary),
                  title: const Text('Payments', style: TextStyle(color: AppColors.textPrimary)),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const PaymentDashboardScreen()),
                    );
                  },
                );
              }
              return const SizedBox.shrink();
            },
          ),
          Consumer<AuthProvider>(
            builder: (context, authProvider, _) {
              if (authProvider.isLoggedInUser) {
                return ListTile(
                  leading: const Icon(Icons.person, color: AppColors.textPrimary),
                  title: const Text('Profile', style: TextStyle(color: AppColors.textPrimary)),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const UserProfileScreen()),
                    );
                  },
                );
              }
              return const SizedBox.shrink();
            },
          ),
          Consumer<AuthProvider>(
            builder: (context, authProvider, _) {
              if (authProvider.isLoggedInUser) {
                return const Divider();
              }
              return const SizedBox.shrink();
            },
          ),
          Consumer<AuthProvider>(
            builder: (context, authProvider, _) {
              final isGuest = authProvider.isGuest;
              return ListTile(
                leading: Icon(isGuest ? Icons.login : Icons.logout, color: AppColors.textPrimary),
                title: Text(isGuest ? 'Login' : 'Logout', style: const TextStyle(color: AppColors.textPrimary)),
                onTap: () async {
                  Navigator.pop(context);
                  if (isGuest) {
                    if (context.mounted) {
                      Navigator.of(context).pushReplacement(
                        MaterialPageRoute(builder: (context) => const LoginScreen()),
                      );
                    }
                  } else {
                    await authProvider.logout();
                  }
                },
              );
            },
          ),
        ],
      ),
    );
  }
}
