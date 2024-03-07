import { ReactNode, useMemo, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import TablePagination from '@mui/material/TablePagination';
import Checkbox from '@mui/material/Checkbox';
import Skeleton from '@mui/material/Skeleton';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  /** Value used for sorting; defaults to row[key]. */
  sortValue?: (row: T) => string | number | null;
  align?: 'left' | 'right';
  sortable?: boolean;
}

export interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  loading?: boolean;
  selectable?: boolean;
  selected?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  pageSize?: number;
  initialSort?: { key: string; dir: 'asc' | 'desc' };
  emptyTitle?: string;
  emptyAction?: ReactNode;
  caption?: string;
}

export function sortRows<T>(rows: T[], col: Column<T> | undefined, dir: 'asc' | 'desc'): T[] {
  if (!col) return rows;
  const get = col.sortValue ?? ((r: T) => (r as any)[col.key]);
  const factor = dir === 'asc' ? 1 : -1;
  // Stable; nulls always last regardless of direction.
  return rows.map((r, i) => ({ r, i })).sort((a, b) => {
    const va = get(a.r), vb = get(b.r);
    if (va == null && vb == null) return a.i - b.i;
    if (va == null) return 1;
    if (vb == null) return -1;
    const c = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb), undefined, { numeric: true });
    return c * factor || a.i - b.i;
  }).map((x) => x.r);
}

/** Client-side table: sort, paginate, select (page-aware "select all"), loading skeleton and empty state. */
export function DataTable<T>({
  rows, columns, rowKey, loading, selectable, selected = new Set(), onSelectionChange, pageSize = 25,
  initialSort, emptyTitle = 'Nothing here yet', emptyAction, caption,
}: DataTableProps<T>) {
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(0);
  const sorted = useMemo(() => sortRows(rows, columns.find((c) => c.key === sort?.key), sort?.dir ?? 'asc'), [rows, columns, sort]);
  const pageRows = sorted.slice(page * pageSize, page * pageSize + pageSize);
  const pageIds = pageRows.map(rowKey);
  const allOnPage = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const someOnPage = pageIds.some((id) => selected.has(id));

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    onSelectionChange?.(next);
  };
  const togglePage = () => {
    const next = new Set(selected);
    pageIds.forEach((id) => (allOnPage ? next.delete(id) : next.add(id)));
    onSelectionChange?.(next);
  };

  if (!loading && rows.length === 0) return <EmptyState title={emptyTitle} action={emptyAction} />;

  return (
    <>
      <Table aria-busy={loading || undefined}>
        {caption && <caption style={{ captionSide: 'top', textAlign: 'left' }}>{caption}</caption>}
        <TableHead>
          <TableRow>
            {selectable && (
              <TableCell padding="checkbox">
                <Checkbox checked={allOnPage} indeterminate={someOnPage && !allOnPage} onChange={togglePage} inputProps={{ 'aria-label': 'Select all on page' }} />
              </TableCell>
            )}
            {columns.map((c) => (
              <TableCell key={c.key} align={c.align} sortDirection={sort?.key === c.key ? sort.dir : false}>
                {c.sortable === false ? c.header : (
                  <TableSortLabel active={sort?.key === c.key} direction={sort?.key === c.key ? sort.dir : 'asc'}
                    onClick={() => { setSort({ key: c.key, dir: sort?.key === c.key && sort.dir === 'asc' ? 'desc' : 'asc' }); setPage(0); }}>
                    {c.header}
                  </TableSortLabel>
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading
            ? Array.from({ length: 5 }, (_, i) => (
                <TableRow key={i}>{(selectable ? [null, ...columns] : columns).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
              ))
            : pageRows.map((r) => {
                const id = rowKey(r);
                return (
                  <TableRow key={id} hover selected={selected.has(id)}>
                    {selectable && (
                      <TableCell padding="checkbox"><Checkbox checked={selected.has(id)} onChange={() => toggle(id)} inputProps={{ 'aria-label': `Select row ${id}` }} /></TableCell>
                    )}
                    {columns.map((c) => <TableCell key={c.key} align={c.align}>{c.render ? c.render(r) : String((r as any)[c.key] ?? '')}</TableCell>)}
                  </TableRow>
                );
              })}
        </TableBody>
      </Table>
      {rows.length > pageSize && (
        <TablePagination component="div" count={rows.length} page={page} rowsPerPage={pageSize} rowsPerPageOptions={[pageSize]}
          onPageChange={(_, p) => setPage(p)} />
      )}
    </>
  );
}
