import { Link } from 'react-router-dom';
import { ImageOff } from 'lucide-react';
import { getWarrantyStatus, toneClasses } from '../utils/warranty.js';

export default function InventoryCard({ item }) {
  const status = getWarrantyStatus(item.warrantyExpiry);

  return (
    <Link
      to={`/inventory/${item._id}`}
      className="group bg-surface border border-border rounded-card shadow-card hover:shadow-card-hover transition-shadow overflow-hidden flex flex-col"
    >
      <div className="h-36 bg-zinc-100 flex items-center justify-center overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.itemName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <ImageOff size={24} className="text-zinc-300" />
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium text-zinc-900 line-clamp-1">{item.itemName}</h3>
          <span
            className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full border ${toneClasses(status.tone)}`}
          >
            {status.label}
          </span>
        </div>

        <p className="text-xs text-zinc-500">{item.category || 'Uncategorized'}</p>

        <div className="mt-auto flex items-center justify-between pt-2">
          {item.serialNumber && (
            <span className="font-mono text-[11px] text-zinc-400">{item.serialNumber}</span>
          )}
          {typeof item.purchasePrice === 'number' && (
            <span className="text-sm font-mono font-semibold text-zinc-900">
              ${item.purchasePrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}