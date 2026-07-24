import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // Document uploads go through a Server Action; raise the default 1 MB body
    // limit. A little above the 10 MB content cap (server/document-actions.ts
    // + the client check) to allow for multipart overhead near the limit.
    serverActions: {
      bodySizeLimit: '12mb',
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
