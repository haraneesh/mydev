import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../models/product.dart';
import '../../providers/cart_provider.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/app_bar_with_logo.dart';
import '../../widgets/background_widget.dart';
import 'order_confirmation_screen.dart';
import 'sign_up_screen.dart';

class CheckoutData {
  final String name;
  final String phone;
  final String address;
  final List<CartItem> items;
  final double totalAmount;
  final String? notes;

  CheckoutData({
    required this.name,
    required this.phone,
    required this.address,
    required this.items,
    required this.totalAmount,
    this.notes,
  });
}

class CheckoutScreen extends StatefulWidget {
  final Function(CheckoutData)? onOrderPlaced;
  final Map<String, dynamic>? userProfileData;

  const CheckoutScreen({
    this.onOrderPlaced,
    this.userProfileData,
    super.key,
  });

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _notesController = TextEditingController();
  bool _isLoading = false;
  static const int _maxNotesLength = 500;

  @override
  void initState() {
    super.initState();
    _populateFormWithUserData();
  }
  
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Re-populate form data if user logged in after signup
    final authProvider = context.read<AuthProvider>();
    if (authProvider.currentUser != null && authProvider.currentUser!.id != 'guest') {
      _populateFormWithAuthProvider(authProvider);
    }
  }
  
  /// Populate notes field when returning from signup screen
  void _populateNotesFromSignup(String? notes) {
    debugPrint('[CheckoutScreen] _populateNotesFromSignup called with: $notes');
    debugPrint('[CheckoutScreen] Current notes in controller: ${_notesController.text}');
    if (notes != null && notes.isNotEmpty && _notesController.text.isEmpty) {
      _notesController.text = notes;
      debugPrint('[CheckoutScreen] Notes restored to controller: ${_notesController.text}');
      setState(() {}); // Trigger rebuild to show notes and update character count
    }
  }

  /// Populate form fields with user profile data if available
  void _populateFormWithUserData() {
    if (widget.userProfileData != null) {
      // Construct full name from firstName and lastName or use name field
      final firstName = widget.userProfileData!['firstName'] as String?;
      final lastName = widget.userProfileData!['lastName'] as String?;
      final name = widget.userProfileData!['name'] as String?;
      
      final fullName = _buildFullName(firstName, lastName) ?? name ?? '';
      
      _nameController.text = fullName;
      _phoneController.text = widget.userProfileData!['phone'] as String? ?? '';
      _addressController.text = widget.userProfileData!['deliveryAddress'] as String? ?? '';
    }
  }
  
  /// Populate form fields from AuthProvider when user logs in after signup
  void _populateFormWithAuthProvider(AuthProvider authProvider) {
    final user = authProvider.currentUser;
    if (user != null) {
      final fullName = _buildFullName(user.firstName, user.lastName) ?? user.name ?? '';
      _nameController.text = fullName;
      _phoneController.text = user.phone ?? '';
      _addressController.text = user.deliveryAddress ?? '';
    }
  }

  /// Build full name from first and last name
  String? _buildFullName(String? firstName, String? lastName) {
    final first = firstName?.trim() ?? '';
    final last = lastName?.trim() ?? '';
    
    if (first.isEmpty && last.isEmpty) return null;
    return '$first $last'.trim();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  String? _validatePhone(String? value) {
    if (value == null || value.isEmpty) {
      return 'Phone number is required';
    }
    if (value.length != 10 || !RegExp(r'^[0-9]+$').hasMatch(value)) {
      return 'Phone number must be 10 digits';
    }
    return null;
  }

  Future<void> _submitOrder() async {
    final authProvider = context.read<AuthProvider>();
    final isLoggedIn = authProvider.currentUser != null && 
        authProvider.currentUser!.id != 'guest';
    
    // For guests, validate phone field exists
    if (!isLoggedIn) {
      if (!_formKey.currentState!.validate()) {
        return;
      }
      
      // Validate phone exists in system
      await _validatePhoneAndPlaceOrder(_phoneController.text);
      return;
    }

    // For logged-in users, proceed directly with their phone from profile
    await _placeOrder(_phoneController.text);
  }

  Future<void> _validatePhoneAndPlaceOrder(String phone) async {
    setState(() => _isLoading = true);

    try {
      final cartProvider = context.read<CartProvider>();
      final orderService = cartProvider.orderService;
      
      // Check if phone exists using OrderService
      final phoneExists = await orderService.checkPhoneExists(phone);

      if (!phoneExists) {
        // Phone not registered
        if (mounted) {
          setState(() => _isLoading = false);
          _showPhoneNotRegisteredAlert(phone);
        }
      } else {
        // Phone is registered, proceed with order
        if (mounted) {
          await _placeOrder(phone);
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error validating phone: ${e.toString()}')),
        );
      }
    }
  }

  void _showPhoneNotRegisteredAlert(String phone) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('New User?'),
        content: const Text(
          'If you are new to Suvai, please sign up. This mobile number is not registered with us.',
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
            onPressed: () => Navigator.pop(context),
            child: Text(
              'CANCEL',
              style: getButtonTextStyle(),
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.secondary,
              foregroundColor: Colors.white,
            ),
            onPressed: () async {
              // Capture current notes before navigating to signup
              final currentNotes = _notesController.text.trim();
              Navigator.pop(context);
              final returnedNotes = await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => SignUpScreen(
                    prefillPhone: phone,
                    placeOrderAfterSignup: true,
                    prefillNotes: currentNotes.isNotEmpty ? currentNotes : null,
                  ),
                ),
              );
              // Restore notes if they were passed back
              if (returnedNotes is String) {
                _populateNotesFromSignup(returnedNotes);
              }
            },
            child: Text(
              'SIGN UP',
              style: getButtonTextStyle(),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _placeOrder(String phone) async {
    setState(() => _isLoading = true);

    try {
      final cartProvider = context.read<CartProvider>();
      final authProvider = context.read<AuthProvider>();
      final totalAmount = cartProvider.totalAmount;
      final isLoggedIn = authProvider.currentUser != null && 
          authProvider.currentUser!.id != 'guest';
      
      // Check if user is logged in and their clearCartAfterOrder preference
      bool shouldClearCart = true;
      if (isLoggedIn) {
        shouldClearCart = authProvider.currentUser!.clearCartAfterOrder;
      }
      
      // For guests, use phone as name and empty address
      // For logged-in users, use the form values
      final name = isLoggedIn ? _nameController.text : phone;
      final address = isLoggedIn ? _addressController.text : 'To be collected after signup';
      
      // Only include available items in checkout
      final notesText = _notesController.text.trim();
      debugPrint('[CheckoutScreen._placeOrder] Notes text: "$notesText"');
      final checkoutData = CheckoutData(
        name: name,
        phone: phone,
        address: address,
        items: cartProvider.availableItems,
        totalAmount: totalAmount,
        notes: notesText.isNotEmpty ? notesText : null,
      );
      debugPrint('[CheckoutScreen._placeOrder] CheckoutData notes: ${checkoutData.notes}');

      String orderId;
      if (widget.onOrderPlaced != null) {
        await widget.onOrderPlaced!(checkoutData);
        orderId = 'ORD-${DateTime.now().millisecondsSinceEpoch}';
      } else {
        orderId = await cartProvider.placeOrder(
          checkoutData,
          clearCart: shouldClearCart,
          userId: isLoggedIn ? authProvider.currentUser!.id : null,
        );
      }

      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => OrderConfirmationScreen(
              orderId: orderId,
              totalAmount: totalAmount,
              name: checkoutData.name,
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return BackgroundWidget(
      child: Scaffold(
        extendBodyBehindAppBar: false,
        appBar: const AppBarWithLogo(),
        body: Consumer<CartProvider>(
          builder: (context, cartProvider, child) {
            return SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Page Title
                  Text(
                    'Order Summary',
                    style: Theme.of(context).textTheme.displaySmall?.copyWith(
                      color: const Color(0xFF2f2215),
                    ),
                  ),
                  const SizedBox(height: 24),
                  
                  // Order Summary Section
                  Card(
                    color: Colors.white,
                    elevation: 1,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                      side: BorderSide(color: Colors.grey[200]!, width: 1),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Order Items',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w700,
                              color: const Color(0xFF2f2215),
                            ),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '${cartProvider.itemCount} items',
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: const Color(0xFF514732),
                                ),
                              ),
                              Text(
                                '₹${cartProvider.totalAmount.toStringAsFixed(0)}',
                                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.w700,
                                  color: const Color(0xFFe04a06),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  
                  // Delivery Details Card
                  Card(
                    color: Colors.white,
                    elevation: 1,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                      side: BorderSide(color: Colors.grey[200]!, width: 1),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Delivery Details',
                            style: GoogleFonts.nunito(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: const Color(0xFF2f2215),
                            ),
                          ),
                          const SizedBox(height: 16),
                          Form(
                            key: _formKey,
                            child: Consumer<AuthProvider>(
                              builder: (context, authProvider, _) {
                                final isLoggedIn = authProvider.currentUser != null && 
                                    authProvider.currentUser!.id != 'guest';
                                return Column(
                                  children: [
                                    // For guests only: show phone field for verification
                                    if (!isLoggedIn) ...[
                                      TextFormField(
                                        controller: _phoneController,
                                        decoration: InputDecoration(
                                          labelText: 'Phone Number',
                                          hintText: 'Enter 10-digit phone number',
                                          labelStyle: const TextStyle(color: Color(0xFF514732)),
                                        ),
                                        style: const TextStyle(color: Color(0xFF2f2215)),
                                        keyboardType: TextInputType.phone,
                                        validator: _validatePhone,
                                      ),
                                      const SizedBox(height: 24),
                                    ] else ...[
                                      // For logged-in users: show profile info (read-only)
                                      Container(
                                        padding: const EdgeInsets.all(12),
                                        decoration: BoxDecoration(
                                          color: Colors.grey[50],
                                          borderRadius: BorderRadius.circular(8),
                                          border: Border.all(color: Colors.grey[300]!, width: 1),
                                        ),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            const SizedBox(height: 12),
                                            Row(
                                              children: [
                                                Text(
                                                  'Name: ',
                                                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                                    fontWeight: FontWeight.w600,
                                                  ),
                                                ),
                                                Text(
                                                  _nameController.text,
                                                  style: Theme.of(context).textTheme.bodyMedium,
                                                ),
                                              ],
                                            ),
                                            const SizedBox(height: 8),
                                            Row(
                                              children: [
                                                Text(
                                                  'Phone: ',
                                                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                                    fontWeight: FontWeight.w600,
                                                  ),
                                                ),
                                                Text(
                                                  _phoneController.text,
                                                  style: Theme.of(context).textTheme.bodyMedium,
                                                ),
                                              ],
                                            ),
                                            const SizedBox(height: 8),
                                            Row(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  'Address: ',
                                                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                                    fontWeight: FontWeight.w600,
                                                  ),
                                                ),
                                                Expanded(
                                                  child: Text(
                                                    _addressController.text,
                                                    style: Theme.of(context).textTheme.bodyMedium,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                      const SizedBox(height: 24),
                                    ],
                                    // Notes Section
                                    Align(
                                      alignment: Alignment.centerLeft,
                                      child: Text(
                                        'Add Notes for the Packing Team',
                                        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                          fontWeight: FontWeight.w600,
                                          color: const Color(0xFF2f2215),
                                        ),
                                        textAlign: TextAlign.left,
                                      ),
                                    ),
                                    const SizedBox(height: 12),
                                    TextFormField(
                                      controller: _notesController,
                                      decoration: InputDecoration(
                                        hintText: 'Add any special instructions or notes for this order',
                                        helperText: '${_notesController.text.length}/$_maxNotesLength characters',
                                        helperStyle: TextStyle(color: Colors.brown[300]),
                                        border: OutlineInputBorder(
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                      ),
                                      style: const TextStyle(color: Color(0xFF2f2215)),
                                      maxLines: 4,
                                      maxLength: _maxNotesLength,
                                      onChanged: (value) => setState(() {}),
                                    ),
                                  ],
                                );
                              },
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                  
                  // Place Order Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFe04a06),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      onPressed: _isLoading ? null : _submitOrder,
                      child: _isLoading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                              ),
                            )
                          : Text(
                            'PLACE ORDER',
                            style: getButtonTextStyle(),
                          ),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
