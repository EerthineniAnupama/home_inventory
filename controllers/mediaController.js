const cloudinary = require('../config/cloudinary');
const Media = require('../models/Media');
const { processImage } = require('../utils/imageProcessor');
const { retryWithBackoff } = require('../utils/retry');

/**
 * Helper: uploads a buffer to Cloudinary using an upload_stream.
 * Cloudinary's SDK expects a stream, but multer memoryStorage gives us
 * a Buffer, so we wrap it in a Promise.
 */
function uploadBufferToCloudinary(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });
}

// POST /api/media/upload
async function uploadMedia(req, res) {
  try {
    const { item_id } = req.body;
    const userId = req.userId;

    if (!item_id) {
      return res.status(400).json({ error: 'item_id is required' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded (expected field name "file")' });
    }

    const isPdf = req.file.mimetype === 'application/pdf';

    let bufferToUpload = req.file.buffer;
    if (!isPdf) {
      bufferToUpload = await processImage(req.file.buffer);
    }

    const result = await retryWithBackoff(() =>
      uploadBufferToCloudinary(bufferToUpload, {
        folder: `home-inventory/${userId}/${item_id}`,
        resource_type: isPdf ? 'auto' : 'image',
        quality: isPdf ? undefined : 'auto',
        fetch_format: isPdf ? undefined : 'auto',
        eager: isPdf ? [] : [{ width: 300, height: 300, crop: 'thumb', gravity: 'auto' }],
      })
    );

    const media = await Media.create({
      item_id,
      user_id: userId,
      url: result.secure_url,
      thumbnail_url: result.eager && result.eager[0] ? result.eager[0].secure_url : result.secure_url,
      public_id: result.public_id,
      file_type: isPdf ? 'pdf' : 'image',
      file_size: bufferToUpload.length,
      original_size: req.file.size,
      original_name: req.file.originalname,
    });

    return res.status(201).json({ media });
  } catch (err) {
    console.error('[uploadMedia]', err);
    return res.status(500).json({ error: 'Upload failed', details: err.message });
  }
}

// GET /api/media/item/:itemId
async function getMediaForItem(req, res) {
  try {
    const { itemId } = req.params;
    const userId = req.userId;

    const media = await Media.find({ item_id: itemId, user_id: userId }).sort({ createdAt: -1 });
    return res.json({ count: media.length, media });
  } catch (err) {
    console.error('[getMediaForItem]', err);
    return res.status(500).json({ error: 'Failed to fetch media' });
  }
}

// DELETE /api/media/:mediaId
async function deleteMedia(req, res) {
  try {
    const { mediaId } = req.params;
    const userId = req.userId;

    const media = await Media.findOne({ _id: mediaId, user_id: userId });
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    await cloudinary.uploader.destroy(media.public_id);
    await media.deleteOne();

    return res.json({ message: 'Media deleted', mediaId });
  } catch (err) {
    console.error('[deleteMedia]', err);
    return res.status(500).json({ error: 'Delete failed' });
  }
}

module.exports = { uploadMedia, getMediaForItem, deleteMedia };
