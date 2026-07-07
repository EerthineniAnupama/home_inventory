import { Link } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { getWarrantyStatus, toneClasses } from '../utils/warranty.js';

export default function InventoryTable({ items, onDelete }) {
  return (
    <div className="bg-surface border border-border rounded-card shadow-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-zinc-400">
            <th className="px-4 py-3 font-medium">Item</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Purchased</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">Warranty</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((item) => {
            const status = getWarrantyStatus(item.warrantyExpiry);
            return (
              <tr key={item._id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-4 py-3">
                  <Link to={`/inventory/${item._id}`} className="font-medium text-zinc-900 hover:text-accent">
                    {item.itemName}
                  </Link>
                  {item.serialNumber && (
                    <div className="font-mono text-[11px] text-zinc-400 mt-0.5">{item.serialNumber}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-500">{item.category || 'Uncategorized'}</td>
                <td className="px-4 py-3 text-zinc-500">
                  {item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3 font-mono text-zinc-900">
                  {typeof item.purchasePrice === 'number' ? `$${item.purchasePrice.toFixed(2)}` : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${toneClasses(status.tone)}`}>
                    {status.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      to={`/inventory/${item._id}/edit`}
                      className="p-1.5 rounded hover:bg-zinc-100 text-zinc-500 hover:text-accent"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </Link>
                    <button
                      onClick={() => onDelete(item)}
                      className="p-1.5 rounded hover:bg-red-50 text-zinc-500 hover:text-status-danger"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}