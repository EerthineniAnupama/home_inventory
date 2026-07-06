const multer = require('multer');

// Store file in memory (as a Buffer) instead of writing to local disk first -
// we stream it straight to Cloudinary. Fine for a student project's file sizes.
const storage = multer.memoryStorage();

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

function fileFilter(req, file, cb) {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Allowed: jpg, png, webp, pdf'), false);
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB cap
  },
});

module.exports = upload;
