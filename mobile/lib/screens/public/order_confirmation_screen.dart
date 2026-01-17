import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/app_bar_with_logo.dart';
import '../../widgets/background_widget.dart';
import 'home_screen.dart';
import 'cart_screen.dart';
import 'user_profile_screen.dart';

class OrderConfirmationScreen extends StatelessWidget {
  final String orderId;
  final double totalAmount;
  final String name;

  const OrderConfirmationScreen({
    required this.orderId,
    required this.totalAmount,
    required this.name,
    super.key,
  });

  Widget _buildGoodItem(BuildContext context, String imagePath, String title, String description) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Image.asset(
          imagePath,
          width: 48,
          height: 48,
          fit: BoxFit.contain,
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFF2f2215),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                description,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: const Color(0xFF514732),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return BackgroundWidget(
      child: Scaffold(
         extendBodyBehindAppBar: false,
         appBar: AppBarWithLogo(
           showLeading: true,
           leading: Builder(
             builder: (context) => IconButton(
               icon: const Icon(Icons.menu),
               onPressed: () => Scaffold.of(context).openDrawer(),
             ),
           ),
         ),
         drawer: Drawer(
           backgroundColor: Colors.white,
           child: ListView(
             padding: EdgeInsets.zero,
             children: [
               DrawerHeader(
                 decoration: const BoxDecoration(color: AppColors.primary),
                 child: Consumer<AuthProvider>(
                   builder: (context, authProvider, _) {
                     return Column(
                       crossAxisAlignment: CrossAxisAlignment.start,
                       mainAxisAlignment: MainAxisAlignment.end,
                       children: [
                         Text(
                           'Suvai',
                           style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                             color: Colors.white,
                           ),
                         ),
                         const SizedBox(height: 4),
                         Text(
                           authProvider.currentUser?.phone ?? 'Guest',
                           style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                             color: Colors.white,
                           ),
                         ),
                       ],
                     );
                   },
                 ),
               ),
               ListTile(
                 leading: const Icon(Icons.home),
                 title: const Text('Home'),
                 onTap: () {
                   Navigator.pop(context);
                   Navigator.pushReplacement(
                     context,
                     MaterialPageRoute(builder: (_) => const HomeScreen()),
                   );
                 },
               ),
               ListTile(
                 leading: const Icon(Icons.shopping_bag),
                 title: const Text('Cart'),
                 onTap: () {
                   Navigator.pop(context);
                   Navigator.push(
                     context,
                     MaterialPageRoute(builder: (_) => const CartScreen()),
                   );
                 },
               ),
               ListTile(
                 leading: const Icon(Icons.person),
                 title: const Text('Profile'),
                 onTap: () {
                   Navigator.pop(context);
                   Navigator.push(
                     context,
                     MaterialPageRoute(builder: (_) => const UserProfileScreen()),
                   );
                 },
               ),
               const Divider(),
               ListTile(
                 leading: const Icon(Icons.logout),
                 title: const Text('Logout'),
                 onTap: () async {
                   Navigator.pop(context);
                   final authProvider = context.read<AuthProvider>();
                   await authProvider.logout();
                 },
               ),
             ],
           ),
         ),
        body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
            children: [
            const SizedBox(height: 32),
            Card(
              color: Colors.white,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Order ID',
                          style: GoogleFonts.nunito(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFF2f2215),
                          ),
                        ),
                        SelectableText(
                          orderId,
                          style: GoogleFonts.nunito(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFF2f2215),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Customer Name',
                          style: GoogleFonts.nunito(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFF2f2215),
                          ),
                        ),
                        Text(
                          name,
                          style: GoogleFonts.nunito(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFF2f2215),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Total Amount',
                          style: GoogleFonts.nunito(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFF2f2215),
                          ),
                        ),
                        Text(
                          '₹${totalAmount.toStringAsFixed(0)}',
                          style: GoogleFonts.nunito(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFF2f2215),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 32),
            // Thank You & Order Details Section
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(color: Colors.grey[200]!, width: 1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Icon(
                    Icons.check_circle,
                    size: 60,
                    color: Colors.green[600],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    '$name, Thank you for Ordering on Suvai.',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFF2f2215),
                      height: 1.5,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Depending on stock availability, your order will arrive today or tomorrow.',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: const Color(0xFF514732),
                      height: 1.4,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'You can pay after delivery.',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: const Color(0xFF514732),
                      fontWeight: FontWeight.w600,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            // Congratulations Section
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(color: Colors.grey[200]!, width: 1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Congratulations for doing Good',
                    style: GoogleFonts.sourceSerif4(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFF2f2215),
                    ),
                  ),
                  const SizedBox(height: 20),
                  _buildGoodItem(context, 'assets/images/success/food.png', 'Good for You', 'Choosing Nutrition rich wholesome food'),
                  const SizedBox(height: 16),
                  _buildGoodItem(context, 'assets/images/success/junk.png', 'Good for You', 'Limiting highly processed and refined food'),
                  const SizedBox(height: 16),
                  _buildGoodItem(context, 'assets/images/success/safe.png', 'Good for You', 'Avoiding pesticides, artificial colors and preservatives'),
                  const SizedBox(height: 16),
                  _buildGoodItem(context, 'assets/images/success/rural.png', 'Good for Farmers', 'Supporting Rural Economy, through farmers and self help groups'),
                  const SizedBox(height: 16),
                  _buildGoodItem(context, 'assets/images/success/sustainable.png', 'Good for Earth', 'Promoting Sustainable living by doing your bit for the planet'),
                ],
              ),
            ),
          ],
        ),
        ),
        ),
        );
        }
        }
