import { build } from "esbuild";
import { loadEnv } from "vite";

const mode = process.env.MODE ?? process.env.NODE_ENV ?? "production";
const env = loadEnv(mode, process.cwd(), "");
const gtmId = env.VITE_GTM_ID ?? "";

await build({
  entryPoints: ["src/main.ts"],
  bundle: true,
  format: "esm",
  target: "es2022",
  outdir: "public",
  entryNames: "main",
  logLevel: "info",
  define: {
    "import.meta.env.VITE_GTM_ID": JSON.stringify(gtmId)
  }
});
