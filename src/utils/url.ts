// Scheme allowlist for user-entered link URLs. Anything that ends up in an
// href must pass this check — it is what keeps javascript: (and other
// non-web schemes) out of pages that render user input (stored XSS vector).
export function isHttpUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  return url.protocol === 'http:' || url.protocol === 'https:';
}
