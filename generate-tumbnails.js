// generate-thumbnails.js
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

const inputDir = './Images';
const outputDir = './Thumbnails';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const files = fs.readdirSync(inputDir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));

files.forEach(file => {
  const inputPath = path.join(inputDir, file);
  const outputPath = path.join(outputDir, file);

  sharp(inputPath)
    .resize(400) // or 300 for even faster loads
    .jpeg({ quality: 75 }) // keeps files small but nice
    .toFile(outputPath)
    .then(() => console.log(`✅ Thumbnail created: ${file}`))
    .catch(err => console.error(`❌ Error on ${file}:`, err));
});
