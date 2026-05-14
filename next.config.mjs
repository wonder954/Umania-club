/** @type {import('next').NextConfig} */
const nextConfig = {
  // Firebase関連パッケージをトランスパイル
  transpilePackages: ['firebase', '@firebase/storage'],

  // Turbopack を明示的に有効化（Next.js 16 で必須）
  turbopack: {},
};

export default nextConfig;
