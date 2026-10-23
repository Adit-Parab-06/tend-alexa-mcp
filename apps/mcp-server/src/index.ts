import { Hono } from "hono";
import { TEND_VERSION } from "@tend/core";

export function createServerApp() {
  const app = new Hono();

  // Root health check
  app.get("/health", (c) => {
    return c.json({ status: "ok", version: TEND_VERSION, timestamp: new Date().toISOString() });
  });

  return app;
}

export const app = createServerApp();
