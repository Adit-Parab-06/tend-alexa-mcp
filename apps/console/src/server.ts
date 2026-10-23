import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderConsoleHtml } from "./consoleUi.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = new Hono();

function getLogoBuffer(): Buffer | null {
  const candidates = [
    resolve(__dirname, "../assets/logo.png"),
    resolve(process.cwd(), "assets/logo.png"),
    resolve(process.cwd(), "logo.png"),
    resolve(process.cwd(), "../../logo.png"),
    resolve(process.cwd(), "Tend_logo.png"),
    resolve(process.cwd(), "apps/console/assets/logo.png"),
  ];
  for (const p of candidates) {
    if (existsSync(p)) {
      return readFileSync(p);
    }
  }
  return null;
}

app.get("/logo.png", (c) => {
  const buf = getLogoBuffer();
  if (!buf) {
    return c.text("Logo not found", 404);
  }
  c.header("Content-Type", "image/png");
  c.header("Cache-Control", "public, max-age=86400");
  return c.body(new Uint8Array(buf).buffer as ArrayBuffer);
});

app.get("/", (c) => c.html(renderConsoleHtml()));
app.get("/health", (c) => c.json({ status: "ok", app: "tend-console" }));

const port = Number(process.env.CONSOLE_PORT || 3001);

if (process.env.NODE_ENV !== "test") {
  console.log(`[Tend Console] Running at http://localhost:${port}`);
  serve({ fetch: app.fetch, port });
}

export default app;
