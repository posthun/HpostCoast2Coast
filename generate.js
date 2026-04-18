const fs = require("fs-extra");
const path = require("path");
const sharp = require("sharp");
const exifr = require("exifr");

const CONTENT = "./public/content";
const OUTPUT = "./public/generated";
const THUMBS = "./public/thumbnails";

const THUMB_SIZE = 400;

// --------------------
// Thumbnail generation
// --------------------
async function createThumbnail(input, output) {
  await fs.ensureDir(path.dirname(output));

  if (await fs.pathExists(output)) return;

  await sharp(input)
    .resize(THUMB_SIZE, THUMB_SIZE, {
      fit: "cover",        // square crop
      position: "attention"
    })
    .jpeg({ quality: 80 })
    .toFile(output);
}

// --------------------
// EXIF extraction
// --------------------
async function getExif(file) {
  try {
    const d = await exifr.parse(file);
    if (!d) return null;

    return {
      camera: `${d.Make || ""} ${d.Model || ""}`.trim(),
      lens: d.LensModel || null,
      focal: d.FocalLength || null,
      aperture: d.FNumber || null,
      shutter: d.ExposureTime || null,
      iso: d.ISO || null,
      date: d.DateTimeOriginal || null
    };
  } catch {
    return null;
  }
}

// --------------------
// Core processor
// --------------------
async function processFolder(dir, thumbDir, webBase) {
  const files = await fs.readdir(dir);
  const images = [];

  for (const file of files) {
    if (!file.match(/\.(jpg|jpeg|png|webp)$/i)) continue;

    const fullPath = path.join(dir, file);
    const thumbPath = path.join(thumbDir, file);

    await createThumbnail(fullPath, thumbPath);

    const exif = await getExif(fullPath);

    images.push({
      full: `${webBase}/${file}`, // relative path for browser
      thumb: `./thumbnails/${path
        .relative(THUMBS, thumbPath)
        .replace(/\\/g, "/")}`,
      exif
    });
  }

  return images;
}

// --------------------
// Main build
// --------------------
async function main() {
  console.log("🧹 Cleaning old build...");

  // Clear generated + thumbnails (but keep content)
  await fs.remove(OUTPUT);
  await fs.remove(THUMBS);

  await fs.ensureDir(OUTPUT);
  await fs.ensureDir(THUMBS);

  // --------------------
  // Main images
  // --------------------
  console.log("🖼️ Processing main images...");

  const mainImages = await processFolder(
    `${CONTENT}/images`,
    `${THUMBS}/images`,
    "./content/images"
  );

  await fs.writeJson(`${OUTPUT}/images.json`, mainImages, { spaces: 2 });

  // --------------------
  // Collections
  // --------------------
  console.log("📚 Processing collections...");

  const collectionsDir = `${CONTENT}/collections`;
  const folders = await fs.readdir(collectionsDir);

  const collections = [];

  for (const folder of folders) {
    const fullPath = path.join(collectionsDir, folder);

    if (!(await fs.stat(fullPath)).isDirectory()) continue;

    const descriptionPath = path.join(fullPath, "description.txt");

    let description = "";
    if (await fs.pathExists(descriptionPath)) {
      description = await fs.readFile(descriptionPath, "utf-8");
    }

    const images = await processFolder(
      fullPath,
      `${THUMBS}/collections/${folder}`,
      `./content/collections/${folder}`
    );

    collections.push({
      name: folder,
      description,
      images
    });
  }

  await fs.writeJson(`${OUTPUT}/collections.json`, collections, {
    spaces: 2
  });

  console.log("✅ Build complete");
}

main();