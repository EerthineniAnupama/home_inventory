/**
 * Demo script for Phase 4 - proves the actual point of this whole service:
 * if your phone breaks, your data comes back.
 *
 * This connects to your REAL MongoDB and Cloudinary (via .env), so it
 * needs valid credentials to run. It does NOT go through the HTTP API or
 * auth middleware - it calls the service layer directly, which is enough
 * to prove the backup/restore logic itself works end to end.
 *
 * Run with: node scripts/demoRestore.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Media = require('../models/Media');
const Backup = require('../models/Backup');
const { createBackupForUser, restoreLatestBackup } = require('../services/backupService');

const DEMO_USER_ID = 'demo-user-phase4';

async function main() {
  await connectDB();

  console.log('\n=== STEP 0: Clean slate ===');
  await Media.deleteMany({ user_id: DEMO_USER_ID });
  await Backup.deleteMany({ user_id: DEMO_USER_ID });
  console.log('Cleared any old demo data for', DEMO_USER_ID);

  console.log('\n=== STEP 1: Simulate an existing upload ===');
  // Normally this record gets created by the real /api/media/upload route.
  // Here we insert it directly since we're not spinning up the HTTP server.
  const fakeMedia = await Media.create({
    item_id: 'demo-item-1',
    user_id: DEMO_USER_ID,
    url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', // Cloudinary's public demo image - always resolves
    thumbnail_url: 'https://res.cloudinary.com/demo/image/upload/w_300,h_300,c_thumb/sample.jpg',
    public_id: 'demo/sample',
    file_type: 'image',
    file_size: 12345,
    original_size: 54321,
    original_name: 'sample.jpg',
  });
  console.log('Created fake media record:', fakeMedia._id.toString());

  console.log('\n=== STEP 2: Back it up ===');
  const backup = await createBackupForUser(DEMO_USER_ID, null);
  console.log('Backup status:', backup.status);
  console.log('Snapshot stored at:', backup.snapshot_url);

  console.log('\n=== STEP 3: Simulate data loss (phone breaks, DB entry gone) ===');
  await Media.deleteMany({ user_id: DEMO_USER_ID });
  const checkGone = await Media.find({ user_id: DEMO_USER_ID });
  console.log('Media records remaining after "data loss":', checkGone.length, '(should be 0)');

  console.log('\n=== STEP 4: Restore ===');
  const restoreResult = await restoreLatestBackup(DEMO_USER_ID, { apply: true });
  console.log('Restored media count:', restoreResult.restored_media_count);
  console.log('Broken media count:', restoreResult.broken_media_count);

  console.log('\n=== STEP 5: Verify data actually came back ===');
  const recovered = await Media.find({ user_id: DEMO_USER_ID });
  console.log('Media records found after restore:', recovered.length, '(should be 1)');
  if (recovered.length === 1) {
    console.log('✅ SUCCESS: data survived simulated loss and was restored.');
  } else {
    console.log('❌ FAILED: restore did not bring the data back.');
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Demo script crashed:', err);
  process.exit(1);
});
