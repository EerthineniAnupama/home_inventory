const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  uploadMedia,
  getMediaForItem,
  deleteMedia,
} = require('../controllers/mediaController');

// All media routes require a logged-in user
router.use(authMiddleware);

// POST /api/media/upload  (multipart/form-data, field name "file", plus body field "item_id")
router.post('/upload', upload.single('file'), uploadMedia);

// GET /api/media/item/:itemId  -> all media for one item
router.get('/item/:itemId', getMediaForItem);

// DELETE /api/media/:mediaId
router.delete('/:mediaId', deleteMedia);

module.exports = router;
