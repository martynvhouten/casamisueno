const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');
const Terser = require('terser');

const inputDir = {
    css: 'css',
    js: 'js'
};

const outputDir = {
    css: 'css/min',
    js: 'js/min'
};

// Create output directories if they don't exist
Object.values(outputDir).forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Minify CSS files
fs.readdir(inputDir.css, (err, files) => {
    if (err) {
        console.error('Error reading CSS directory:', err);
        return;
    }

    files.forEach(file => {
        if (file.endsWith('.css')) {
            const inputPath = path.join(inputDir.css, file);
            const outputPath = path.join(outputDir.css, file.replace('.css', '.min.css'));

            const css = fs.readFileSync(inputPath, 'utf8');
            const minified = new CleanCSS().minify(css);

            fs.writeFileSync(outputPath, minified.styles);
            console.log(`Minified CSS: ${outputPath}`);
        }
    });
});

// Minify JavaScript files
fs.readdir(inputDir.js, (err, files) => {
    if (err) {
        console.error('Error reading JS directory:', err);
        return;
    }

    files.forEach(async file => {
        if (file.endsWith('.js')) {
            const inputPath = path.join(inputDir.js, file);
            const outputPath = path.join(outputDir.js, file.replace('.js', '.min.js'));

            const js = fs.readFileSync(inputPath, 'utf8');
            const minified = await Terser.minify(js);

            fs.writeFileSync(outputPath, minified.code);
            console.log(`Minified JS: ${outputPath}`);
        }
    });
}); 