import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, ImageOff } from 'lucide-react';
import * as inventoryService from '../services/inventoryService.js';
import { getWarrantyStatus, toneClasses } from '../utils/warranty.js';
import Loader from '../components/Loader.jsx';

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    inventoryService
      .getItemById(id)
      .then(setItem)
      .catch(() => setError('Could not load this item.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    const confirmed = window.confirm(`Delete "${item.itemName}"? This can't be undone.`);
    if (!confirmed) return;

    try {
      await inventoryService.deleteItem(id);
      navigate('/inventory');
    } catch {
      alert('Could not delete this item. Try again.');
    }
  }

  if (loading) return <Loader label="Loading item…" />;
  if (error) return <div className="text-sm text-status-danger">{error}</div>;

  const status = getWarrantyStatus(item.warrantyExpiry);

  return (
    <div className="max-w-3xl">
      <Link to="/inventory" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 mb-4">
        <ArrowLeft size={15} />
        Back to inventory
      </Link>

      <div className="bg-surface border border-border rounded-card shadow-card overflow-hidden">
        <div className="h-64 bg-zinc-100 flex items-center justify-center">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.itemName} className="h-full w-full object-cover" />
          ) : (
            <ImageOff size={32} className="text-zinc-300" />
          )}
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-display font-bold text-zinc-900">{item.itemName}</h1>
              <p className="text-sm text-zinc-500 mt-1">{item.category || 'Uncategorized'}</p>
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${toneClasses(status.tone)}`}>
              {status.label}
            </span>
          </div>

          {item.description && <p className="text-sm text-zinc-600">{item.description}</p>}

          <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-border">
            <DetailRow label="Purchase date" value={item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : '—'} />
            <DetailRow
              label="Purchase price"
              value={typeof item.purchasePrice === 'number' ? `$${item.purchasePrice.toFixed(2)}` : '—'}
              mono
            />
            <DetailRow label="Warranty expiry" value={item.warrantyExpiry ? new Date(item.warrantyExpiry).toLocaleDateString() : '—'} />
            <DetailRow label="Serial number" value={item.serialNumber || '—'} mono />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Link
              to={`/inventory/${id}/edit`}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface hover:bg-zinc-50 transition-colors text-sm font-medium px-4 py-2 text-zinc-700"
            >
              <Pencil size={15} />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 rounded-lg border border-red-200 text-status-danger hover:bg-red-50 transition-colors text-sm font-medium px-4 py-2"
            >
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-zinc-400">{label}</p>
      <p className={`mt-1 text-sm text-zinc-900 ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}