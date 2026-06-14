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
};

export default nextConfig;
