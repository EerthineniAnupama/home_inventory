const sharp = require('sharp');

const MAX_WIDTH = 1920; // cap dimension - no need to store 4000px phone photos
const JPEG_QUALITY = 80; // good balance of size vs visual quality

/**
 * Resizes + compresses an image buffer before it ever leaves our server.
 * This matters because:
 *  - it cuts upload time/bandwidth to Cloudinary
 *  - it keeps storage costs down at scale
 *  - Cloudinary's own "auto quality" (added in the controller) then does a
 *    second pass on top of this for delivery
 *
 * PDFs and other non-image files should never be passed here - check
 * file_type before calling.
 */
async function processImage(buffer) {
  const processed = await sharp(buffer)
    .rotate() // auto-orient based on EXIF (fixes sideways phone photos)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true }) // never upscale small images
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();

  return processed;
}

module.exports = { processImage, MAX_WIDTH, JPEG_QUALITY };
