import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, List as ListIcon, Plus, FileDown, FileText } from 'lucide-react';
import * as inventoryService from '../services/inventoryService.js';
import * as exportService from '../services/exportService.js';
import SearchBar from '../components/SearchBar.jsx';
import InventoryCard from '../components/InventoryCard.jsx';
import InventoryTable from '../components/InventoryTable.jsx';
import Loader from '../components/Loader.jsx';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [view, setView] = useState('grid'); // 'grid' | 'table'
  const [exporting, setExporting] = useState(null); // 'csv' | 'pdf' | null - tracks which button is busy

  useEffect(() => {
    loadItems();
  }, []);

  function loadItems() {
    setLoading(true);
    inventoryService
      .getAllItems()
      .then(setItems)
      .catch(() => setError('Could not load your inventory. Try refreshing.'))
      .finally(() => setLoading(false));
  }

  const categories = useMemo(() => {
    const unique = new Set(items.map((i) => i.category || 'Uncategorized'));
    return ['all', ...unique];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !search ||
        item.itemName.toLowerCase().includes(search.toLowerCase()) ||
        (item.serialNumber || '').toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'all' || (item.category || 'Uncategorized') === category;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, category]);

  async function handleDelete(item) {
    const confirmed = window.confirm(`Delete "${item.itemName}"? This can't be undone.`);
    if (!confirmed) return;

    try {
      await inventoryService.deleteItem(item._id);
      setItems((prev) => prev.filter((i) => i._id !== item._id));
    } catch {
      alert('Could not delete this item. Try again.');
    }
  }

  async function handleExport(type) {
    setExporting(type);
    try {
      if (type === 'csv') await exportService.exportInventoryCSV();
      else await exportService.exportInventoryPDF();
    } catch {
      alert('Could not generate the report. Try again.');
    } finally {
      setExporting(null);
    }
  }

  if (loading) return <Loader label="Loading inventory…" />;
  if (error) return <div className="text-sm text-status-danger">{error}</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-zinc-900">Inventory</h1>
          <p className="text-sm text-zinc-500 mt-1">{filteredItems.length} of {items.length} items</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('csv')}
            disabled={exporting === 'csv'}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface hover:bg-zinc-50 transition-colors text-sm font-medium px-4 py-2 text-zinc-700 disabled:opacity-60"
          >
            <FileDown size={16} />
            {exporting === 'csv' ? 'Exporting…' : 'Export CSV'}
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting === 'pdf'}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface hover:bg-zinc-50 transition-colors text-sm font-medium px-4 py-2 text-zinc-700 disabled:opacity-60"
          >
            <FileText size={16} />
            {exporting === 'pdf' ? 'Exporting…' : 'Export PDF'}
          </button>
          <Link
            to="/inventory/add"
            className="flex items-center gap-2 rounded-lg bg-accent hover:bg-accent-hover transition-colors text-white text-sm font-medium px-4 py-2"
          >
            <Plus size={16} />
            Add item
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or serial number…" />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-zinc-700 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === 'all' ? 'All categories' : c}
            </option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-1 border border-border rounded-lg p-1 bg-surface">
          <button
            onClick={() => setView('grid')}
            className={`p-1.5 rounded ${view === 'grid' ? 'bg-accent-light text-accent' : 'text-zinc-400 hover:text-zinc-600'}`}
            title="Grid view"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setView('table')}
            className={`p-1.5 rounded ${view === 'table' ? 'bg-accent-light text-accent' : 'text-zinc-400 hover:text-zinc-600'}`}
            title="Table view"
          >
            <ListIcon size={16} />
          </button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="bg-surface border border-dashed border-border rounded-card p-10 text-center">
          <p className="text-sm text-zinc-500">No items match your filters.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <InventoryCard key={item._id} item={item} />
          ))}
        </div>
      ) : (
        <InventoryTable items={filteredItems} onDelete={handleDelete} />
      )}
    </div>
  );
}