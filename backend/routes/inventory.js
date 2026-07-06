const express = require('express');
const router = express.Router();

const inventoryController = require('../controllers/inventoryController');
const authMiddleware = require('../middleware/auth'); // reusing teammate's existing middleware

// Every route below requires a valid JWT (req.userId is set by authMiddleware)
router.post('/', authMiddleware, inventoryController.createItem);
router.get('/', authMiddleware, inventoryController.getAllItems);
router.get('/:id', authMiddleware, inventoryController.getItem);
router.put('/:id', authMiddleware, inventoryController.updateItem);
router.delete('/:id', authMiddleware, inventoryController.deleteItem);

module.exports = router;