export interface IOnRequestOptions {
  url: string;
  query: Record<string, unknown>;
  body: Record<string, unknown>;
  headers: Record<string, unknown>;
  method: string;
}
