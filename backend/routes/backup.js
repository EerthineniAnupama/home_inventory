const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth');
const { createBackup, restoreBackup, getBackupStatus } = require('../controllers/backupController');

router.use(authMiddleware);

// POST /api/backup/create  -> triggers a new snapshot
router.post('/create', createBackup);

// GET /api/backup/restore  -> fetches the latest successful snapshot
router.get('/restore', restoreBackup);

// GET /api/backup/status  -> last backup time, status, counts
router.get('/status', getBackupStatus);

module.exports = router;
