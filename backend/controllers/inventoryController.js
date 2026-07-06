const inventoryService = require('../services/inventoryService');

// POST /api/inventory
async function createItem(req, res, next) {
  try {
    const { itemName } = req.body;

    if (!itemName) {
      return res.status(400).json({ error: 'itemName is required' });
    }

    const item = await inventoryService.createItem(req.userId, req.body);
    return res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

// GET /api/inventory
async function getAllItems(req, res, next) {
  try {
    const items = await inventoryService.getUserItems(req.userId);
    return res.status(200).json(items);
  } catch (err) {
    next(err);
  }
}

// GET /api/inventory/:id
async function getItem(req, res, next) {
  try {
    const item = await inventoryService.getItemById(req.userId, req.params.id);
    return res.status(200).json(item);
  } catch (err) {
    next(err);
  }
}

// PUT /api/inventory/:id
async function updateItem(req, res, next) {
  try {
    const item = await inventoryService.updateItem(req.userId, req.params.id, req.body);
    return res.status(200).json(item);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/inventory/:id
async function deleteItem(req, res, next) {
  try {
    await inventoryService.deleteItem(req.userId, req.params.id);
    return res.status(200).json({ message: 'Item deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createItem,
  getAllItems,
  getItem,
  updateItem,
  deleteItem,
};