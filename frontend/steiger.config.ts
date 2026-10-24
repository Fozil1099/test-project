import { defineConfig } from 'steiger';
import fsd from '@feature-sliced/steiger-plugin';

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // The app is small: a few slices are used by a single page on purpose.
    rules: { 'fsd/insignificant-slice': 'off' },
  },
]);
