const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceDir = './source-images';
const thumbDir = './images/thumb';

// Ensure the thumbnail directory exists
if (!fs.existsSync(thumbDir)){
    fs.mkdirSync(thumbDir, { recursive: true });
}

// Check if source directory exists
if (!fs.existsSync(sourceDir)) {
    console.error(`Error: Source directory '${sourceDir}' not found. Please create it and add your images.`);
    process.exit(1);
}

// Process each image
fs.readdirSync(sourceDir).forEach(file => {
    if (file.match(/\.(jpg|jpeg|png|webp)$/i)) {
        sharp(path.join(sourceDir, file))
            .resize(300) // Thumbnail width in pixels
            .toFile(path.join(thumbDir, file))
            .then(() => console.log(`Generated thumbnail for: ${file}`))
            .catch(err => console.error(`Error processing ${file}:`, err));
    }
});