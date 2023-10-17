import { createTheme, ThemeOptions } from '@mui/material/styles';

/** Design tokens: the single source for color, spacing and type. Components never hard-code values. */
export const tokens = {
  color: {
    brand: { 50: '#eef4ff', 100: '#d9e6ff', 500: '#1f5fbf', 600: '#1a51a3', 700: '#154284' },
    neutral: { 0: '#ffffff', 50: '#f6f7f9', 100: '#eceff3', 300: '#cfd4dc', 500: '#6b7280', 700: '#374151', 900: '#1d2330' },
    success: '#2e7d32',
    warning: '#945700', // much darker than MUI's default amber so warning text on white passes WCAG AA (4.5:1)
    danger: '#c62828',
    info: '#0277bd',
  },
  radius: { sm: 4, md: 8, lg: 12 },
  space: (n: number) => n * 4,
  font: { family: '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif', mono: '"JetBrains Mono", ui-monospace, monospace' },
} as const;

export type Density = 'comfortable' | 'compact';

export function createAtlasTheme(mode: 'light' | 'dark' = 'light', density: Density = 'comfortable') {
  const dark = mode === 'dark';
  const options: ThemeOptions = {
    palette: {
      mode,
      primary: { main: tokens.color.brand[500], dark: tokens.color.brand[700], light: tokens.color.brand[100], contrastText: '#fff' },
      success: { main: tokens.color.success },
      warning: { main: tokens.color.warning },
      error: { main: tokens.color.danger },
      info: { main: tokens.color.info },
      background: dark ? { default: '#11151c', paper: '#1a1f29' } : { default: tokens.color.neutral[50], paper: tokens.color.neutral[0] },
      text: dark ? { primary: '#e6e9ef', secondary: '#9aa3b2' } : { primary: tokens.color.neutral[900], secondary: tokens.color.neutral[500] },
      divider: dark ? '#2a3140' : tokens.color.neutral[100],
    },
    shape: { borderRadius: tokens.radius.md },
    spacing: tokens.space,
    typography: {
      fontFamily: tokens.font.family,
      h1: { fontSize: 28, fontWeight: 650 },
      h2: { fontSize: 22, fontWeight: 650 },
      h3: { fontSize: 18, fontWeight: 600 },
      body2: { fontSize: 13 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiButton: { defaultProps: { disableElevation: true, size: density === 'compact' ? 'small' : 'medium' } },
      MuiTextField: { defaultProps: { size: density === 'compact' ? 'small' : 'medium', fullWidth: true } },
      MuiTableCell: { styleOverrides: { root: { padding: density === 'compact' ? '6px 12px' : '12px 16px' } } },
      // Keyboard users need a visible focus ring everywhere.
      MuiButtonBase: { styleOverrides: { root: { '&.Mui-focusVisible': { outline: `2px solid ${tokens.color.brand[500]}`, outlineOffset: 2 } } } },
    },
  };
  return createTheme(options);
}
