const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Sizes for different densities (in pixels)
const iconSizes = {
  'mdpi': 48,
  'hdpi': 72,
  'xhdpi': 96,
  'xxhdpi': 144,
  'xxxhdpi': 192
};

// Create a simple colored square as a placeholder
function createPlaceholderIcon(size, outputPath) {
  const tempFile = path.join('/tmp', `icon-${size}.png`);
  
  // Use ImageMagick to create a simple colored square with text
  try {
    execSync(`convert -size ${size}x${size} xc:#4CAF50 -gravity center \
      -pointsize ${Math.floor(size/5)} -fill white -draw "text 0,0 '${size}x${size}'" \
      -font Arial ${tempFile}`);
    
    // Create directory if it doesn't exist
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Copy the generated icon to the target location
    fs.copyFileSync(tempFile, outputPath);
    console.log(`Created: ${outputPath}`);
  } catch (error) {
    console.error(`Error creating icon ${outputPath}:`, error.message);
  }
}

// Generate icons for all densities
Object.entries(iconSizes).forEach(([density, size]) => {
  const outputPath = path.join(
    __dirname, '..', 'private', 'assets', 'res', 'icon', 'android', 
    `mipmap-${density}`, 'ic_launcher.png'
  );
  createPlaceholderIcon(size, outputPath);
});

console.log('Placeholder icons generated successfully!');
