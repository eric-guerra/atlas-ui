import { useEffect, useRef, useState } from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

export interface MoneyFieldProps extends Omit<TextFieldProps, 'value' | 'onChange' | 'type'> {
  /** Value in minor units (cents). null = empty. */
  value: number | null;
  onChange: (cents: number | null) => void;
  currency?: string;
  locale?: string;
  min?: number;
  max?: number;
}

const symbolFor = (currency: string, locale: string) =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).formatToParts(0).find((p) => p.type === 'currency')?.value ?? currency;

export function parseToCents(raw: string): number | null {
  const s = raw.replace(/[\s,]/g, '');
  if (s === '') return null;
  const m = /^(\d+)(?:\.(\d{0,2}))?$/.exec(s);
  if (!m) return NaN;
  return Number(m[1]) * 100 + Number((m[2] ?? '').padEnd(2, '0'));
}

export const formatCents = (c: number, locale = 'en-US') =>
  new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(c / 100);

/**
 * Money input that keeps integer cents (no float drift), formats on blur, and validates range.
 * Free typing is allowed; the value is only committed when it parses.
 */
export function MoneyField({ value, onChange, currency = 'USD', locale = 'en-US', min, max, helperText, ...rest }: MoneyFieldProps) {
  const [text, setText] = useState(value == null ? '' : formatCents(value, locale));
  const focused = useRef(false);
  // Sync from the prop only when the *prop* changes (e.g. form reset), never because focus moved.
  useEffect(() => {
    if (!focused.current) setText(value == null ? '' : formatCents(value, locale));
  }, [value, locale]);

  const parsed = parseToCents(text);
  let error: string | null = null;
  if (Number.isNaN(parsed)) error = 'Enter an amount like 1,234.56';
  else if (parsed != null && min != null && parsed < min) error = `Minimum is ${formatCents(min, locale)}`;
  else if (parsed != null && max != null && parsed > max) error = `Maximum is ${formatCents(max, locale)}`;

  return (
    <TextField
      {...rest}
      value={text}
      inputMode="decimal"
      error={!!error}
      helperText={error ?? helperText}
      onFocus={() => { focused.current = true; }}
      onBlur={() => {
        focused.current = false;
        if (!error) setText(parsed == null ? '' : formatCents(parsed, locale));
      }}
      onChange={(e) => {
        setText(e.target.value);
        const c = parseToCents(e.target.value);
        if (!Number.isNaN(c)) onChange(c);
      }}
      InputProps={{ startAdornment: <InputAdornment position="start">{symbolFor(currency, locale)}</InputAdornment>, ...rest.InputProps }}
    />
  );
}
