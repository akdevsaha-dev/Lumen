import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  format: ["esm"],
  clean: true,
  outDir: "dist",
  noExternal: [
    "@repo/database",
    "@repo/lib",
    "@repo/queue",
    "@repo/types",
  ],
});
