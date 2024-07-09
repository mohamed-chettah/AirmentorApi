import { serve } from "@hono/node-server";
import { Context, Hono } from "hono";
import { cors } from "hono/cors";
import { createDatabaseConnection } from "./database";
import { appConfiguration } from "./env/env";
import announcements from "./routes/announcement";
import auth from "./routes/auth";
import reviews from "./routes/review";
import users from "./routes/user";

const PORT = appConfiguration.SERVER_PORT;
const BASE_ROUTE = appConfiguration.BASE_ROUTE;

const app = new Hono();

// CORS middleware
app.use(
  "*",
  cors({
    origin: "http://localhost:3000",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["*"],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    maxAge: 600,
    credentials: true,
  })
);

await createDatabaseConnection();

// Routes
app.route("/api", announcements);
app.route("/api", users);
app.route("/api", reviews);

app.get("/api/healthz", (c: Context) => {
  return c.text("OK");
});

app.route(BASE_ROUTE, auth);

// Error handling middleware
app.onError((err, c) => {
  console.error(`${err}`);
  return c.text("Internal Server Error", 500);
});

// Not Found handler
app.notFound((c) => {
  return c.text("Not Found", 404);
});

serve({
  fetch: app.fetch,
  port: PORT,
});

console.log(`Server is running on port ${PORT}`);
