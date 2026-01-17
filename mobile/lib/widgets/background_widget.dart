import 'package:flutter/material.dart';

/// A reusable widget that applies the background image to any page.
/// Wraps the child widget with a background image that covers the entire screen.
class BackgroundWidget extends StatelessWidget {
  final Widget child;
  final String? backgroundImagePath;

  const BackgroundWidget({
    super.key,
    required this.child,
    this.backgroundImagePath,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        image: DecorationImage(
          image: AssetImage(backgroundImagePath ?? 'assets/bg.jpg'),
          fit: BoxFit.none,
          repeat: ImageRepeat.repeat,
          alignment: Alignment.topLeft,
        ),
      ),
      child: _makeScaffoldTransparent(child),
    );
  }

  /// Recursively finds and makes Scaffold transparent by setting backgroundColor to transparent
  Widget _makeScaffoldTransparent(Widget widget) {
    if (widget is Scaffold) {
      return Scaffold(
        key: widget.key,
        appBar: widget.appBar,
        body: widget.body,
        floatingActionButton: widget.floatingActionButton,
        floatingActionButtonLocation: widget.floatingActionButtonLocation,
        floatingActionButtonAnimator: widget.floatingActionButtonAnimator,
        persistentFooterButtons: widget.persistentFooterButtons,
        persistentFooterAlignment: widget.persistentFooterAlignment,
        drawer: widget.drawer,
        onDrawerChanged: widget.onDrawerChanged,
        endDrawer: widget.endDrawer,
        onEndDrawerChanged: widget.onEndDrawerChanged,
        bottomNavigationBar: widget.bottomNavigationBar,
        bottomSheet: widget.bottomSheet,
        backgroundColor: Colors.transparent,
        resizeToAvoidBottomInset: widget.resizeToAvoidBottomInset,
        primary: widget.primary,
        drawerDragStartBehavior: widget.drawerDragStartBehavior,
        extendBody: widget.extendBody,
        extendBodyBehindAppBar: widget.extendBodyBehindAppBar,
        drawerScrimColor: widget.drawerScrimColor,
        drawerEnableOpenDragGesture: widget.drawerEnableOpenDragGesture,
        endDrawerEnableOpenDragGesture: widget.endDrawerEnableOpenDragGesture,
        restorationId: widget.restorationId,
      );
    }
    // Handle WillPopScope wrapper
    if (widget is WillPopScope) {
      return WillPopScope(
        onWillPop: widget.onWillPop,
        child: _makeScaffoldTransparent(widget.child),
      );
    }
    return widget;
  }
}
