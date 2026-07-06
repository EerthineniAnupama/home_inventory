const Backup = require('../models/Backup');
const { createBackupForUser, restoreLatestBackup } = require('../services/backupService');

// POST /api/backup/create
async function createBackup(req, res) {
  try {
    const authToken = req.headers.authorization?.split(' ')[1];
    const backupRecord = await createBackupForUser(req.userId, authToken);
    return res.status(201).json({ backup: backupRecord });
  } catch (err) {
    console.error('[createBackup]', err);
    return res.status(500).json({ error: 'Backup failed', details: err.message });
  }
}

// GET /api/backup/restore?apply=true
async function restoreBackup(req, res) {
  try {
    const shouldApply = req.query.apply === 'true';
    const result = await restoreLatestBackup(req.userId, { apply: shouldApply });

    if (result.notFound) {
      return res.status(404).json({ error: 'No successful backup found for this user' });
    }

    return res.json(result);
  } catch (err) {
    console.error('[restoreBackup]', err);
    return res.status(500).json({ error: 'Restore failed', details: err.message });
  }
}

// GET /api/backup/status
async function getBackupStatus(req, res) {
  try {
    const userId = req.userId;
    const latest = await Backup.findOne({ user_id: userId }).sort({ createdAt: -1 });

    if (!latest) {
      return res.json({ status: 'never_backed_up' });
    }

    return res.json({
      status: latest.status,
      last_backup_at: latest.createdAt,
      item_count: latest.item_count,
      media_count: latest.media_count,
      size_bytes: latest.size_bytes,
      error_message: latest.status === 'failed' ? latest.error_message : undefined,
    });
  } catch (err) {
    console.error('[getBackupStatus]', err);
    return res.status(500).json({ error: 'Failed to fetch backup status' });
  }
}

module.exports = { createBackup, restoreBackup, getBackupStatus };
