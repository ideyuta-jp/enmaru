import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // Document uploads go through a Server Action; raise the default 1 MB
    // body limit. Set a little above the 4 MB content cap
    // (types/Document.ts's MAX_DOCUMENT_BYTES + the client check) for
    // multipart overhead, but — critically — kept BELOW Netlify Functions'
    // hard, non-configurable 6 MB payload ceiling (#231). Staying under that
    // ceiling means Next's own body-size guard is what actually rejects an
    // oversized request (a clean 413 the client can catch and explain),
    // instead of the request silently failing at Netlify's infra layer with
    // no usable error. Previously 12mb, which sat *above* Netlify's ceiling
    // and defeated this guard entirely — every oversized upload fell through
    // to the infra-level failure instead.
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  // server/resume-pdf.tsx reads the embedded résumé fonts via a runtime
  // path.join(process.cwd(), ...), not a static import/require — Next's
  // output file tracing only follows the latter, so the font files would be
  // silently missing from the deployed serverless bundle without this.
  // The global '/*' key (the documented pattern for runtime assets) is used
  // instead of '/resume' because the fonts are consumed by a Server Action,
  // and which route bundle a Server Action's trace belongs to is not worth
  // guessing; the value is scoped to the font dir, so traces stay small.
  outputFileTracingIncludes: {
    '/*': ['./src/assets/fonts/**'],
  },
};

export default nextConfig;
