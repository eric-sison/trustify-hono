import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { showRoutes } from "hono/dev";
import { healthcheck, authorize, discovery, register, login, users, sessions } from "./routes";

const app = new Hono().basePath("api");

app.use(logger());

app.use(
  cors({
    credentials: true,
    origin: [Bun.env.ADMIN_HOST!!],
  })
);

app.route("/healthcheck", healthcheck);

app.route("/.well-known/openid-configuration", discovery);

app.route("/v1/authorize", authorize);

app.route("/v1/sessions", sessions);

app.route("v1/users", users);

app.route("v1/register", register);

app.route("/v1/login", login);

showRoutes(app);

export default {
  fetch: app.fetch,
  port: 3214,
};
