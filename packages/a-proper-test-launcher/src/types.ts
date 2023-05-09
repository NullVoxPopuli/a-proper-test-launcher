type Config = (
  | {
      launch: () => Promise<{
        host: string;
        port: string;
      }>;
      launchTimeout: number;
    }
  | {
      path: string;
    }
) & {
  browsers: Record<
    'chrome' | 'firefox' | 'edge' | string,
    {
      args: string[];
    }
  >;
};
