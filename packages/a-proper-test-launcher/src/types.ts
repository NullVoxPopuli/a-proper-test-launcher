


type Config = {
  launch: () => Promise<{
    host: string;
    port: string;
  }>;
  launchTimeout: number;
} | { 
  path: string;
}
