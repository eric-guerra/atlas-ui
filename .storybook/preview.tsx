import type { Preview } from '@storybook/react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createAtlasTheme } from '../src/theme';

// Toolbar toggles for theme and density, so every story is reviewed in all four combinations.
const preview: Preview = {
  globalTypes: {
    mode: { defaultValue: 'light', toolbar: { items: ['light', 'dark'], title: 'Mode' } },
    density: { defaultValue: 'comfortable', toolbar: { items: ['comfortable', 'compact'], title: 'Density' } },
  },
  decorators: [
    (Story, ctx) => (
      <ThemeProvider theme={createAtlasTheme(ctx.globals.mode, ctx.globals.density)}>
        <CssBaseline />
        <Story />
      </ThemeProvider>
    ),
  ],
};
export default preview;
