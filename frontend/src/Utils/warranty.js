// Single source of truth for "what does this warranty date mean right now".
// Keeping this in one place means Dashboard and Inventory always agree
// on what counts as "expiring soon".
export function getWarrantyStatus(warrantyExpiry) {
  if (!warrantyExpiry) {
    return { label: 'No warranty', tone: 'neutral' };
  }

  const daysLeft = Math.ceil(
    (new Date(warrantyExpiry) - new Date()) / (1000 * 60 * 60 * 24)
  );

  if (daysLeft < 0) return { label: 'Expired', tone: 'danger' };
  if (daysLeft <= 30) return { label: `Expires in ${daysLeft}d`, tone: 'warning' };
  return { label: 'Active', tone: 'active' };
}

// Tailwind class lookup so components don't repeat this switch statement.
export function toneClasses(tone) {
  switch (tone) {
    case 'danger':
      return 'bg-red-50 text-status-danger border-red-200';
    case 'warning':
      return 'bg-amber-50 text-status-warning border-amber-200';
    case 'active':
      return 'bg-green-50 text-status-active border-green-200';
    default:
      return 'bg-zinc-100 text-zinc-500 border-zinc-200';
  }
}