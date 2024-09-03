import { redis } from "@trustify/db/config/redis";
import { randomBytes } from "crypto";
import { Context } from "hono";
import { setCookie } from "hono/cookie";
import { BlankEnv, BlankInput } from "hono/types";

export function generateSsId(length: number) {
  return randomBytes(length).toString("hex");
}

export function setLoginSession(context: Context<BlankEnv, "/", BlankInput>, clientId: string) {
  // generate
  const loginSsid = generateSsId(16);

  // set session in the redis store that expires in 5 mins
  redis.set(loginSsid, clientId, "EX", 60 * 15);

  // set cookie in the browser
  setCookie(context, Bun.env.LOGIN_SESSION_NAME ?? "login_ssid", loginSsid, {
    httpOnly: Boolean(Bun.env.LOGIN_SESSION_HTTP_ONLY) ?? true,
    secure: Bun.env.LOGIN_SESSION_SECURE === "false" ? false : Boolean(Bun.env.LOGIN_SESSION_SECURE),
    path: Bun.env.LOGIN_SESSION_PATH ?? "/",
    domain: Bun.env.LOGIN_SESSION_DOMAIN ?? "localhost",
    maxAge: !isNaN(Number(Bun.env.LOGIN_SESSION_MAXAGE)) ? Number(Bun.env.LOGIN_SESSION_MAXAGE) : 500,
    sameSite: (Bun.env.LOGIN_SESSION_SAMESITE as "Strict") ?? "Lax",
  });
}
