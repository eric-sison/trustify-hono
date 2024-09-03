import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db } from "@trustify/db/config/pg";
import { user } from "@trustify/db/schema/users";
import { HTTPException } from "hono/http-exception";
import { eq, and } from "drizzle-orm";

export const userSchema = z.object({
  clientId: z.string().uuid().nullish(),
  email: z.string().email().min(3).max(150),
  password: z.string().min(8).max(255),
  firstName: z.string().min(1),
  middleName: z.string().min(1),
  lastName: z.string().min(1),
  avatarUrl: z.string().nullish(),
});

export const users = new Hono();

// TODO: guard this route
users.get("/");

// returns true if email does exist, false otherwise
// this is to prevent duplicate email in the users database
export async function doesUserEmailExist(email: string) {
  try {
    const userFromDb = await db
      .select({
        id: user.id,
        email: user.email,
      })
      .from(user)
      .where(eq(user.email, email));

    return userFromDb.length === 0 ? false : true;
  } catch (error) {
    throw new HTTPException(500, { message: "something went wrong!", cause: error });
  }
}

// attempt to insert a new user into the users database
// the new user's email and password will be used as credentials for authentication
export async function insertNewUser(newUser: typeof user.$inferInsert) {
  try {
    // hash the password before inserting it into the database
    const hashedPw = await Bun.password.hash(newUser.password);

    const insertedUser = await db
      .insert(user)
      .values({ ...newUser, password: hashedPw })
      .returning({
        id: user.id,
        clientId: user.clientId,
        email: user.email,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
      });

    return insertedUser[0];
  } catch (error) {
    throw new HTTPException(500, { message: "something went wrong!", cause: error });
  }
}

// attempt to query userInfo from database via email
export async function getUserInfo(email: string) {
  try {
    const userInfo = await db
      .select({
        id: user.id,
        clientId: user.clientId,
        email: user.email,
        password: user.password,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        isSuspended: user.isSuspended,
        lastSignInAt: user.lastSignInAt,
      })
      .from(user)
      .where(and(eq(user.email, email)));

    return userInfo.length === 0 ? undefined : userInfo[0];
  } catch (error) {
    throw new HTTPException(500, { message: "something went wrong", cause: error });
  }
}

// update the user's last_signin_at
// note: this function should only be called on successful login
export async function updateUserLastSigin(userId: string) {
  try {
    const updatedUser = await db
      .update(user)
      .set({ lastSignInAt: new Date() })
      .where(eq(user.id, userId))
      .returning({ lastSignInAt: user.lastSignInAt });

    return updatedUser[0].lastSignInAt;
  } catch (error) {
    throw new HTTPException(500, { message: "something went wrong", cause: error });
  }
}

// check if user email is verified
export async function isUserEmailVerified(userId: string) {
  try {
    const userEmail = await db
      .select({
        isEmailVerified: user.isEmailVerified,
      })
      .from(user)
      .where(eq(user.id, userId));

    return userEmail[0].isEmailVerified;
  } catch (error) {
    throw new HTTPException(500, { message: "something went wrong", cause: error });
  }
}

export function verifyUserPassword(plainPw: string, hashedPw: string) {
  const isMatch = Bun.password.verify(plainPw, hashedPw);

  // verify if hashed password matches the provided password
  if (!isMatch) {
    throw new HTTPException(401, { message: "invalid credentials" });
  }
}
