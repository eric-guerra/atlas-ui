import Chip from '@mui/material/Chip';

export type Status = 'draft' | 'pending' | 'active' | 'paid' | 'overdue' | 'failed' | 'cancelled';

const MAP: Record<Status, { label: string; color: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' }> = {
  draft: { label: 'Draft', color: 'default' },
  pending: { label: 'Pending', color: 'info' },
  active: { label: 'Active', color: 'primary' },
  paid: { label: 'Paid', color: 'success' },
  overdue: { label: 'Overdue', color: 'warning' },
  failed: { label: 'Failed', color: 'error' },
  cancelled: { label: 'Cancelled', color: 'default' },
};

/** One status vocabulary across every app, so "overdue" is always the same color and word. */
export function StatusChip({ status, size = 'small' }: { status: Status; size?: 'small' | 'medium' }) {
  const m = MAP[status];
  return <Chip label={m.label} color={m.color} size={size} variant={status === 'cancelled' ? 'outlined' : 'filled'} aria-label={`Status: ${m.label}`} />;
}
