import { serve } from "@hono/node-server";
import { Context, Hono } from "hono";
import { createDatabaseConnection } from "./database";
import { appConfiguration } from "./env/env";
import announcements from "./routes/announcement";
import auth from "./routes/auth";
import reviews from "./routes/review";
import users from "./routes/user";

const PORT = appConfiguration.SERVER_PORT;
const BASE_ROUTE = appConfiguration.BASE_ROUTE;

const app = new Hono();
await createDatabaseConnection();
app.route("/api", announcements);
app.route("/api", users);
app.route("/api", reviews);

app.get("/api/healthz", (c: Context) => {
  return c.text("OK");
});

// set routes
app.route(BASE_ROUTE, auth);

serve({
  fetch: app.fetch,
  port: PORT,
});
