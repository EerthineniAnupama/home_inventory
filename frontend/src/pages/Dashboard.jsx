import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, DollarSign, AlertTriangle, Layers } from 'lucide-react';
import * as inventoryService from '../services/inventoryService.js';
import { getWarrantyStatus, toneClasses } from '../utils/warranty.js';
import Loader from '../components/Loader.jsx';

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    inventoryService
      .getAllItems()
      .then(setItems)
      .catch(() => setError('Could not load your inventory. Try refreshing.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading your dashboard…" />;

  if (error) {
    return <div className="text-sm text-status-danger">{error}</div>;
  }

  // Backend has no dedicated "stats" endpoint - it only exposes CRUD,
  // so we derive everything from the item list we already fetched.
  const totalItems = items.length;
  const totalValue = items.reduce((sum, item) => sum + (item.purchasePrice || 0), 0);
  const categoryCount = new Set(items.map((i) => i.category || 'Uncategorized')).size;
  const expiringSoon = items.filter((i) => getWarrantyStatus(i.warrantyExpiry).tone === 'warning').length;

  const recentItems = items.slice(0, 5); // backend already sorts by createdAt desc

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-display font-bold text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">Here's what's in your inventory right now.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Total items" value={totalItems} />
        <StatCard icon={DollarSign} label="Total value" value={`$${totalValue.toFixed(2)}`} />
        <StatCard icon={Layers} label="Categories" value={categoryCount} />
        <StatCard
          icon={AlertTriangle}
          label="Warranty expiring"
          value={expiringSoon}
          accent={expiringSoon > 0}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-zinc-900">Recent items</h2>
          <Link to="/inventory" className="text-sm text-accent hover:underline">
            View all
          </Link>
        </div>

        {recentItems.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="bg-surface border border-border rounded-card shadow-card divide-y divide-border">
            {recentItems.map((item) => {
              const status = getWarrantyStatus(item.warrantyExpiry);
              return (
                <Link
                  key={item._id}
                  to={`/inventory/${item._id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{item.itemName}</p>
                    <p className="text-xs text-zinc-500">{item.category || 'Uncategorized'}</p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full border ${toneClasses(status.tone)}`}
                  >
                    {status.label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="bg-surface border border-border rounded-card shadow-card p-4">
      <div className="flex items-center gap-2 text-zinc-400">
        <Icon size={16} />
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <p
        className={`mt-2 text-2xl font-mono font-semibold ${
          accent ? 'text-status-warning' : 'text-zinc-900'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-surface border border-dashed border-border rounded-card p-8 text-center">
      <p className="text-sm text-zinc-500">No items yet.</p>
      <Link to="/inventory/add" className="mt-2 inline-block text-sm text-accent hover:underline">
        Add your first item
      </Link>
    </div>
  );
}