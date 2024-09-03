import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { redis } from "@trustify/db/config/redis";
import { deleteCookie, getCookie } from "hono/cookie";
import { getUserInfo, isUserEmailVerified, updateUserLastSigin, verifyUserPassword } from "./users";

const loginSchema = z.object({
  clientId: z.string().uuid(),
  email: z.string().email().min(3).max(150),
  password: z.string().min(8).max(255),
});

export const login = new Hono();

login.use(async (c, next) => {
  const sessionCookie = getCookie(c, "login_ssid");

  if (!sessionCookie) {
    throw new HTTPException(401, { message: "invalid login session" });
  }

  const loginSession = await redis.get(sessionCookie);

  if (!loginSession) {
    throw new HTTPException(401, { message: "invalid login session" });
  }

  //@ts-ignore
  c.set("cookie", sessionCookie);

  await next();
});

login.post("/", zValidator("json", loginSchema), async (c) => {
  // get the validated credentials
  const credentials = c.req.valid("json");

  // get user details from the database
  const userInfo = await getUserInfo(credentials.email);

  // check if user email is registered in the database
  if (!userInfo) {
    throw new HTTPException(401, { message: "invalid credentials" });
  }

  verifyUserPassword(credentials.password, userInfo.password);

  // check if the user attempting to login belongs to a client
  if (!userInfo?.clientId) {
    throw new HTTPException(401, { message: "not a valid user" });
  }

  // check if the user attempting to login belongs to the client provided
  if (userInfo.clientId !== credentials.clientId) {
    throw new HTTPException(401, { message: "not a valid user" });
  }

  // check if user is suspended
  if (userInfo.isSuspended) {
    throw new HTTPException(401, { message: "user account is currently suspended" });
  }

  const isVerifiedEmail = await isUserEmailVerified(userInfo.id);

  // check if user email is verified
  if (!isVerifiedEmail) {
    throw new HTTPException(401, { message: "user email is not yet verified" });
  }

  // if all checks succeed, update last_signin_at to current timestamp
  const updatedLastSignInAt = await updateUserLastSigin(userInfo.id);

  //@ts-ignore
  // get the cookie from login middleware
  const cookie = c.get("cookie") as string;

  // delete the cookie from the browser
  deleteCookie(c, "login_ssid");

  // delete the cookie from redis store
  await redis.del(cookie);

  // TODO: handle redirect - continue OIDC flow
  return c.json({ ...userInfo, lastSignInAt: updatedLastSignInAt });
});
