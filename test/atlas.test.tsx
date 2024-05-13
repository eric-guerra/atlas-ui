// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { createAtlasTheme, tokens, contrastRatio, DataTable, MoneyField, StatusChip, ConfirmDialog, sortRows, parseToCents, Column } from '../src';

afterEach(cleanup);
const wrap = (ui: React.ReactElement) => render(<ThemeProvider theme={createAtlasTheme()}>{ui}</ThemeProvider>);

describe('tokens', () => {
  it('semantic colors meet WCAG AA against white', () => {
    for (const [name, c] of Object.entries({ brand: tokens.color.brand[500], success: tokens.color.success, warning: tokens.color.warning, danger: tokens.color.danger, info: tokens.color.info, secondaryText: tokens.color.neutral[500] })) {
      expect(contrastRatio(c, '#ffffff'), name).toBeGreaterThanOrEqual(4.5);
    }
  });
  it('theme density changes component defaults', () => {
    expect(createAtlasTheme('light', 'compact').components?.MuiButton?.defaultProps?.size).toBe('small');
    expect(createAtlasTheme('dark').palette.mode).toBe('dark');
  });
});

type Row = { id: string; name: string; amount: number | null };
const rows: Row[] = [
  { id: 'a', name: 'Invoice 10', amount: 500 },
  { id: 'b', name: 'Invoice 9', amount: null },
  { id: 'c', name: 'Invoice 2', amount: 1500 },
];
const columns: Column<Row>[] = [{ key: 'name', header: 'Name' }, { key: 'amount', header: 'Amount', align: 'right' }];

describe('DataTable', () => {
  it('sortRows: numeric-aware strings, nulls last both directions, stable', () => {
    expect(sortRows(rows, columns[0], 'asc').map((r) => r.id)).toEqual(['c', 'b', 'a']);
    expect(sortRows(rows, columns[1], 'asc').map((r) => r.id)).toEqual(['a', 'c', 'b']);
    expect(sortRows(rows, columns[1], 'desc').map((r) => r.id)).toEqual(['c', 'a', 'b']);
  });

  it('sorts on header click and toggles direction', () => {
    wrap(<DataTable rows={rows} columns={columns} rowKey={(r) => r.id} />);
    const firstCell = () => screen.getAllByRole('row')[1].querySelector('td')!.textContent;
    fireEvent.click(screen.getByText('Name'));
    expect(firstCell()).toBe('Invoice 2');
    fireEvent.click(screen.getByText('Name'));
    expect(firstCell()).toBe('Invoice 10');
  });

  it('page-aware select all with indeterminate state', () => {
    function Harness() {
      const [sel, setSel] = useState<Set<string>>(new Set());
      return <><DataTable rows={rows} columns={columns} rowKey={(r) => r.id} selectable selected={sel} onSelectionChange={setSel} pageSize={2} /><output>{[...sel].sort().join(',')}</output></>;
    }
    wrap(<Harness />);
    fireEvent.click(screen.getByLabelText('Select row a'));
    const all = screen.getByLabelText('Select all on page') as HTMLInputElement;
    expect(all.getAttribute('data-indeterminate')).toBe('true');
    fireEvent.click(all);
    expect(screen.getByRole('status', { hidden: true }).textContent ?? screen.getByText(/a,b/).textContent).toBeTruthy();
    expect(document.querySelector('output')!.textContent).toBe('a,b');
  });

  it('shows empty state and loading skeleton', () => {
    wrap(<DataTable rows={[]} columns={columns} rowKey={(r: Row) => r.id} emptyTitle="No invoices" />);
    expect(screen.getByText('No invoices')).toBeTruthy();
    cleanup();
    wrap(<DataTable rows={[]} columns={columns} rowKey={(r: Row) => r.id} loading />);
    expect(screen.getByRole('table').getAttribute('aria-busy')).toBe('true');
  });
});

describe('MoneyField', () => {
  it('parses to cents and validates', () => {
    expect(parseToCents('1,234.5')).toBe(123450);
    expect(parseToCents('')).toBeNull();
    expect(parseToCents('12.345')).toBeNaN();
  });

  it('emits cents, shows errors, formats on blur', () => {
    const onChange = vi.fn();
    wrap(<MoneyField label="Amount" value={null} onChange={onChange} max={100000} />);
    const input = screen.getByLabelText('Amount') as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '1234.5' } });
    expect(onChange).toHaveBeenLastCalledWith(123450);
    expect(screen.getByText('Maximum is 1,000.00')).toBeTruthy();
    fireEvent.change(input, { target: { value: '12.5' } });
    fireEvent.blur(input);
    expect(input.value).toBe('12.50');
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(screen.getByText(/Enter an amount/)).toBeTruthy();
  });
});

describe('StatusChip and ConfirmDialog', () => {
  it('labels status accessibly', () => {
    wrap(<StatusChip status="overdue" />);
    expect(screen.getByLabelText('Status: Overdue')).toBeTruthy();
  });

  it('type-to-confirm gates destructive actions', async () => {
    const onConfirm = vi.fn();
    wrap(<ConfirmDialog open title="Delete store" body="This removes all data." destructive typeToConfirm="S042" onConfirm={onConfirm} onClose={() => {}} />);
    const dialog = screen.getByRole('dialog');
    const btn = within(dialog).getByRole('button', { name: 'Confirm' }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    fireEvent.change(within(dialog).getByLabelText('Type "S042" to confirm'), { target: { value: 'S042' } });
    expect(btn.disabled).toBe(false);
    fireEvent.click(btn);
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
