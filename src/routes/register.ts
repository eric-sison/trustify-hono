import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { doesUserEmailExist, insertNewUser, userSchema } from "./users";
import { HTTPException } from "hono/http-exception";

export const register = new Hono();

// TODO: guard this route
register.post("/", zValidator("form", userSchema), async (c) => {
  // validate userInfo based on the userSchema sent through the request body
  const userInfo = c.req.valid("form");

  // check if email already exists in the users' table
  const emailExists = await doesUserEmailExist(userInfo.email);

  // throw an error if email already exists to prevent duplication
  if (emailExists) {
    throw new HTTPException(400, { message: "email already exists" });
  }

  // insert a user into the database
  const newUser = await insertNewUser(userInfo);

  return c.json(newUser);
});
