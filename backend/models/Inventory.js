const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // every item MUST belong to a user - this is our ownership boundary
    },
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: 'Uncategorized',
    },
    description: {
      type: String,
      trim: true,
    },
    purchaseDate: {
      type: Date,
    },
    purchasePrice: {
      type: Number,
      min: 0,
    },
    warrantyExpiry: {
      type: Date,
    },
    serialNumber: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
      // NOTE: this is just a plain string field here.
      // Person 2's Media/Cloudinary module is responsible for producing this URL.
      // We do not touch Cloudinary logic in this module.
    },
  },
  { timestamps: true } // gives us createdAt (required by schema) + updatedAt for free
);

// Index to make "get all items for this user" queries fast
inventorySchema.index({ user: 1 });

module.exports = mongoose.model('Inventory', inventorySchema);