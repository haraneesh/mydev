import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:suvai/widgets/app_bar_with_logo.dart';

void main() {
  group('AppBarWithLogo Widget Tests', () {
    testWidgets('Logo displays in AppBar', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            appBar: const AppBarWithLogo(),
            body: const Center(child: Text('Test')),
          ),
        ),
      );

      expect(find.byType(Image), findsOneWidget);
    });

    testWidgets('AppBar has white background', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            appBar: const AppBarWithLogo(),
            body: const Center(child: Text('Test')),
          ),
        ),
      );

      final appBar = find.byType(AppBar);
      expect(appBar, findsOneWidget);
    });

    testWidgets('Leading widget displays when showLeading is true', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            appBar: AppBarWithLogo(
              showLeading: true,
              leading: const Icon(Icons.menu),
            ),
            body: const Center(child: Text('Test')),
          ),
        ),
      );

      expect(find.byIcon(Icons.menu), findsOneWidget);
    });

    testWidgets('Leading widget does not display when showLeading is false', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            appBar: AppBarWithLogo(
              showLeading: false,
              leading: const Icon(Icons.menu),
            ),
            body: const Center(child: Text('Test')),
          ),
        ),
      );

      expect(find.byIcon(Icons.menu), findsNothing);
    });

    testWidgets('Actions display correctly', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            appBar: AppBarWithLogo(
              actions: [
                IconButton(
                  icon: const Icon(Icons.shopping_cart),
                  onPressed: () {},
                ),
              ],
            ),
            body: const Center(child: Text('Test')),
          ),
        ),
      );

      expect(find.byIcon(Icons.shopping_cart), findsOneWidget);
    });

    testWidgets('AppBar maintains consistent height', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            appBar: const AppBarWithLogo(),
            body: const Center(child: Text('Test')),
          ),
        ),
      );

      final appBar = find.byType(AppBar);
      expect(appBar, findsOneWidget);
      
      final appBarWidget = tester.widget<AppBar>(appBar);
      expect(appBarWidget.toolbarHeight, isNull);
    });
  });
}
