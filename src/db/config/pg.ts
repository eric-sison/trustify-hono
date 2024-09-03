import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres({
  host: Bun.env.DB_HOST,
  port: parseInt(Bun.env.DB_PORT!!),
  username: Bun.env.DB_USER,
  password: Bun.env.DB_PASS,
  database: Bun.env.DB_NAME,
});

// `postgres://${Bun.env.DB_USER}:${Bun.env.DB_PASS}@${Bun.env.DB_HOST}:${Bun.env.DB_PORT}/${Bun.env.DB_NAME}`

export const db = drizzle(client);
