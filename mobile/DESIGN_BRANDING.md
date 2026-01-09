# NammaSuvai Mobile App Branding Guidelines

## Overview
This document outlines the visual branding standards for the NammaSuvai Flutter mobile application, ensuring consistency across iOS and Android platforms.

## Logo

### Logo Asset
- **File**: `assets/logo.png`
- **Dimensions**: 200 x 60 pixels
- **Format**: PNG with transparency
- **Display Height**: 40 logical pixels (device-independent)

### Logo Usage
- **Primary Location**: Application AppBar header
- **Display Method**: `Image.asset('assets/logo.png', height: 40, fit: BoxFit.contain)`
- **Scaling**: Logo scales responsively across screen sizes using `fit: BoxFit.contain`

## Color Palette

### AppBar Styling
- **Background Color**: White (`#FFFFFF`)
- **Text/Icon Color**: Dark brown (`#2f2215`)
- **Elevation**: None (flat design)

### Theme Colors
- **Primary**: Dark brown (`#702223`)
- **Secondary**: Orange (`#FFe04a06`)
- **Accent**: Red (`#EF0905`)
- **Success**: Green (`#519716`)
- **Text Primary**: Dark brown (`#2f2215`)
- **Text Secondary**: Warm brown (`#514732`)
- **Background**: White (`#FFFFFF`)
- **Navbar Background**: Warm brown (`#514732`)

### Color Contrast Requirements
The white AppBar background ensures adequate contrast:
- Logo text is clearly visible against white
- Dark brown foreground colors meet WCAG AA accessibility standards
- Navigation icons maintain visual clarity

## AppBar Component

### Custom AppBar Widget
- **Component**: `AppBarWithLogo` (located in `lib/widgets/app_bar_with_logo.dart`)
- **Purpose**: Provides consistent logo display across all screens
- **Properties**:
  - Logo displays at fixed height of 40 logical pixels
  - Optional leading widget support for navigation menus
  - Optional actions widget list for screen-specific controls

### Screen Implementation
All main screens use the consistent AppBar:
- HomeScreen - With menu drawer and shopping cart badge
- CartScreen - With menu drawer
- CheckoutScreen - Standard logo header
- UserProfileScreen - With menu drawer
- OrderConfirmationScreen - Standard logo header
- PlaceholderScreen - Standard logo header

## Responsive Design

### Logo Scaling
The logo maintains aspect ratio across different screen sizes:
- Phones (small): 320px width - logo displays at 40px height
- Phones (medium): 375px width - logo displays at 40px height
- Phones (large): 600px+ width - logo displays at 40px height
- Tablets: Maintains 40px height with flexible width

### Accessibility Considerations
- White background with dark text ensures sufficient color contrast
- Logo maintains clarity at all supported screen sizes
- Tap targets (menu, cart icons) maintain 48px minimum touch area per Material Design guidelines

## Implementation Files

### Key Files
- `lib/config/theme.dart` - Theme configuration with AppBar styling
- `lib/widgets/app_bar_with_logo.dart` - Custom AppBar component
- `lib/screens/public/*.dart` - All screens using consistent AppBar

### Theme Configuration
```dart
appBarTheme: const AppBarTheme(
  backgroundColor: AppColors.background,    // White
  foregroundColor: AppColors.textPrimary,   // Dark brown
  elevation: 0,
)
```

## Testing Checklist

- [ ] Logo displays correctly on all screen orientations (portrait/landscape)
- [ ] Logo maintains aspect ratio and clarity
- [ ] White background provides adequate contrast with navigation elements
- [ ] Dark text/icons are readable on white background
- [ ] AppBar renders consistently across HomeScreen, CartScreen, CheckoutScreen, UserProfileScreen, and OrderConfirmationScreen
- [ ] Logo displays properly on Android devices
- [ ] Logo displays properly on iOS devices
- [ ] No rendering artifacts or distortion
- [ ] AppBar height remains consistent across all screens

## Future Branding Considerations

- Monitor user feedback on white AppBar visibility in bright sunlight
- Consider adding optional shadow/border on white AppBar if needed
- Maintain logo dimensions in future asset updates
- Update this document when new screens are added

## References

- NammaSuvai Logo: `assets/logo.png`
- Flutter Material Design: https://material.io/design
- Flutter Image Widget: https://api.flutter.dev/flutter/widgets/Image-class.html
