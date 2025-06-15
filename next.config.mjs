/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint:{ ignoreDuringBuilds: true },
    typescript:{ ignoreBuildErrors: true },
    webpack: (config) => {
    config.module.rules.push({
      test: /\.cdc$/i,
      type: "asset/source", // This will load the .cdc file content as a string
    });
    return config;
  },
};

export default nextConfig;
