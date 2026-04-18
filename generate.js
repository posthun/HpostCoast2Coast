const fs = require("fs-extra");
const path = require("path");
const sharp = require("sharp");
const exifr = require("exifr");

const INPUT = "./public/content";
const OUTPUT = "./public/generated";
const THUMBS = "./public/thumbnails";

const THUMB_WIDTH = 400;

const toWebPath = (filePath) =>
  filePath.replace(/^\.\/public\//, "").replace(/^public\//, "").replace(/\\/g, "/");

async function thumb(input, output) {
  await fs.ensureDir(path.dirname(output));

  if (await fs.pathExists(output)) return;

  await sharp(input)
    .resize({ width: THUMB_WIDTH })
    .jpeg({ quality: 80 })
    .toFile(output);
}

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

async function processFolder(dir, outThumbDir) {
  const files = await fs.readdir(dir);

  const images = [];

  for (const file of files) {
    if (!file.match(/\.(jpg|jpeg|png|webp)$/i)) continue;

    const fullPath = path.join(dir, file);

    // IMPORTANT: ensure thumbs go into /public/thumbnails
    const thumbPath = path.join(outThumbDir, file);

    await thumb(fullPath, thumbPath);

    const exif = await getExif(fullPath);

    images.push({
      full: `/content/${path.basename(dir)}/${file}`.replace(/\\/g, "/"),
      thumb: `/thumbnails/${path.relative(THUMBS, thumbPath).replace(/\\/g, "/")}`,
      exif
    });
  }

  return images;
}

async function main() {
  await fs.ensureDir(OUTPUT);
  await fs.ensureDir(THUMBS);

  // MAIN IMAGES
  const mainImages = await processFolder(
    `${INPUT}/images`,
    `${THUMBS}/images`
  );

  await fs.writeJson(`${OUTPUT}/images.json`, mainImages, { spaces: 2 });

  // COLLECTIONS
  const collectionsDir = `${INPUT}/collections`;
  const folders = await fs.readdir(collectionsDir);

  const collections = [];

  for (const folder of folders) {
    const fullPath = path.join(collectionsDir, folder);

    const descriptionPath = path.join(fullPath, "description.txt");

    let description = "";
    if (await fs.pathExists(descriptionPath)) {
      description = await fs.readFile(descriptionPath, "utf-8");
    }

    const images = await processFolder(
      fullPath,
      `${THUMBS}/collections/${folder}`
    );

    collections.push({
      name: folder,
      description,
      images
    });
  }

  await fs.writeJson(`${OUTPUT}/collections.json`, collections, { spaces: 2 });

  console.log("✅ Build complete");
}

main();