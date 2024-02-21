import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { DataTable, MoneyField, StatusChip, ConfirmDialog, EmptyState, Status } from '../index';

const meta: Meta = { title: 'Atlas' };
export default meta;

type Inv = { id: string; number: string; customer: string; amount: number; status: Status };
const data: Inv[] = Array.from({ length: 40 }, (_, i) => ({
  id: String(i), number: `INV-${1000 + i}`, customer: ['Acme', 'Globex', 'Initech', 'Umbrella'][i % 4],
  amount: 1000 + ((i * 7919) % 90000), status: (['paid', 'pending', 'overdue', 'draft', 'failed'] as Status[])[i % 5],
}));

export const InvoiceTable: StoryObj = {
  render: () => {
    const [sel, setSel] = useState<Set<string>>(new Set());
    return (
      <DataTable rows={data} rowKey={(r) => r.id} selectable selected={sel} onSelectionChange={setSel} pageSize={10}
        initialSort={{ key: 'number', dir: 'asc' }} caption={`${sel.size} selected`}
        columns={[
          { key: 'number', header: 'Invoice' },
          { key: 'customer', header: 'Customer' },
          { key: 'amount', header: 'Amount', align: 'right', render: (r) => `$${(r.amount / 100).toFixed(2)}` },
          { key: 'status', header: 'Status', render: (r) => <StatusChip status={r.status} /> },
        ]} />
    );
  },
};

export const Loading: StoryObj = { render: () => <DataTable rows={[]} loading columns={[{ key: 'a', header: 'A' }]} rowKey={() => ''} /> };

export const Empty: StoryObj = { render: () => <EmptyState title="No invoices yet" description="Invoices you send will appear here." action={<Button variant="contained">Create invoice</Button>} /> };

export const Statuses: StoryObj = {
  render: () => <Stack direction="row" spacing={1}>{(['draft', 'pending', 'active', 'paid', 'overdue', 'failed', 'cancelled'] as Status[]).map((s) => <StatusChip key={s} status={s} />)}</Stack>,
};

export const Money: StoryObj = {
  render: () => {
    const [v, setV] = useState<number | null>(12345);
    return <Stack spacing={2} sx={{ width: 280 }}><MoneyField label="Refund amount" value={v} onChange={setV} max={50000} /><code>{String(v)} cents</code></Stack>;
  },
};

export const DestructiveConfirm: StoryObj = {
  render: () => {
    const [open, setOpen] = useState(true);
    return <>
      <Button color="error" onClick={() => setOpen(true)}>Delete store</Button>
      <ConfirmDialog open={open} title="Delete store S042?" body="All orders, staff and settings for this store will be permanently removed."
        destructive typeToConfirm="S042" confirmLabel="Delete" onConfirm={() => new Promise((r) => setTimeout(r, 800))} onClose={() => setOpen(false)} />
    </>;
  },
};
