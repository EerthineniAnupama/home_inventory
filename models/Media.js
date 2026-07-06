const mongoose = require('mongoose');

/**
 * We do NOT store the actual image/file bytes here.
 * We store metadata + the Cloudinary URL that points to the real file.
 *
 * item_id and user_id are just strings/ObjectIds that reference
 * Person 1's Item/User collections. Confirm the exact ID format
 * (Mongo ObjectId vs custom string) with Person 1 before finalizing.
 */
const mediaSchema = new mongoose.Schema(
  {
    item_id: {
      type: String,
      required: true,
      index: true,
    },
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
    },
    thumbnail_url: {
      type: String,
    },
    public_id: {
      // Cloudinary's internal file ID - needed later to delete the file
      type: String,
      required: true,
    },
    file_type: {
      type: String,
      enum: ['image', 'pdf', 'other'],
      default: 'image',
    },
    file_size: {
      type: Number, // size actually stored, in bytes (post-compression)
    },
    original_size: {
      type: Number, // size before our compression step, for comparison
    },
    original_name: {
      type: String,
    },
  },
  { timestamps: true } // adds createdAt / updatedAt automatically
);

module.exports = mongoose.model('Media', mediaSchema);
