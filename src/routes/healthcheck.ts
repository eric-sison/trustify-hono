import { Hono } from "hono";

export const healthcheck = new Hono();

healthcheck.get("/", async (c) => {
  return c.json({ status: "ok" });
});
