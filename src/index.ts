import { serve } from "@hono/node-server";
import { Context, Hono, Next } from "hono";
import { cors } from "hono/cors";
import { createDatabaseConnection } from "./database";
import { appConfiguration } from "./env/env";
import announcements from "./routes/announcement";
import auth from "./routes/auth";
import reviews from "./routes/review";
import users from "./routes/user";

import * as _jsonwebtoken from "jsonwebtoken";
import { sign as signType, verify as verifyType } from "jsonwebtoken";
const jsonwebtoken = <any>_jsonwebtoken;

const sign: typeof signType = jsonwebtoken.default.sign;
const verify: typeof verifyType = jsonwebtoken.default.verify;

import { getCookie } from "hono/cookie";
import categories from "./routes/categorie";
import skills from "./routes/skill";

const PORT = appConfiguration.SERVER_PORT;
const BASE_ROUTE = appConfiguration.BASE_ROUTE;

const app = new Hono();

const authMiddleware = async (c: Context, next: Next) => {
  console.log("> Checking if user is authenticated");
  const token = getCookie(c, "auth_token");
  if (!token) {
    console.log("! No token found");
    return c.text("Unauthorized", 401);
  }

  try {
    console.log("> Verifying validity of token");
    const payload = verify(token, appConfiguration.JWT_SECRET);
    c.set("jwtPayload", payload);
    await next();
  } catch (error) {
    console.log("! Token is invalid");
    return c.text("Invalid token", 401);
  }
};

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

// make app use the authMiddleware except for route /auth/google
app.use(BASE_ROUTE, authMiddleware);

await createDatabaseConnection();

// Routes
app.route(BASE_ROUTE, announcements);
app.route(BASE_ROUTE, users);
app.route(BASE_ROUTE, reviews);
app.route(BASE_ROUTE, skills);
app.route(BASE_ROUTE, categories);

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
