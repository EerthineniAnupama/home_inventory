const mongoose = require('mongoose');

/**
 * One document per backup snapshot taken. We keep history (not just
 * "latest") so a broken/incomplete backup doesn't wipe out the last
 * good one, and so you can show a backup history list in the UI later.
 */
const backupSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    snapshot_url: {
      // Where the JSON snapshot file lives in cloud storage
      type: String,
    },
    public_id: {
      // Cloudinary public_id for the snapshot file, needed to delete/overwrite it
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    item_count: {
      type: Number,
      default: 0,
    },
    media_count: {
      type: Number,
      default: 0,
    },
    size_bytes: {
      type: Number,
    },
    error_message: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Backup', backupSchema);
