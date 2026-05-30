import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@prisma/adapter-mariadb', 'mariadb'],
};

export default nextConfig;
