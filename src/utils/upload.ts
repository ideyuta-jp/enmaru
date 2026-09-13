// Pure helpers for interpreting upload-related errors. No I/O, no React.

// Next.js's own Server Action body-size guard (next.config.ts's
// serverActions.bodySizeLimit) rejects an over-limit request with a 413 whose
// body text starts with this exact phrase (see
// node_modules/next/dist/server/app-render/action-handler.js) — the client
// runtime re-throws that text as an Error. Matching on it lets a request
// that slips past the client-side MAX_DOCUMENT_BYTES check (or overshoots via
// multipart overhead right at the edge) still get a size-specific message
// instead of a generic "something went wrong" one (#231).
const BODY_SIZE_LIMIT_ERROR_PREFIX = 'Body exceeded';

export function isBodySizeLimitError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.startsWith(BODY_SIZE_LIMIT_ERROR_PREFIX)
  );
}
