const express = require('express');
const router = express.Router();

const exportController = require('../controllers/exportController');
const authMiddleware = require('../middleware/auth'); // reusing existing middleware

router.get('/csv', authMiddleware, exportController.exportCSV);
router.get('/pdf', authMiddleware, exportController.exportPDF);

module.exports = router;