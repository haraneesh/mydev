import 'package:flutter/material.dart';

class AppBarWithLogo extends StatelessWidget implements PreferredSizeWidget {
  final String? title;
  final List<Widget>? actions;
  final Widget? leading;
  final bool showLeading;

  const AppBarWithLogo({
    this.title,
    this.actions,
    this.leading,
    this.showLeading = false,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: Image.asset(
        'assets/logo_mobile.png',
        height: 40,
        fit: BoxFit.contain,
      ),
      elevation: 0,
      leading: showLeading ? leading : null,
      actions: actions,
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
