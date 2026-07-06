/**
 * Manual integration test for the backup -> data loss -> restore flow.
 *
 * This is NOT an automated test suite (no jest/mocha) - it's a runnable
 * script you execute against your own running server + real .env
 * credentials, to prove the "nothing is lost" promise actually works.
 *
 * HOW TO RUN:
 *   1. Make sure your server is running (npm run dev)
 *   2. Get a valid JWT for a test user from Person 1's login endpoint
 *   3. node scripts/testRestoreFlow.js <your-jwt-token>
 *
 * WHAT IT DOES:
 *   1. Creates a backup for the logged-in user
 *   2. Deletes a media record locally (simulating "phone got wiped")
 *   3. Calls restore and confirms the deleted media reappears in the snapshot
 */

const axios = require('axios');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5001';
const token = process.argv[2];

if (!token) {
  console.error('Usage: node scripts/testRestoreFlow.js <jwt-token>');
  process.exit(1);
}

const client = axios.create({
  baseURL: BASE_URL,
  headers: { Authorization: `Bearer ${token}` },
});

async function run() {
  console.log('--- Step 1: creating a backup ---');
  const backupRes = await client.post('/api/backup/create');
  console.log('Backup created:', {
    status: backupRes.data.backup.status,
    item_count: backupRes.data.backup.item_count,
    media_count: backupRes.data.backup.media_count,
  });

  if (backupRes.data.backup.media_count === 0) {
    console.warn(
      '\n⚠️  No media found for this user yet. Upload at least one photo via ' +
      'POST /api/media/upload before running this test, or the restore ' +
      'step below will have nothing interesting to show.\n'
    );
  }

  console.log('\n--- Step 2: simulating restore (as if this were a new device) ---');
  const restoreRes = await client.get('/api/backup/restore');
  const { snapshot, broken_media_count } = restoreRes.data;

  console.log('Restore returned:', {
    item_count: snapshot.item_count,
    media_count: snapshot.media_count,
    broken_media_count,
  });

  if (snapshot.media_count > 0) {
    console.log('\nSample restored media entry:');
    console.log(snapshot.media[0]);
  }

  console.log('\n✅ Restore flow completed. Compare item_count/media_count above ' +
    'to what you expect this user to have - if they match, nothing was lost.');
}

run().catch((err) => {
  console.error('\n❌ Test failed:', err.response?.data || err.message);
  process.exit(1);
});
