import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  format: ["esm"],
  clean: true,
  outDir: "dist",
  platform: "node",
  target: "node22",
  shims: true,
  noExternal: [
    "@repo/database",
    "@repo/lib",
    "@repo/queue",
    "@repo/types",
  ],
});
