import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../config/preferences.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/background_widget.dart';
import 'login_screen.dart';
import 'home_screen.dart';

class SignUpScreen extends StatefulWidget {
  final String? prefillPhone;
  final bool placeOrderAfterSignup;
  final String? prefillNotes;

  const SignUpScreen({
    this.prefillPhone,
    this.placeOrderAfterSignup = false,
    this.prefillNotes,
    super.key,
  });

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _firstNameController;
  late final TextEditingController _lastNameController;
  late final TextEditingController _emailController;
  late final TextEditingController _whatsappPhoneController;
  late final TextEditingController _confirmPhoneController;
  late final TextEditingController _deliveryAddressController;
  late final TextEditingController _deliveryPincodeController;
  late final TextEditingController _healthyMeaningController;
  late final TextEditingController _passwordController;
  late final TextEditingController _confirmPasswordController;

  bool _isLoading = false;
  bool _showPassword = false;
  bool _showConfirmPassword = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _firstNameController = TextEditingController();
    _lastNameController = TextEditingController();
    _emailController = TextEditingController();
    _whatsappPhoneController = TextEditingController(text: widget.prefillPhone ?? '');
    _confirmPhoneController = TextEditingController(text: widget.prefillPhone ?? '');
    _deliveryAddressController = TextEditingController();
    _deliveryPincodeController = TextEditingController();
    _healthyMeaningController = TextEditingController();
    _passwordController = TextEditingController();
    _confirmPasswordController = TextEditingController();
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _whatsappPhoneController.dispose();
    _confirmPhoneController.dispose();
    _deliveryAddressController.dispose();
    _deliveryPincodeController.dispose();
    _healthyMeaningController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  bool _isPhoneValid(String phone) {
    return phone.length == 10 && RegExp(r'^[0-9]{10}$').hasMatch(phone);
  }

  bool _isPasswordValid(String password) {
    return password.length >= 6;
  }

  String? _validateForm() {
    if (_firstNameController.text.trim().isEmpty) {
      return 'First name is required';
    }
    if (_lastNameController.text.trim().isEmpty) {
      return 'Last name is required';
    }
    if (_emailController.text.trim().isEmpty) {
      return 'Email is required';
    }
    if (!_isPhoneValid(_whatsappPhoneController.text)) {
      return 'WhatsApp number must be 10 digits';
    }
    if (_whatsappPhoneController.text != _confirmPhoneController.text) {
      return 'Phone numbers do not match';
    }
    if (_deliveryAddressController.text.trim().isEmpty) {
      return 'Delivery address is required';
    }
    if (_deliveryPincodeController.text.trim().isEmpty) {
      return 'Delivery pincode is required';
    }
    if (_healthyMeaningController.text.trim().isEmpty) {
      return 'Please share what healthy eating means to you';
    }
    if (!_isPasswordValid(_passwordController.text)) {
      return 'Password must be at least 6 characters';
    }
    if (_passwordController.text != _confirmPasswordController.text) {
      return 'Passwords do not match';
    }
    return null;
  }

  Future<void> _handleSignUp() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final validationError = _validateForm();
    if (validationError != null) {
      setState(() => _errorMessage = validationError);
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final authProvider = context.read<AuthProvider>();
      final phone = _whatsappPhoneController.text.trim();
      final password = _passwordController.text;
      final firstName = _firstNameController.text.trim();
      final lastName = _lastNameController.text.trim();
      final email = _emailController.text.trim();
      final deliveryAddress = _deliveryAddressController.text.trim();
      final deliveryPincode = _deliveryPincodeController.text.trim();
      final healthyMeaning = _healthyMeaningController.text.trim();

      await authProvider.signup(
        phone: phone,
        password: password,
        firstName: firstName,
        lastName: lastName,
        email: email,
        deliveryAddress: deliveryAddress,
        deliveryPincode: deliveryPincode,
        eatingHealthyMeaning: healthyMeaning,
      );

      if (mounted) {
        // Navigate back to checkout if placing order after signup, otherwise to home
        if (widget.placeOrderAfterSignup) {
          // Pop back to checkout screen to complete the order
          // Pass back the notes if they were provided
          Navigator.of(context).pop(widget.prefillNotes);
        } else {
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (_) => const HomeScreen()),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = e.toString().replaceAll('Exception: ', '');
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return BackgroundWidget(
      child: Scaffold(
        appBar: AppBar(
          elevation: 0,
          centerTitle: true,
          title: Image.asset(
            'assets/logo_mobile.png',
            height: 40,
            fit: BoxFit.contain,
          ),
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 20),
                Text(
                  'Sign Up',
                  style: GoogleFonts.sourceSerif4(
                    fontSize: 28,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF2f2215),
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                // Welcome card
                Card(
                  color: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                    side: BorderSide(color: Colors.grey[200]!, width: 1),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        Text(
                          'Welcome to Suvai',
                          style: GoogleFonts.nunito(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: const Color(0xFF2f2215),
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Suvai is a community of like-minded families who are better for more than 5 years.',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: const Color(0xFF514732),
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'We are committed to eating healthy and leaving behind a small ecological footprint.',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: const Color(0xFF514732),
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'We are happy to Welcome you. Please introduce yourself.',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: const Color(0xFF514732),
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                // Login link
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Are you an existing customer?',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: const Color(0xFF2f2215),
                      ),
                    ),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.secondary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                      ),
                      onPressed: _isLoading
                          ? null
                          : () {
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const LoginScreen(),
                          ),
                        );
                      },
                      child: Text(
                        'LOG IN',
                        style: getButtonTextStyle(fontSize: 11),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                // First Name
                Text(
                  'First Name',
                  style: GoogleFonts.nunito(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF514732),
                  ),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _firstNameController,
                  enabled: !_isLoading,
                  decoration: InputDecoration(
                    hintText: 'Your first name',
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'First name is required';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                // Last Name
                Text(
                  'Last Name',
                  style: GoogleFonts.nunito(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF514732),
                  ),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _lastNameController,
                  enabled: !_isLoading,
                  decoration: InputDecoration(
                    hintText: 'Your last name',
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Last name is required';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                // Email
                Text(
                  'Email Address',
                  style: GoogleFonts.nunito(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF514732),
                  ),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _emailController,
                  enabled: !_isLoading,
                  keyboardType: TextInputType.emailAddress,
                  decoration: InputDecoration(
                    hintText: 'your.email@example.com',
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Email is required';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                // WhatsApp Mobile Number
                Text(
                  'WhatsApp Mobile Number',
                  style: GoogleFonts.nunito(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF514732),
                  ),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _whatsappPhoneController,
                  enabled: !_isLoading,
                  keyboardType: TextInputType.phone,
                  maxLength: 10,
                  decoration: InputDecoration(
                    hintText: '10 digit number example, 8767898987',
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    counterText: '',
                  ),
                  validator: (value) {
                    if (!_isPhoneValid(value ?? '')) {
                      return 'Phone must be 10 digits';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                // Confirm Mobile Number
                Text(
                  'Confirm Mobile Number',
                  style: GoogleFonts.nunito(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF514732),
                  ),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _confirmPhoneController,
                  enabled: !_isLoading,
                  keyboardType: TextInputType.phone,
                  maxLength: 10,
                  decoration: InputDecoration(
                    hintText: '10 digit number example, 8767898987',
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    counterText: '',
                  ),
                  validator: (value) {
                    if (!_isPhoneValid(value ?? '')) {
                      return 'Phone must be 10 digits';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                // Delivery Address
                Text(
                  'Delivery Address',
                  style: GoogleFonts.nunito(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF514732),
                  ),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _deliveryAddressController,
                  enabled: !_isLoading,
                  maxLines: 3,
                  decoration: InputDecoration(
                    hintText: 'Complete address to deliver at, including Landmark, Pincode',
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Address is required';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                // Delivery Address Pincode
                Text(
                  'Delivery Address Pincode',
                  style: GoogleFonts.nunito(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF514732),
                  ),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _deliveryPincodeController,
                  enabled: !_isLoading,
                  keyboardType: TextInputType.number,
                  maxLength: 6,
                  decoration: InputDecoration(
                    hintText: 'Enter Pincode of the delivery address',
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    counterText: '',
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Pincode is required';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                // What does eating healthy mean to you?
                Text(
                  'What does eating healthy mean to you?',
                  style: GoogleFonts.nunito(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF514732),
                  ),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _healthyMeaningController,
                  enabled: !_isLoading,
                  maxLines: 3,
                  decoration: InputDecoration(
                    hintText: 'You are never wrong, tell us what\'s in your mind',
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Please share your thoughts';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                // Password
                Text(
                  'Password',
                  style: GoogleFonts.nunito(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF514732),
                  ),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _passwordController,
                  enabled: !_isLoading,
                  obscureText: !_showPassword,
                  decoration: InputDecoration(
                    hintText: 'Use at least 6 characters',
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _showPassword ? Icons.visibility : Icons.visibility_off,
                      ),
                      onPressed: () => setState(() => _showPassword = !_showPassword),
                    ),
                  ),
                  validator: (value) {
                    if (!_isPasswordValid(value ?? '')) {
                      return 'Password must be at least 6 characters';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                // Confirm Password
                Text(
                  'Confirm Password',
                  style: GoogleFonts.nunito(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF514732),
                  ),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _confirmPasswordController,
                  enabled: !_isLoading,
                  obscureText: !_showConfirmPassword,
                  decoration: InputDecoration(
                    hintText: 'Confirm your password',
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _showConfirmPassword ? Icons.visibility : Icons.visibility_off,
                      ),
                      onPressed: () => setState(() => _showConfirmPassword = !_showConfirmPassword),
                    ),
                  ),
                  validator: (value) {
                    if (!_isPasswordValid(value ?? '')) {
                      return 'Password must be at least 6 characters';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                // Disclaimer
                Text(
                  'By Signing up you are sharing your commitment towards healthy and sustainable lifestyle.',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.textSecondary,
                    fontWeight: FontWeight.w600,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                // Error message
                if (_errorMessage != null)
                  Text(
                    _errorMessage!,
                    style: const TextStyle(
                      color: Colors.red,
                      fontSize: 14,
                    ),
                    textAlign: TextAlign.center,
                  ),
                const SizedBox(height: 16),
                // Sign Up Button
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.secondary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  onPressed: _isLoading ? null : _handleSignUp,
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
                    'SIGN UP',
                    style: getButtonTextStyle(),
                  ),
                ),
                const SizedBox(height: 40),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
