export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable "${name}". Set it in Netlify > Site configuration > Environment variables (and in your local .env for netlify dev).`,
    );
  }
  return value;
}
