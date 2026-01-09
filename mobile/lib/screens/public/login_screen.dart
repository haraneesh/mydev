import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/background_widget.dart';
import 'user_profile_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  bool _showPassword = false;
  bool _isSignUpMode = false;
  String? _errorMessage;

  @override
  void dispose() {
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  bool _isPhoneValid(String phone) {
    return phone.length == 10 && RegExp(r'^[0-9]{10}$').hasMatch(phone);
  }

  bool _isPasswordValid(String password) {
    return password.length >= 4;
  }

  bool _canSubmit() {
    return _isPhoneValid(_phoneController.text) &&
        _isPasswordValid(_passwordController.text);
  }

  Future<void> _handleSignUp() async {
    if (!_canSubmit()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final authProvider = context.read<AuthProvider>();
      await authProvider.signup(_phoneController.text, _passwordController.text);

      if (mounted) {
        setState(() {
          _phoneController.clear();
          _passwordController.clear();
          _isSignUpMode = false;
          _errorMessage = null;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Account created! You can now login.')),
        );
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

  Future<void> _handleLogin() async {
    if (!_canSubmit()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final authProvider = context.read<AuthProvider>();
      await authProvider.login(_phoneController.text, _passwordController.text);
      
      // Don't navigate manually - let the AuthRouter rebuild and handle routing
      // The AuthProvider state change will trigger a rebuild of AuthRouter
      // which will then show HomeScreen instead of LoginScreen
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
        extendBodyBehindAppBar: false,
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
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 40),
            Text(
              'Welcome to Suvai',
              style: Theme.of(context).textTheme.headlineSmall,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 48),
            TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              maxLength: 10,
              enabled: !_isLoading,
              decoration: InputDecoration(
                labelText: 'Phone Number',
                prefixText: '+91 ',
                hintText: '9876543210',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                errorText: _phoneController.text.isNotEmpty &&
                        !_isPhoneValid(_phoneController.text)
                    ? 'Phone must be 10 digits'
                    : null,
                counterText: '',
              ),
              onChanged: (_) => setState(() {}),
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _passwordController,
              obscureText: !_showPassword,
              enabled: !_isLoading,
              decoration: InputDecoration(
                labelText: 'Password',
                hintText: _isSignUpMode ? 'At least 4 characters' : 'Your password',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                errorText: _passwordController.text.isNotEmpty &&
                        !_isPasswordValid(_passwordController.text)
                    ? _isSignUpMode
                        ? 'Password must be at least 4 characters'
                        : 'Password is required'
                    : null,
                suffixIcon: IconButton(
                  icon: Icon(
                    _showPassword ? Icons.visibility : Icons.visibility_off,
                  ),
                  onPressed: () => setState(() => _showPassword = !_showPassword),
                ),
              ),
              onChanged: (_) => setState(() {}),
            ),
            const SizedBox(height: 8),
            if (_errorMessage != null)
              Text(
                _errorMessage!,
                style: const TextStyle(
                  color: Colors.red,
                  fontSize: 14,
                ),
              ),
            const SizedBox(height: 32),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.secondary,
                foregroundColor: Colors.white,
                disabledBackgroundColor: AppColors.secondary,
                disabledForegroundColor: Colors.white,
              ),
              onPressed: _canSubmit() && !_isLoading
                  ? (_isSignUpMode ? _handleSignUp : _handleLogin)
                  : null,
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 12.0),
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
                        _isSignUpMode ? 'Sign Up' : 'Login',
                        style: const TextStyle(fontSize: 16, color: Colors.white),
                      ),
              ),
            ),
            const SizedBox(height: 16),
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 12.0, horizontal: 16.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    _isSignUpMode
                        ? 'Already have an account? '
                        : 'New to Suvai? ',
                    style: const TextStyle(fontSize: 14),
                  ),
                  TextButton(
                    style: TextButton.styleFrom(
                      foregroundColor: AppColors.secondary,
                    ),
                    onPressed: _isLoading
                        ? null
                        : () {
                            setState(() {
                              _isSignUpMode = !_isSignUpMode;
                              _errorMessage = null;
                              _phoneController.clear();
                              _passwordController.clear();
                            });
                          },
                    child: Text(
                      _isSignUpMode ? 'Login' : 'Create an account',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: AppColors.secondary,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: const [
                Expanded(child: Divider()),
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16),
                  child: Text('OR'),
                ),
                Expanded(child: Divider()),
              ],
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.btnBg,
                foregroundColor: Colors.white,
              ),
              onPressed: _isLoading
                  ? null
                  : () {
                      Navigator.of(context).pop();
                    },
              child: const Padding(
                padding: EdgeInsets.symmetric(vertical: 12.0),
                child: Text(
                  'Continue as Guest',
                  style: TextStyle(fontSize: 16),
                ),
              ),
            ),
            ],
            ),
            ),
            ),
            );
            }
            }
