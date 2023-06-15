declare namespace global {
  interface ImportMeta {
    env: {
      NODE_ENV: 'development' | 'production';
      CLI_REPORTETR: boolean;
    };
  }
}
