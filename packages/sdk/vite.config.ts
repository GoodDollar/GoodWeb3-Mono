// vite.config.ts
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

import pkg from "./package.json";
// https://vitejs.dev/guide/build.html#library-mode

export default defineConfig({
  plugins: [tsconfigPaths()],
  build: {
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        ...Object.keys(pkg.dependencies), // don't bundle dependencies
        /^node:.*/ // don't bundle built-in Node.js modules (use protocol imports!)
      ]
    },
    lib: {
      entry: "./src/index.ts",
      name: "sdk",
      fileName: "sdk",
      formats: ["cjs", "es"]
    }
  }
});
