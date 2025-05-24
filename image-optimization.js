const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = 'images/original';
const outputDir = 'images/optimized';

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Function to optimize an image
async function optimizeImage(inputPath, outputPath, options) {
    try {
        await sharp(inputPath)
            .resize(options.width, options.height, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({
                quality: options.quality,
                progressive: true
            })
            .toFile(outputPath);
        console.log(`Optimized: ${outputPath}`);
    } catch (error) {
        console.error(`Error optimizing ${inputPath}:`, error);
    }
}

// Process all images in the input directory
fs.readdir(inputDir, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }

    files.forEach(file => {
        if (file.match(/\.(jpg|jpeg|png)$/i)) {
            const inputPath = path.join(inputDir, file);
            const outputPath = path.join(outputDir, file.replace(/\.(jpg|jpeg|png)$/i, '.jpg'));

            // Optimize for different sizes
            optimizeImage(inputPath, outputPath, {
                width: 1920,
                height: 1080,
                quality: 80
            });

            // Create thumbnail
            const thumbnailPath = path.join(outputDir, `thumb_${file.replace(/\.(jpg|jpeg|png)$/i, '.jpg')}`);
            optimizeImage(inputPath, thumbnailPath, {
                width: 400,
                height: 300,
                quality: 70
            });
        }
    });
}); 