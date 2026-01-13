# Implementation Tasks: Move Add Button to Image Overlay

## 1. Layout Restructure
- [x] 1.1 Change image container from simple Container to Stack
- [x] 1.2 Wrap image widget in Stack with Positioned overlay for Add button
- [x] 1.3 Position Add button in bottom-right corner of image (offset: bottom=4, right=4)

## 2. Styling & Sizing
- [x] 2.1 Button sized to 28x28px for compact overlay
- [x] 2.2 Button positioned with Positioned widget, clickable over image
- [x] 2.3 Button uses primary color with zero padding for compact appearance

## 3. Testing & Verification
- [x] 3.1 Verify button appears on top of product image
- [x] 3.2 Verify button is clickable and functional (opens unit selection modal)
- [x] 3.3 Flutter analyze shows no build errors or layout issues
- [x] 3.4 Add button removed from Row 2 (below product info)

## 4. Documentation
- [x] 4.1 Code comments updated reflecting Stack-based overlay layout
