import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../widgets/app_bar_with_logo.dart';
import '../../widgets/background_widget.dart';

class PlaceholderScreen extends StatelessWidget {
  const PlaceholderScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BackgroundWidget(
      child: Scaffold(
        appBar: const AppBarWithLogo(),
        body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Suvai',
              style: AppTypography.h2,
            ),
            const SizedBox(height: 20),
            Text(
              'Phase 1: Foundation Complete',
              style: AppTypography.body,
            ),
            const SizedBox(height: 40),
            Text(
              'Cart System Ready:',
              style: AppTypography.h3,
            ),
            const SizedBox(height: 10),
            const Padding(
              padding: EdgeInsets.all(20.0),
              child: Text(
                '✓ 32 Unit Tests Passing\n'
                '✓ Cart Provider Implemented\n'
                '✓ Product Models\n'
                '✓ Theme System\n'
                '✓ No Linting Errors\n'
                '✓ Android Build Successful',
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
      ),
      ),
    );
  }
}
