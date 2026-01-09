#!/bin/bash

# Script to copy Android app icons from private assets

SOURCE_DIR="../private/assets/res/icon/android"
DEST_DIR="android/app/src/main/res"

# Define density directories
DENSITIES=(
  "mipmap-hdpi"
  "mipmap-mdpi"
  "mipmap-xhdpi"
  "mipmap-xxhdpi"
  "mipmap-xxxhdpi"
)

echo "Copying Android app icons..."

for density in "${DENSITIES[@]}"; do
  echo "Copying $density..."
  cp "$SOURCE_DIR/$density"/* "$DEST_DIR/$density/"
done

# Also copy drawable resources if they exist
if [ -d "$SOURCE_DIR/drawable" ]; then
  echo "Copying drawable resources..."
  cp "$SOURCE_DIR/drawable"/* "$DEST_DIR/drawable/" 2>/dev/null || true
fi

if [ -d "$SOURCE_DIR/drawable-hdpi" ]; then
  echo "Copying drawable-hdpi resources..."
  cp "$SOURCE_DIR/drawable-hdpi"/* "$DEST_DIR/drawable-hdpi/" 2>/dev/null || true
fi

echo "Done! App icons have been updated."
