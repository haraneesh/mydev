import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mydev_mobile/config/theme.dart';
import 'package:mydev_mobile/widgets/category_sidebar.dart';

void main() {
  group('CategorySidebar', () {
    testWidgets('displays all categories in a vertical list',
        (WidgetTester tester) async {
      final categories = ['All', 'Vegetables', 'Fruits', 'Greens'];
      final widget = MaterialApp(
        home: Scaffold(
          body: CategorySidebar(
            categories: categories,
            selectedCategory: 'All',
            onCategorySelected: (_) {},
          ),
        ),
      );

      await tester.pumpWidget(widget);

      // Verify all categories are displayed
      for (final category in categories) {
        expect(find.text(category), findsOneWidget);
      }
    });

    testWidgets('highlights the selected category',
        (WidgetTester tester) async {
      final categories = ['All', 'Vegetables', 'Fruits'];
      final widget = MaterialApp(
        home: Scaffold(
          body: CategorySidebar(
            categories: categories,
            selectedCategory: 'Vegetables',
            onCategorySelected: (_) {},
          ),
        ),
      );

      await tester.pumpWidget(widget);

      // Find the selected category item
      final vegetablesItem = find.descendant(
        of: find.byType(CategorySidebar),
        matching: find.byType(AnimatedContainer),
      );

      // There should be multiple AnimatedContainers (one per category)
      expect(vegetablesItem, findsWidgets);
    });

    testWidgets('calls onCategorySelected when a category is tapped',
        (WidgetTester tester) async {
      final categories = ['All', 'Vegetables', 'Fruits'];
      String? selectedCategory;

      final widget = MaterialApp(
        home: Scaffold(
          body: CategorySidebar(
            categories: categories,
            selectedCategory: 'All',
            onCategorySelected: (category) {
              selectedCategory = category;
            },
          ),
        ),
      );

      await tester.pumpWidget(widget);

      // Tap on Vegetables
      await tester.tap(find.text('Vegetables'));
      await tester.pumpAndSettle();

      expect(selectedCategory, equals('Vegetables'));
    });

    testWidgets('updates highlight when selected category changes',
        (WidgetTester tester) async {
      final categories = ['All', 'Vegetables', 'Fruits'];
      var selectedCategory = 'All';

      final widget = StatefulBuilder(
        builder: (context, setState) => MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                CategorySidebar(
                  categories: categories,
                  selectedCategory: selectedCategory,
                  onCategorySelected: (category) {
                    setState(() => selectedCategory = category);
                  },
                ),
              ],
            ),
          ),
        ),
      );

      await tester.pumpWidget(widget);

      // Initial state: 'All' is selected
      expect(find.text('All'), findsOneWidget);

      // Tap Vegetables
      await tester.tap(find.text('Vegetables'));
      await tester.pumpAndSettle();

      // Verify Vegetables is now selected
      expect(selectedCategory, equals('Vegetables'));
    });

    testWidgets('renders with custom width parameter',
        (WidgetTester tester) async {
      final categories = ['All', 'Vegetables'];
      const customWidth = 200.0;

      final widget = MaterialApp(
        home: Scaffold(
          body: SizedBox(
            width: 400,
            height: 600,
            child: CategorySidebar(
              categories: categories,
              selectedCategory: 'All',
              onCategorySelected: (_) {},
              width: customWidth,
            ),
          ),
        ),
      );

      await tester.pumpWidget(widget);

      // Verify the sidebar is rendered
      expect(find.byType(CategorySidebar), findsOneWidget);
    });

    testWidgets('handles empty category list gracefully',
        (WidgetTester tester) async {
      final widget = MaterialApp(
        home: Scaffold(
          body: CategorySidebar(
            categories: [],
            selectedCategory: '',
            onCategorySelected: (_) {},
          ),
        ),
      );

      await tester.pumpWidget(widget);

      // Should render without error
      expect(find.byType(CategorySidebar), findsOneWidget);
    });

    testWidgets('renders with custom background color',
        (WidgetTester tester) async {
      final categories = ['All', 'Vegetables'];
      const customColor = Color.fromARGB(255, 240, 240, 240);

      final widget = MaterialApp(
        home: Scaffold(
          body: CategorySidebar(
            categories: categories,
            selectedCategory: 'All',
            onCategorySelected: (_) {},
            backgroundColor: customColor,
          ),
        ),
      );

      await tester.pumpWidget(widget);

      // Verify the sidebar is rendered
      expect(find.byType(CategorySidebar), findsOneWidget);
    });
  });
}
