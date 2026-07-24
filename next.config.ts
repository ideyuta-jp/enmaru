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
  outputFileTracingIncludes: {
    '/resume': ['./src/assets/fonts/**'],
  },
};

export default nextConfig;
