/** @type {import('next').NextConfig} */
const nextConfig = {
    // Firebase関連パッケージをトランスパイル
    transpilePackages: ['firebase', '@firebase/storage'],

    webpack: (config, { isServer }) => {
        // クライアント側でundiciを完全に除外
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                undici: false,
            };
        }

        // undiciモジュール全体を無視
        config.resolve.alias = {
            ...config.resolve.alias,
            undici: false,
        };

        return config;
    },
};

export default nextConfig;