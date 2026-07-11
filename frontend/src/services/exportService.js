import api from './api';

async function downloadFile(endpoint, filename) {
  const response = await api.get(endpoint, { responseType: 'blob' });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export function exportInventoryCSV() {
  return downloadFile('/export/csv', 'inventory-report.csv');
}

export function exportInventoryPDF() {
  return downloadFile('/export/pdf', 'inventory-report.pdf');
}