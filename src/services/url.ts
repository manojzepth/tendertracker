export class URLBuilder {
  private baseUrl: URL;

  constructor(baseUrl: string) {
    this.baseUrl = new URL(baseUrl);
  }

  path(path: string): this {
    this.baseUrl.pathname = path;
    return this;
  }

  query(params: Record<string, string>): this {
    Object.entries(params).forEach(([key, value]) => {
      this.baseUrl.searchParams.append(key, value);
    });
    return this;
  }

  toString(): string {
    return this.baseUrl.toString();
  }
}

export function createApiUrl(path: string, params?: Record<string, string>): string {
  const builder = new URLBuilder(import.meta.env.VITE_SUPABASE_URL);
  builder.path(`/rest/v1/${path}`);
  if (params) {
    builder.query(params);
  }
  return builder.toString();
}

export function createStorageUrl(path: string): string {
  const builder = new URLBuilder(import.meta.env.VITE_SUPABASE_URL);
  builder.path(`/storage/v1/object/public/${path}`);
  return builder.toString();
}