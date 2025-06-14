const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'Images');
const outputFile = path.join(__dirname, 'images.json');

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

fs.readdir(imagesDir, (err, files) => {
  if (err) {
    console.error('Error reading Images folder:', err);
    return;
  }

  const imageFiles = files.filter(file => 
    allowedExtensions.includes(path.extname(file).toLowerCase())
  );

  fs.writeFileSync(outputFile, JSON.stringify(imageFiles, null, 2));
  console.log(`Generated ${outputFile} with ${imageFiles.length} images.`);
});
