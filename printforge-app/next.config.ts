import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile Three.js packages for proper SSR/client boundary handling
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
};

export default nextConfig;
