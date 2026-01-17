import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../config/preferences.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/app_bar_with_logo.dart';
import '../../widgets/background_widget.dart';
import 'home_screen.dart';
import 'cart_screen.dart';

class UserProfileScreen extends StatefulWidget {
  const UserProfileScreen({super.key});

  @override
  State<UserProfileScreen> createState() => _UserProfileScreenState();
}

class _UserProfileScreenState extends State<UserProfileScreen> {
  final TextEditingController _firstNameController = TextEditingController();
  final TextEditingController _lastNameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _whMobilePhoneController = TextEditingController();
  final TextEditingController _deliveryAddressController = TextEditingController();
  final TextEditingController _deliveryPincodeController = TextEditingController();
  final TextEditingController _newPasswordController = TextEditingController();
  final TextEditingController _confirmPasswordController = TextEditingController();
  
  String? _salutation;
  String? _dietaryPreference;
  String? _packingPreference;
  String? _productUpdatePreference;
  bool _clearCartAfterOrder = false;
  
  bool _isEditing = false;
  bool _isLoading = false;
  String? _errorMessage;
  final Map<String, String> _validationErrors = {};

  @override
  void initState() {
    super.initState();
    final authProvider = context.read<AuthProvider>();
    final user = authProvider.currentUser;
    

    _firstNameController.text = user?.firstName ?? '';
    _lastNameController.text = user?.lastName ?? '';
    _emailController.text = user?.email ?? '';
    _whMobilePhoneController.text = user?.whMobilePhone ?? '';
    _deliveryAddressController.text = user?.deliveryAddress ?? '';
    _deliveryPincodeController.text = user?.deliveryPincode ?? '';
    
    _salutation = user?.salutation;
    _dietaryPreference = user?.dietaryPreference;
    _packingPreference = user?.packingPreference;
    _productUpdatePreference = user?.productUpdatePreference;
    _clearCartAfterOrder = user?.clearCartAfterOrder ?? false;
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _whMobilePhoneController.dispose();
    _deliveryAddressController.dispose();
    _deliveryPincodeController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _logout() async {
    setState(() => _isLoading = true);

    try {
      final authProvider = context.read<AuthProvider>();
      await authProvider.logout();

      if (mounted) {
        Navigator.of(context).popUntil((route) => route.isFirst);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Failed to logout. Please try again.';
        });
      }
    }
  }

  void _validateForm() {
    _validationErrors.clear();

    if (_dietaryPreference == null || _dietaryPreference!.isEmpty) {
      _validationErrors['dietaryPreference'] = 'Dietary preference is mandatory';
    }

    if (_newPasswordController.text.isNotEmpty) {
      if (_newPasswordController.text != _confirmPasswordController.text) {
        _validationErrors['password'] = 'Two passwords do not match, please check';
      }
    }
  }

  Future<void> _saveProfile() async {
    _validateForm();

    if (_validationErrors.isNotEmpty) {
      setState(() {
        _errorMessage = 'Please address errors in form';
      });
      return;
    }

    setState(() => _isLoading = true);

    try {
      final authProvider = context.read<AuthProvider>();
      
      await authProvider.updateProfile(
        emailAddress: _emailController.text,
        salutation: _salutation,
        firstName: _firstNameController.text,
        lastName: _lastNameController.text,
        whMobilePhone: _whMobilePhoneController.text,
        deliveryAddress: _deliveryAddressController.text,
        deliveryPincode: _deliveryPincodeController.text,
        dietPreference: _dietaryPreference,
        packingPreference: _packingPreference,
        productUpdatePreference: _productUpdatePreference,
        clearCartAfterOrder: _clearCartAfterOrder,
        newPassword: _newPasswordController.text.isNotEmpty
            ? _newPasswordController.text
            : null,
      );

      if (mounted) {
        setState(() {
          _isLoading = false;
          _isEditing = false;
          _errorMessage = null;
          _newPasswordController.clear();
          _confirmPasswordController.clear();
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Profile updated!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Failed to update profile: ${e.toString()}';
        });
      }
    }
  }

  Future<void> _showLogoutConfirmation() async {
    return showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Logout'),
          content: const Text('Are you sure you want to logout?'),
          actions: [
            TextButton(
              style: TextButton.styleFrom(
                foregroundColor: AppColors.secondary,
              ),
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel', style: TextStyle(color: AppColors.secondary)),
            ),
            TextButton(
              style: TextButton.styleFrom(
                foregroundColor: AppColors.secondary,
              ),
              onPressed: () {
                Navigator.of(context).pop();
                _logout();
              },
              child: const Text('Logout', style: TextStyle(color: AppColors.secondary)),
            ),
          ],
        );
      },
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
              leading: const Icon(Icons.shopping_cart),
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
              onTap: () => Navigator.pop(context),
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.logout),
              title: const Text('Logout'),
              onTap: () async {
                Navigator.pop(context);
                await _showLogoutConfirmation();
              },
            ),
          ],
        ),
      ),
      body: Consumer<AuthProvider>(
        builder: (context, authProvider, _) {
          final user = authProvider.currentUser;

          if (user == null) {
            return const Center(
              child: Text('Not logged in'),
            );
          }

          return Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const SizedBox(height: 8),
                      Card(
                        color: Colors.white,
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                      child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Phone Number (read-only)
                        const Text(
                          'Phone Number',
                          style: TextStyle(
                            color: Colors.grey,
                            fontSize: 12,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          user.phone,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 16),
                        
                        // Salutation
                        const Text(
                          'Salutation',
                          style: TextStyle(
                            color: Colors.grey,
                            fontSize: 12,
                          ),
                        ),
                        const SizedBox(height: 4),
                        if (_isEditing)
                          DropdownButtonFormField<String>(
                            value: _salutation,
                            isExpanded: true,
                            items: PreferenceConstants.salutations.entries
                                .map((e) => DropdownMenuItem(
                                  value: e.key,
                                  child: Text(e.value),
                                ))
                                .toList(),
                            onChanged: _isLoading ? null : (value) {
                              setState(() => _salutation = value);
                            },
                            decoration: InputDecoration(
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 8,
                              ),
                            ),
                          )
                        else
                          Text(
                            _salutation ?? 'Not set',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        const SizedBox(height: 16),

                        // First Name
                        const Text(
                          'First Name',
                          style: TextStyle(
                            color: Colors.grey,
                            fontSize: 12,
                          ),
                        ),
                        const SizedBox(height: 4),
                        if (_isEditing)
                          TextField(
                            controller: _firstNameController,
                            enabled: !_isLoading,
                            decoration: InputDecoration(
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 8,
                              ),
                            ),
                          )
                        else
                          Text(
                            _firstNameController.text.isNotEmpty ? _firstNameController.text : 'Not set',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        const SizedBox(height: 16),

                        // Last Name
                        const Text(
                          'Last Name',
                          style: TextStyle(
                            color: Colors.grey,
                            fontSize: 12,
                          ),
                        ),
                        const SizedBox(height: 4),
                        if (_isEditing)
                          TextField(
                            controller: _lastNameController,
                            enabled: !_isLoading,
                            decoration: InputDecoration(
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 8,
                              ),
                            ),
                          )
                        else
                          Text(
                            _lastNameController.text.isNotEmpty ? _lastNameController.text : 'Not set',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        const SizedBox(height: 16),

                        // Email
                        const Text(
                          'Email',
                          style: TextStyle(
                            color: Colors.grey,
                            fontSize: 12,
                          ),
                        ),
                        const SizedBox(height: 4),
                        if (_isEditing)
                          TextField(
                            controller: _emailController,
                            enabled: !_isLoading,
                            keyboardType: TextInputType.emailAddress,
                            decoration: InputDecoration(
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 8,
                              ),
                            ),
                          )
                        else
                          Text(
                            user.email ?? 'Not set',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        const SizedBox(height: 16),

                        // Mobile Number
                        const Text(
                          'Mobile Number',
                          style: TextStyle(
                            color: Colors.grey,
                            fontSize: 12,
                          ),
                        ),
                        const SizedBox(height: 4),
                        if (_isEditing)
                          TextField(
                            controller: _whMobilePhoneController,
                            enabled: !_isLoading,
                            keyboardType: TextInputType.phone,
                            decoration: InputDecoration(
                              hintText: '10 digit number',
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 8,
                              ),
                            ),
                          )
                        else
                          Text(
                            _whMobilePhoneController.text.isNotEmpty ? _whMobilePhoneController.text : 'Not set',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        const SizedBox(height: 16),

                        // Delivery Address
                        const Text(
                          'Delivery Address',
                          style: TextStyle(
                            color: Colors.grey,
                            fontSize: 12,
                          ),
                        ),
                        const SizedBox(height: 4),
                        if (_isEditing)
                          TextField(
                            controller: _deliveryAddressController,
                            enabled: !_isLoading,
                            maxLines: 4,
                            decoration: InputDecoration(
                              hintText: 'Complete address including landmark',
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 8,
                              ),
                            ),
                          )
                        else
                          Text(
                            _deliveryAddressController.text.isNotEmpty ? _deliveryAddressController.text : 'Not set',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        const SizedBox(height: 16),

                        // Delivery Pincode
                        const Text(
                          'Delivery Pincode',
                          style: TextStyle(
                            color: Colors.grey,
                            fontSize: 12,
                          ),
                        ),
                        const SizedBox(height: 4),
                        if (_isEditing)
                          TextField(
                            controller: _deliveryPincodeController,
                            enabled: !_isLoading,
                            maxLength: 6,
                            keyboardType: TextInputType.number,
                            decoration: InputDecoration(
                              hintText: '6 digit code',
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 8,
                              ),
                            ),
                          )
                        else
                          Text(
                            _deliveryPincodeController.text.isNotEmpty ? _deliveryPincodeController.text : 'Not set',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        const SizedBox(height: 16),

                        // Dietary Preference
                        const Text(
                          'Dietary Preference',
                          style: TextStyle(
                            color: Colors.grey,
                            fontSize: 12,
                          ),
                        ),
                        const SizedBox(height: 4),
                        if (_isEditing)
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              DropdownButtonFormField<String>(
                                value: _dietaryPreference,
                                isExpanded: true,
                                items: PreferenceConstants.dietaryPreferences.entries
                                    .map((e) => DropdownMenuItem(
                                      value: e.key,
                                      child: Text(e.value),
                                    ))
                                    .toList(),
                                onChanged: _isLoading ? null : (value) {
                                  setState(() => _dietaryPreference = value);
                                },
                                decoration: InputDecoration(
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 8,
                                  ),
                                ),
                              ),
                              if (_validationErrors.containsKey('dietaryPreference'))
                                Padding(
                                  padding: const EdgeInsets.only(top: 8.0),
                                  child: Text(
                                    _validationErrors['dietaryPreference']!,
                                    style: const TextStyle(
                                      color: Colors.red,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                            ],
                          )
                        else
                          Text(
                            _dietaryPreference != null
                                ? PreferenceConstants.dietaryPreferences[_dietaryPreference] ?? 'Not set'
                                : 'Not set',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        const SizedBox(height: 16),

                        // Packing Preference
                        const Text(
                          'Packing Preference',
                          style: TextStyle(
                            color: Colors.grey,
                            fontSize: 12,
                          ),
                        ),
                        const SizedBox(height: 4),
                        if (_isEditing)
                          DropdownButtonFormField<String>(
                            value: _packingPreference,
                            isExpanded: true,
                            items: PreferenceConstants.packingPreferences.entries
                                .map((e) => DropdownMenuItem(
                                  value: e.key,
                                  child: Text(e.value),
                                ))
                                .toList(),
                            onChanged: _isLoading ? null : (value) {
                              setState(() => _packingPreference = value);
                            },
                            decoration: InputDecoration(
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 8,
                              ),
                            ),
                          )
                        else
                          Text(
                            _packingPreference != null
                                ? PreferenceConstants.packingPreferences[_packingPreference] ?? 'Not set'
                                : 'Not set',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        const SizedBox(height: 16),

                        // Product Update Preference
                        const Text(
                          'Product Update Preference',
                          style: TextStyle(
                            color: Colors.grey,
                            fontSize: 12,
                          ),
                        ),
                        const SizedBox(height: 4),
                        if (_isEditing)
                          DropdownButtonFormField<String>(
                            value: _productUpdatePreference,
                            isExpanded: true,
                            items: PreferenceConstants.productUpdatePreferences.entries
                                .map((e) => DropdownMenuItem(
                                  value: e.key,
                                  child: Text(e.value),
                                ))
                                .toList(),
                            onChanged: _isLoading ? null : (value) {
                              setState(() => _productUpdatePreference = value);
                            },
                            decoration: InputDecoration(
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 8,
                              ),
                            ),
                          )
                        else
                          Text(
                            _productUpdatePreference != null
                                ? PreferenceConstants.productUpdatePreferences[_productUpdatePreference] ?? 'Not set'
                                : 'Not set',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        const SizedBox(height: 16),

                        // Clear Cart After Order
                        const Text(
                          'Clear Cart After Order',
                          style: TextStyle(
                            color: Colors.grey,
                            fontSize: 12,
                          ),
                        ),
                        const SizedBox(height: 4),
                        if (_isEditing)
                          DropdownButtonFormField<bool>(
                            value: _clearCartAfterOrder,
                            isExpanded: true,
                            items: const [
                              DropdownMenuItem(value: true, child: Text('Yes')),
                              DropdownMenuItem(value: false, child: Text('No')),
                            ],
                            onChanged: _isLoading ? null : (value) {
                              if (value != null) {
                                setState(() => _clearCartAfterOrder = value);
                              }
                            },
                            decoration: InputDecoration(
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 8,
                              ),
                            ),
                          )
                        else
                          Text(
                            _clearCartAfterOrder ? 'Yes' : 'No',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
                            ),
                          ),

                        // Password fields only shown in edit mode
                        if (_isEditing) ...[
                          const SizedBox(height: 24),
                          const Text(
                            'New Password',
                            style: TextStyle(
                              color: Colors.grey,
                              fontSize: 12,
                            ),
                          ),
                          const SizedBox(height: 4),
                          TextField(
                            controller: _newPasswordController,
                            enabled: !_isLoading,
                            obscureText: true,
                            decoration: InputDecoration(
                              hintText: 'Leave blank to keep current password',
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 8,
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'Confirm New Password',
                            style: TextStyle(
                              color: Colors.grey,
                              fontSize: 12,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              TextField(
                                controller: _confirmPasswordController,
                                enabled: !_isLoading,
                                obscureText: true,
                                decoration: InputDecoration(
                                  hintText: 'Confirm new password',
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 8,
                                  ),
                                ),
                              ),
                              if (_validationErrors.containsKey('password'))
                                Padding(
                                  padding: const EdgeInsets.only(top: 8.0),
                                  child: Text(
                                    _validationErrors['password']!,
                                    style: const TextStyle(
                                      color: Colors.red,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                if (_errorMessage != null)
                  Text(
                    _errorMessage!,
                    style: const TextStyle(
                      color: Colors.red,
                      fontSize: 14,
                    ),
                  ),
                const SizedBox(height: 80), // Space for fixed button
                ],
                ),
                ),
                ),
                // Fixed bottom button bar
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 12.0),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 8,
                        offset: const Offset(0, -2),
                      ),
                    ],
                  ),
                  child: _isEditing
                    ? SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFe04a06),
                          foregroundColor: Colors.white,
                        ),
                        onPressed: _isLoading ? null : _saveProfile,
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
                              'SAVE CHANGES',
                              style: getButtonTextStyle(),
                            ),
                      ),
                    )
                    : SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFe04a06),
                          foregroundColor: Colors.white,
                        ),
                        onPressed: _isLoading
                            ? null
                            : () => setState(() => _isEditing = true),
                        child: Text(
                          'EDIT PROFILE',
                          style: getButtonTextStyle(),
                        ),
                      ),
                    ),
                ),
                ],
                );
                },
                ),
                ),
                );
                }
                }
