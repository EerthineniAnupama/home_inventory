const inventoryService = require('../services/inventoryService');
const authService = require('../services/authService');
const exportService = require('../services/exportService');

// GET /api/export/csv
async function exportCSV(req, res, next) {
  try {
    // req.userId scopes this to the logged-in user only - same guarantee
    // as every other inventory read in this app.
    const items = await inventoryService.getUserItems(req.userId);
    const csv = exportService.generateCSV(items);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="inventory-report.csv"');
    return res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
}

// GET /api/export/pdf
async function exportPDF(req, res, next) {
  try {
    const [items, user] = await Promise.all([
      inventoryService.getUserItems(req.userId),
      authService.getUserById(req.userId),
    ]);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="inventory-report.pdf"');

    // exportService streams the PDF directly into res and calls res.end() itself
    exportService.generatePDF(items, user, res);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  exportCSV,
  exportPDF,
};