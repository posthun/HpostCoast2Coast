const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'Images');
const outputFile = path.join(__dirname, 'images.json');

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

try {
  const files = fs.readdirSync(imagesDir);

  const imageFiles = files.filter(file =>
    allowedExtensions.includes(path.extname(file).toLowerCase())
  );

  fs.writeFileSync(outputFile, JSON.stringify(imageFiles, null, 2));
  console.log(`✅ Generated ${outputFile} with ${imageFiles.length} images.`);
} catch (err) {
  console.error('❌ Error generating image list:', err.message);
  process.exit(1); // Ensure GitHub Actions fails if something goes wrong
}
