const PDFDocument = require('pdfkit');

const REPORT_HEADERS = [
  'Item Name',
  'Category',
  'Quantity',
  'Purchase Date',
  'Warranty Expiry',
  'Price',
  'Notes',
];

// Turns one inventory item into a plain array of display-ready cell values.
// Shared by both CSV and PDF so the two formats never drift out of sync.
function itemToRow(item) {
  return [
    item.itemName || '-',
    item.category || '-',
    String(item.quantity ?? 1),
    item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : '-',
    item.warrantyExpiry ? new Date(item.warrantyExpiry).toLocaleDateString() : '-',
    typeof item.purchasePrice === 'number' ? `$${item.purchasePrice.toFixed(2)}` : '-',
    item.description || '-',
  ];
}

// --- CSV ---------------------------------------------------------------

function escapeCsvCell(value) {
  const str = String(value ?? '');
  // Quote the cell if it contains a comma, quote, or newline - standard CSV escaping
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function generateCSV(items) {
  const lines = [REPORT_HEADERS.join(',')];

  items.forEach((item) => {
    const row = itemToRow(item).map(escapeCsvCell);
    lines.push(row.join(','));
  });

  return lines.join('\n');
}

// --- PDF -----------------------------------------------------------------

const COLUMN_WIDTHS = [105, 65, 45, 65, 65, 55, 105]; // sums to ~505pt, fits A4 with margins
const ROW_HEIGHT = 20;

function drawTableRow(doc, cells, y, isHeader) {
  const left = doc.page.margins.left;
  const totalWidth = COLUMN_WIDTHS.reduce((sum, w) => sum + w, 0);

  if (isHeader) {
    doc.rect(left, y - 4, totalWidth, ROW_HEIGHT).fill('#2563EB');
  }

  doc.fontSize(isHeader ? 9 : 8).fillColor(isHeader ? '#FFFFFF' : '#18181B');

  let x = left;
  cells.forEach((cell, i) => {
    doc.text(String(cell), x + 4, y, { width: COLUMN_WIDTHS[i] - 8, ellipsis: true });
    x += COLUMN_WIDTHS[i];
  });

  doc.fillColor('#18181B'); // reset for whatever gets drawn next
}

// Streams the PDF directly into the response - caller must have already
// set Content-Type/Content-Disposition headers before calling this.
function generatePDF(items, user, res) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  doc.pipe(res);

  // Header
  doc.fontSize(20).fillColor('#18181B').text('Home Inventory Report', { align: 'center' });
  doc.moveDown(0.3);
  doc
    .fontSize(10)
    .fillColor('#71717A')
    .text(`Prepared for: ${user.name} (${user.email})`, { align: 'center' })
    .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
  doc.moveDown(1);

  // Summary line - useful for insurance/moving purposes at a glance
  const totalValue = items.reduce(
    (sum, item) => sum + (item.purchasePrice || 0) * (item.quantity || 1),
    0
  );
  doc
    .fontSize(11)
    .fillColor('#18181B')
    .text(`Total items: ${items.length}   |   Total estimated value: $${totalValue.toFixed(2)}`);
  doc.moveDown(1);

  // Table
  let y = doc.y;
  drawTableRow(doc, REPORT_HEADERS, y, true);
  y += ROW_HEIGHT;

  items.forEach((item) => {
    // Start a new page if we're near the bottom margin
    if (y > doc.page.height - doc.page.margins.bottom - ROW_HEIGHT) {
      doc.addPage();
      y = doc.page.margins.top;
      drawTableRow(doc, REPORT_HEADERS, y, true);
      y += ROW_HEIGHT;
    }

    drawTableRow(doc, itemToRow(item), y, false);
    y += ROW_HEIGHT;
  });

  // Footer note
  doc.moveDown(2);
  doc
    .fontSize(8)
    .fillColor('#A1A1AA')
    .text(
      'This report was generated for personal record-keeping, insurance claims, or relocation documentation purposes.',
      { align: 'center' }
    );

  doc.end();
}

module.exports = {
  generateCSV,
  generatePDF,
};