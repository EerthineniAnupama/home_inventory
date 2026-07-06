# Media Service (Person 2 — Media & Cloud Services)

Covers Phase 0 (setup) and Phase 1 (basic media upload/retrieve/delete) of the Home Inventory App.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in:
   - `MONGO_URI` — use the same DB Person 1 connects to (different collection, `media`)
   - Cloudinary credentials from https://cloudinary.com (free tier dashboard)
   - `JWT_SECRET` — must match Person 1's auth service exactly, or tokens won't verify
3. `npm run dev` (or `npm start`)
4. Visit `http://localhost:5001/health` — should return `{"status":"ok"}`

## Endpoints (all require `Authorization: Bearer <token>`)

| Method | Route                     | Body / Params                          | Description                     |
|--------|----------------------------|------------------------------------------|----------------------------------|
| POST   | `/api/media/upload`        | form-data: `file`, `item_id`             | Upload image/PDF, get back URL + thumbnail |
| GET    | `/api/media/item/:itemId`  | -                                         | List all media for one item      |
| DELETE | `/api/media/:mediaId`      | -                                         | Delete a media record + cloud file |

## Notes for integration with Person 1

- `item_id` is currently treated as a plain string. Confirm the exact format
  (Mongo ObjectId string, UUID, custom ID) Person 1 uses for Items, and update
  the `Media` schema if needed.
- `req.userId` is extracted from the JWT payload (`decoded.userId || decoded.id || decoded._id`).
  Confirm which field name Person 1's login endpoint actually puts in the token payload.
- This service runs independently on its own port (default 5001) so you can develop
  without waiting on Person 1's server to be up. Wire them together via the frontend
  or an API gateway later.

## Phase 2: Image Processing (done)

- `utils/imageProcessor.js` uses `sharp` to resize (max width 1920px, never
  upscales smaller images) and compress (JPEG quality 80, mozjpeg) BEFORE
  the file is sent to Cloudinary. This cuts upload bandwidth and storage.
- Auto-orients images based on EXIF data (fixes sideways phone photos).
- PDFs skip this step entirely and go straight to Cloudinary.
- Cloudinary applies a second optimization pass on delivery
  (`quality: auto`, `fetch_format: auto`) on top of our own compression.
- `Media` model tracks both `file_size` (stored, post-compression) and
  `original_size` (pre-compression).
- Thumbnails (300x300) still generated via Cloudinary's `eager` transform.

Tested locally with generated images (no Cloudinary account needed): a
3000x2000 test image was resized to 1920x1280 and compressed to ~21% of
its original size; a 400x300 image was correctly left alone (no upscaling).

## Phase 3: Backup Service (done)

### Endpoints (all require `Authorization: Bearer <token>`)

| Method | Route                  | Description                                              |
|--------|------------------------|------------------------------------------------------------|
| POST   | `/api/backup/create`   | Builds a snapshot of the user's items + media, uploads it as JSON to Cloudinary |
| GET    | `/api/backup/restore`  | Fetches the latest successful snapshot                     |
| GET    | `/api/backup/status`   | Returns last backup time, status, item/media counts        |

### How it pulls Person 1's data — IMPORTANT, decide this together

`utils/itemsClient.js` supports two modes, set via `ITEMS_SOURCE` in `.env`:

- **`db` (default):** reads directly from a shared MongoDB `items` collection
  (same `MONGO_URI`). Simple, no network call, but assumes one shared database.
- **`http`:** calls Person 1's own API (`ITEMS_SERVICE_URL`) to fetch items
  for a user. Works if you deploy as fully separate services.

**Talk to Person 1 before testing this phase** — confirm:
1. Do you share one MongoDB, or does each service have its own DB?
2. If shared: what's their items collection actually called, and what field
   holds the owning user's ID (`user_id`? `owner`? `userId`?)
3. If separate services: what's the exact endpoint + response shape for
   "get all items for a user"?

Update `.env` accordingly — no code changes needed, just the `ITEMS_SOURCE`,
`ITEMS_COLLECTION_NAME`, or `ITEMS_SERVICE_URL` values.

### What a snapshot looks like

```json
{
  "version": 1,
  "user_id": "user123",
  "created_at": "2026-07-05T...",
  "item_count": 2,
  "media_count": 1,
  "items": [ ... ],
  "media": [ ... ]
}
```

Snapshots are stored as versioned files in Cloudinary (`resource_type: raw`),
one file per backup — old backups aren't deleted, so restore always has a
fallback if the latest one is somehow corrupted.

Backup metadata (status, timestamps, counts) lives in a new `Backup`
collection, separate from the snapshot file itself.

### Tested without needing live Cloudinary/Mongo

Verified the snapshot JSON builds and round-trip parses correctly with
sample item/media data — the actual upload/fetch calls need real credentials
to test end-to-end.

## Phase 4: Restore (done — this was missing its own write-up earlier)

The restore endpoint existed since Phase 3, but it only ever *returned*
snapshot JSON — it never proved data could actually come back into the app.
Two things fixed that:

- **`GET /api/backup/restore?apply=true`**: the `apply=true` flag makes
  restore actually upsert the media records back into the `Media`
  collection (by `_id`, so running it twice is safe — no duplicates).
  Without `apply=true` it behaves as before: just returns the snapshot for
  inspection, doesn't touch the DB. Broken links (flagged in Phase 5, see
  below) are never resurrected into the DB.
- **`services/backupService.js`**: pulled the core create/restore logic out
  of the controller into a reusable service layer. This isn't just tidiness
  — it means the exact same code path used by the API can also be called
  directly from a script, which is what makes the demo below a real test
  instead of a simulation.
- **`scripts/demoRestore.js`**: run with `node scripts/demoRestore.js`
  (needs real Mongo/Cloudinary credentials in `.env`). Step by step, it:
  1. Creates a fake media record (as if a photo was uploaded)
  2. Backs it up
  3. **Deletes it from the DB** — simulating the phone/laptop being lost
  4. Calls restore with `apply=true`
  5. Confirms the record exists again and prints ✅/❌

This is the actual proof-of-concept for "your data isn't lost if your
device is." Run it once your `.env` is filled in — it's worth running live
in front of Person 1 or during a demo.

## Phase 4: Restore — proving it works (done)

`GET /api/backup/restore` (built as part of Phase 3 above, since it's tightly
coupled to backup creation) already handles reconstructing a user's data.
Phase 4's real job is proving that promise holds under simulated data loss.

Run `scripts/testRestoreFlow.js` against your running server + a real JWT to
see the actual demo flow:

```bash
node scripts/testRestoreFlow.js <your-jwt-token>
```

It creates a backup, then immediately calls restore (standing in for "user
gets a new phone") and prints the item/media counts + a sample restored
media entry, plus any `broken_media_count`. Compare the counts to what you
expect that user to have — matching counts = nothing was lost.

## Phase 5: Sync Status & Polish (done)

- **Retry logic** (`utils/retry.js`): wraps Cloudinary uploads (both media
  uploads and backup snapshot uploads) with exponential backoff — 3 attempts
  by default (500ms, 1000ms, 2000ms delays). Transient network blips no
  longer fail the whole operation; only a persistent failure does.
- **Broken link detection on restore**: `GET /api/backup/restore` now does a
  parallel HEAD request against every media URL in the snapshot. If a file
  was deleted from Cloudinary directly (or the account changed) but the DB
  record still thinks it exists, that media item comes back tagged
  `link_status: 'broken'` instead of silently returning a dead link. Response
  also includes a `broken_media_count` so the frontend can surface a warning.
- **Request logging**: every request now logs method, path, status code, and
  response time — makes it much easier to see what's failing during a demo
  or dev session instead of guessing.
- **Safer global error handler**: unexpected/unhandled errors return a
  generic message instead of leaking internal error details (stack traces,
  DB connection strings, etc.) to the client. Specific, expected failures
  (bad input, missing backup, etc.) still return helpful messages from the
  individual controllers.

Tested in isolation without needing live Cloudinary credentials: simulated
a function that fails twice then succeeds (retry recovers, returns result
on 3rd attempt) and a function that always fails (retry gives up cleanly
after 3 attempts and throws, rather than hanging or retrying forever).

## What's next (Phase 6)

- Integration testing with Person 1's actual API/DB (once `ITEMS_SOURCE` is confirmed)
- End-to-end demo: create item -> upload photo -> backup -> simulate data loss -> restore
- Write final API docs for the frontend
