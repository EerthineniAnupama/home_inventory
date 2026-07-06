const cloudinary = require('../config/cloudinary');
const axios = require('axios');
const Backup = require('../models/Backup');
const Media = require('../models/Media');
const { fetchItemsForUser } = require('../utils/itemsClient');
const { retryWithBackoff } = require('../utils/retry');

function uploadJsonToCloudinary(jsonBuffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { ...options, resource_type: 'raw' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(jsonBuffer);
  });
}

/**
 * Builds a snapshot, uploads it to Cloudinary, and records the result in
 * the Backup collection. Used by the /api/backup/create route, and directly
 * by scripts/demoRestore.js for local testing without going through HTTP.
 */
async function createBackupForUser(userId, authToken) {
  const backupRecord = await Backup.create({ user_id: userId, status: 'pending' });

  try {
    const [items, media] = await Promise.all([
      fetchItemsForUser(userId, authToken),
      Media.find({ user_id: userId }).lean(),
    ]);

    const snapshot = {
      version: 1,
      user_id: userId,
      created_at: new Date().toISOString(),
      item_count: items.length,
      media_count: media.length,
      items,
      media,
    };

    const jsonBuffer = Buffer.from(JSON.stringify(snapshot, null, 2));

    const result = await retryWithBackoff(() =>
      uploadJsonToCloudinary(jsonBuffer, {
        folder: `home-inventory/${userId}/backups`,
        public_id: `backup-${Date.now()}`,
      })
    );

    backupRecord.snapshot_url = result.secure_url;
    backupRecord.public_id = result.public_id;
    backupRecord.status = 'success';
    backupRecord.item_count = items.length;
    backupRecord.media_count = media.length;
    backupRecord.size_bytes = jsonBuffer.length;
    await backupRecord.save();

    return backupRecord;
  } catch (err) {
    backupRecord.status = 'failed';
    backupRecord.error_message = err.message;
    await backupRecord.save();
    throw err;
  }
}

/**
 * Fetches the latest successful snapshot, validates media links, and
 * optionally writes the media records back into the DB (apply=true).
 */
async function restoreLatestBackup(userId, { apply = false } = {}) {
  const latest = await Backup.findOne({ user_id: userId, status: 'success' }).sort({ createdAt: -1 });

  if (!latest || !latest.snapshot_url) {
    return { notFound: true };
  }

  const response = await axios.get(latest.snapshot_url, { timeout: 15000 });
  const snapshot = response.data;

  const mediaWithLinkStatus = await Promise.all(
    (snapshot.media || []).map(async (item) => {
      try {
        await axios.head(item.url, { timeout: 5000 });
        return { ...item, link_status: 'ok' };
      } catch {
        return { ...item, link_status: 'broken' };
      }
    })
  );

  const brokenCount = mediaWithLinkStatus.filter((m) => m.link_status === 'broken').length;
  let restoredCount = 0;

  if (apply) {
    const writes = mediaWithLinkStatus
      .filter((m) => m.link_status === 'ok')
      .map((m) => {
        const { _id, __v, ...fields } = m;
        return Media.findByIdAndUpdate(_id, fields, { upsert: true, new: true });
      });
    const results = await Promise.all(writes);
    restoredCount = results.length;
  }

  return {
    notFound: false,
    backup_id: latest._id,
    backed_up_at: latest.createdAt,
    applied: apply,
    restored_media_count: restoredCount,
    broken_media_count: brokenCount,
    snapshot: { ...snapshot, media: mediaWithLinkStatus },
  };
}

module.exports = { createBackupForUser, restoreLatestBackup };
