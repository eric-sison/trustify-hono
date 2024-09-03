import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { getCookie } from "hono/cookie";
import { redis } from "@trustify/db/config/redis";

export const sessions = new Hono();

sessions.post("/verify-login-session", async (c) => {
  const sessionCookie = getCookie(c, "login_ssid");

  if (!sessionCookie) {
    throw new HTTPException(401, { message: "invalid login session" });
  }

  const session = await redis.get(sessionCookie);

  if (session === null) {
    throw new HTTPException(401, { message: "invalid login session" });
  }

  return c.json({ status: "ok" });
});
