const mongoose = require('mongoose');
const axios = require('axios');

/**
 * IMPORTANT: This is the main integration point with Person 1's service.
 * There are two ways this could work depending on how you two set things up -
 * pick ONE and set ITEMS_SOURCE in your .env accordingly.
 *
 * MODE 1 - "db": You share one MongoDB instance/database. This service reads
 * directly from Person 1's `items` collection (read-only, we never write to it).
 * Simple, no network hop, but couples you to their exact collection name/schema.
 *
 * MODE 2 - "http": Person 1 runs their own service with a REST API. We call
 * it over HTTP to get a user's items. More decoupled, works even if you end
 * up deploying as separate services, but requires their API to be running
 * whenever you back up.
 *
 * Ask Person 1 which collection name / endpoint path they're actually using
 * and update ITEMS_COLLECTION_NAME or ITEMS_SERVICE_URL below.
 */

const ITEMS_SOURCE = process.env.ITEMS_SOURCE || 'db'; // 'db' | 'http'
const ITEMS_COLLECTION_NAME = process.env.ITEMS_COLLECTION_NAME || 'items';
const ITEMS_SERVICE_URL = process.env.ITEMS_SERVICE_URL; // e.g. http://localhost:5000/api/items

// strict:false because we don't own this schema - we just want to read
// whatever fields Person 1 has defined, without duplicating their model here.
const genericItemSchema = new mongoose.Schema({}, { strict: false });

function getItemModel() {
  // Reuse the model if already registered (avoids OverwriteModelError on hot reload)
  return (
    mongoose.models.__ExternalItem ||
    mongoose.model('__ExternalItem', genericItemSchema, ITEMS_COLLECTION_NAME)
  );
}

async function fetchItemsForUser(userId, authToken) {
  if (ITEMS_SOURCE === 'http') {
    if (!ITEMS_SERVICE_URL) {
      throw new Error('ITEMS_SERVICE_URL is not set but ITEMS_SOURCE=http');
    }
    const response = await axios.get(`${ITEMS_SERVICE_URL}/user/${userId}`, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      timeout: 10000,
    });
    // Adjust this if Person 1's API wraps the array differently
    // (e.g. { items: [...] } vs a bare array)
    return Array.isArray(response.data) ? response.data : response.data.items || [];
  }

  // db mode
  const ItemModel = getItemModel();
  const items = await ItemModel.find({ user_id: userId }).lean();
  return items;
}

module.exports = { fetchItemsForUser };
