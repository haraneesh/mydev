const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define paths
const assetsDir = path.join(__dirname, '..', 'private', 'assets');
const resDir = path.join(assetsDir, 'res');
const iconDir = path.join(resDir, 'icon');
const screenDir = path.join(resDir, 'screen');

// Create directories if they don't exist
const createDirectories = () => {
  const dirs = [
    path.join(iconDir, 'android'),
    path.join(screenDir, 'android')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

// Check if ImageMagick is installed
const checkImageMagick = () => {
  try {
    execSync('convert --version');
    return true;
  } catch (error) {
    console.error('ImageMagick is required for generating assets. Please install it first.');
    console.log('On macOS, you can install it with: brew install imagemagick');
    return false;
  }
};

// Generate Android icons
const generateIcons = () => {
  const iconSizes = [
    { name: 'mipmap-ldpi', size: '36x36' },
    { name: 'mipmap-mdpi', size: '48x48' },
    { name: 'mipmap-hdpi', size: '72x72' },
    { name: 'mipmap-xhdpi', size: '96x96' },
    { name: 'mipmap-xxhdpi', size: '144x144' },
    { name: 'mipmap-xxxhdpi', size: '192x192' },
    { name: 'play-store-icon', size: '512x512' }
  ];

  const sourceIcon = path.join(assetsDir, 'icon.png');
  
  if (!fs.existsSync(sourceIcon)) {
    console.error(`Source icon not found at: ${sourceIcon}`);
    console.log('Please add a 1024x1024px icon.png to the private/assets directory.');
    return false;
  }

  iconSizes.forEach(({ name, size }) => {
    const outputPath = path.join(iconDir, 'android', `${name}.png`);
    try {
      execSync(`convert ${sourceIcon} -resize ${size} ${outputPath}`);
      console.log(`Generated: ${outputPath}`);
    } catch (error) {
      console.error(`Error generating ${outputPath}:`, error.message);
    }
  });

  return true;
};

// Generate Android splash screens
const generateSplashScreens = () => {
  const splashSizes = [
    { name: 'land-ldpi', size: '320x200' },
    { name: 'land-mdpi', size: '480x320' },
    { name: 'land-hdpi', size: '800x480' },
    { name: 'land-xhdpi', size: '1280x720' },
    { name: 'land-xxhdpi', size: '1600x960' },
    { name: 'land-xxxhdpi', size: '1920x1280' },
    { name: 'port-ldpi', size: '200x320' },
    { name: 'port-mdpi', size: '320x480' },
    { name: 'port-hdpi', size: '480x800' },
    { name: 'port-xhdpi', size: '720x1280' },
    { name: 'port-xxhdpi', size: '960x1600' },
    { name: 'port-xxxhdpi', size: '1280x1920' }
  ];

  const sourceSplash = path.join(assetsDir, 'splash.png');
  
  if (!fs.existsSync(sourceSplash)) {
    console.error(`Source splash screen not found at: ${sourceSplash}`);
    console.log('Please add a 2732x2732px splash.png to the private/assets directory.');
    return false;
  }

  splashSizes.forEach(({ name, size }) => {
    const outputPath = path.join(screenDir, 'android', `splash_${name}.png`);
    try {
      execSync(`convert ${sourceSplash} -resize "${size}^" -gravity center -extent ${size} ${outputPath}`);
      console.log(`Generated: ${outputPath}`);
    } catch (error) {
      console.error(`Error generating ${outputPath}:`, error.message);
    }
  });

  return true;
};

// Main function
const main = () => {
  if (!checkImageMagick()) return;
  
  createDirectories();
  
  console.log('Generating Android icons...');
  const iconsGenerated = generateIcons();
  
  console.log('\nGenerating Android splash screens...');
  const splashScreensGenerated = generateSplashScreens();
  
  if (iconsGenerated && splashScreensGenerated) {
    console.log('\n✅ All assets generated successfully!');
    console.log('Please replace the placeholder images in private/assets with your actual assets and run this script again.');
  } else {
    console.log('\n❌ Some assets could not be generated. Please check the error messages above.');
  }
};

// Run the script
main();
