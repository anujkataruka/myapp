import { decode as base64Decode } from 'base-64';

export function decodeJwt(token: string): any {
  const [, payload] = token.split('.');
  if (!payload) return {};
  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
  try {
    const json = base64Decode(normalized);
    return JSON.parse(json);
  } catch {
    return {};
  }
}

