import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { renderConsoleHtml } from "./consoleUi.js";

const app = new Hono();

app.get("/", (c) => c.html(renderConsoleHtml()));
app.get("/health", (c) => c.json({ status: "ok", app: "tend-console" }));

const port = Number(process.env.CONSOLE_PORT || 3001);

if (process.env.NODE_ENV !== "test") {
  console.log(`[Tend Console] Running at http://localhost:${port}`);
  serve({ fetch: app.fetch, port });
}

export default app;
