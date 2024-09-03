import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/*",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.DB_HOST!!,
    port: parseInt(process.env.DB_PORT!!),
    user: process.env.DB_USER!!,
    password: process.env.DB_PASS!!,
    database: process.env.DB_NAME!!,
  },
});
