// @ts-check
import { defineConfig } from 'a-proper-test-launcher';
import { createServer } from 'vite';

export default defineConfig({
  launch: async () => {
    let server = await createServer({ server: { hmr: false } });

    return {
      protocol: server.config.server.https ? 'https' : 'http',
      host: 'localhost',
      port: server.config.server.port,
    };
  },
  browsers: [
    ('chrome': { args: ['--headless=new'] }),
    (firefox: { args: ['-headless'] }),
    (edge: { args: [] }),
  ],
});
