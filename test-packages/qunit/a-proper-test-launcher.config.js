// @ts-check
import { defineConfig } from 'a-proper-test-launcher';

export default defineConfig({
  devServer: 'vite',
  devBrowser: 'firefox',
  browsers: {
    chrome: { args: ['--headless=new'] },
    firefox: { args: ['-headless'] },
    edge: { args: [] },
  },
});
