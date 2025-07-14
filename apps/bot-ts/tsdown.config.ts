import { defineConfig } from "tsdown";

export default defineConfig({
  clean: true,
  bundle: false,
  dts: false,
  entry: ["src/**/*.ts", "!src/**/*.d.ts"],
  format: ["cjs"],
  minify: false,
  tsconfig: "tsconfig.json",
  target: "es2020",
  splitting: false,
  skipNodeModulesBundle: true,
  sourcemap: true,
  shims: false,
  keepNames: true,
});
