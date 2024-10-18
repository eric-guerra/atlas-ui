# Atlas UI

Portfolio reference implementation of a 2023 project, built to show a shared React component library and design system for internal finance and operations apps. It's built on MUI, with a token-driven theme and documented in Storybook.

**Stack:** React 18, TypeScript 5, MUI 5 (emotion), Storybook 7 (Vite), Vitest + Testing Library, Vite library mode.

## What's in it
- **Tokens and theme** (`src/theme.ts`):
  - Brand, neutral and semantic colors, radius, a 4 px spacing scale and typography.
  - `createAtlasTheme(mode, density)` supports light/dark and comfortable/compact.
  - A visible focus ring on every interactive element.
- **Accessibility enforced by tests:** a WCAG contrast check runs on every semantic color. It caught the original warning amber at 4.24:1, which was darkened to pass AA.
- **Components:**
  - `DataTable` sorts client-side (numeric-aware, stable, nulls last in both directions) and paginates. It also has page-aware select-all with an indeterminate state, a loading skeleton (`aria-busy`) and an empty state.
  - `MoneyField` works in integer cents (no float drift), allows free typing, formats on blur, validates min/max and shows the locale's currency symbol.
    - It used to sync from props whenever focus changed, which wiped the user's input on blur. The fix is covered by a test.
  - `StatusChip` gives one status vocabulary and color mapping across all apps.
  - `ConfirmDialog` adds a busy state and **type-to-confirm** for irreversible actions.
  - `EmptyState`.
- **Distribution:** an ESM library build with React, MUI and emotion kept external (as peers), so apps share a single instance. `sideEffects: false` enables tree-shaking.

## Develop
```bash
npm install
npm test               # 10 tests: tokens/a11y, table sort/select/empty/loading, money parsing/validation/blur, dialog gating
npm run build          # tsc + vite lib build → dist/atlas-ui.js
npm run storybook      # stories with light/dark × density toolbar and the a11y addon
```
