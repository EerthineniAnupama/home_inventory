const Inventory = require('../models/Inventory');

async function createItem(userId, data) {
  const item = await Inventory.create({
    user: userId,
    itemName: data.itemName,
    category: data.category,
    description: data.description,
    purchaseDate: data.purchaseDate,
    purchasePrice: data.purchasePrice,
    warrantyExpiry: data.warrantyExpiry,
    serialNumber: data.serialNumber,
    imageUrl: data.imageUrl,
  });

  return item;
}

async function getUserItems(userId) {
  // Only ever return items belonging to this user
  return Inventory.find({ user: userId }).sort({ createdAt: -1 });
}

async function getItemById(userId, itemId) {
  const item = await Inventory.findById(itemId);

  if (!item) {
    const error = new Error('Inventory item not found');
    error.statusCode = 404;
    throw error;
  }

  // Ownership check - critical: a user must never read another user's item
  if (item.user.toString() !== userId.toString()) {
    const error = new Error('You are not authorized to access this item');
    error.statusCode = 403;
    throw error;
  }

  return item;
}

async function updateItem(userId, itemId, updates) {
  // Reuses getItemById so the same ownership check applies before any update
  const item = await getItemById(userId, itemId);

  const allowedFields = [
    'itemName',
    'category',
    'description',
    'purchaseDate',
    'purchasePrice',
    'warrantyExpiry',
    'serialNumber',
    'imageUrl',
  ];

  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      item[field] = updates[field];
    }
  });

  await item.save();
  return item;
}

async function deleteItem(userId, itemId) {
  // Reuses getItemById so the same ownership check applies before deleting
  const item = await getItemById(userId, itemId);
  await item.deleteOne();
  return item;
}

module.exports = {
  createItem,
  getUserItems,
  getItemById,
  updateItem,
  deleteItem,
};