/**
 * Formats monetary amounts in Indian Rupee (₹) standard notation.
 * Example: 7500000000 -> "₹7,50,00,00,000" or "₹750.00 Cr"
 */
export function formatINR(val: number, compact: boolean = false): string {
  if (val === undefined || val === null || isNaN(val)) return '₹0';

  if (compact) {
    if (Math.abs(val) >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    } else if (Math.abs(val) >= 100000) {
      return `₹${(val / 100000).toFixed(2)} L`;
    } else if (Math.abs(val) >= 1000) {
      return `₹${(val / 1000).toFixed(1)} K`;
    }
  }

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  } catch (e) {
    return `₹${val.toLocaleString('en-IN')}`;
  }
}

export function getRiskColor(level: string): { bg: string; text: string; border: string; badge: string } {
  switch (level?.toLowerCase()) {
    case 'critical':
      return {
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      };
    case 'high':
      return {
        bg: 'bg-orange-500/10',
        text: 'text-orange-400',
        border: 'border-orange-500/30',
        badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      };
    case 'medium':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      };
    case 'low':
    default:
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      };
  }
}

export function getStatusBadge(status: string): string {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    case 'in progress':
      return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
    case 'on hold':
      return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    case 'planning':
    default:
      return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
  }
}
