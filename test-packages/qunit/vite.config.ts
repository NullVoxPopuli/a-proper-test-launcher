import { aProperTestLauncher } from 'a-proper-test-launcher/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    aProperTestLauncher({
      // browsers?
    }),
  ],
});
