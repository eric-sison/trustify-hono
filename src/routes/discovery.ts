import { Hono } from "hono";
import { oidcConfig } from "../../oidc.config";

export const discovery = new Hono();

discovery.get("/", async (c) => {
  return c.json(oidcConfig);
});
