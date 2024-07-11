import { serve } from "@hono/node-server";
import { Context, Hono } from "hono";
import { cors } from "hono/cors";
import * as _jsonwebtoken from "jsonwebtoken";
import { sign as signType, verify as verifyType } from "jsonwebtoken";
import { WebSocketServer } from "ws";
import { createDatabaseConnection } from "./database";
import { appConfiguration } from "./env/env";
import roleBasedMiddleware from "./middleware/middleware";
import { Message } from "./models/message";
import announcements from "./routes/announcement";
import auth from "./routes/auth";
import categories from "./routes/categorie";
import messages from "./routes/message";
import reviews from "./routes/review";
import skills from "./routes/skill";
import users from "./routes/user";

const jsonwebtoken = <any>_jsonwebtoken;

const sign: typeof signType = jsonwebtoken.default.sign;
const verify: typeof verifyType = jsonwebtoken.default.verify;

const PORT = appConfiguration.SERVER_PORT || 3001;
const BASE_ROUTE = appConfiguration.BASE_ROUTE;

const app = new Hono();

// CORS middleware
app.use(
  "*",
  cors({
    origin: "http://localhost:3000",
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "Access-Control-Allow-Headers"],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    maxAge: 600,
    credentials: true,
  })
);

await createDatabaseConnection();

// Apply role-based middleware to all routes starting with /api
app.use("/api/*", roleBasedMiddleware);

// Apply the routes
app.route(BASE_ROUTE, announcements);
app.route(BASE_ROUTE, users);
app.route(BASE_ROUTE, reviews);
app.route(BASE_ROUTE, skills);
app.route(BASE_ROUTE, categories);
app.route(BASE_ROUTE, messages);
app.route("/", auth);

app.get("/api/healthz", (c: Context) => {
  return c.text("OK");
});

// Error handling middleware
app.onError((err, c) => {
  console.error(`${err}`);
  return c.text("Internal Server Error", 500);
});

// Not Found handler
app.notFound((c) => {
  return c.text("Not Found", 404);
});

// Serve HTTP with WebSocket support on port PORT
const server = serve({
  fetch: app.fetch,
  port: PORT,
});

// @ts-ignore
const wss = new WebSocketServer({ server });

wss.on("connection", function connection(ws: any) {
  ws.on("error", console.error);
  ws.on("message", async function message(data: any) {
    //conver data buffer to object
    let dataSave = JSON.parse(data);
    const newMessage = new Message({
      user: dataSave.user,
      announcement: dataSave.announcement,
      sender: dataSave.sender,
      content: dataSave.content,
    });

    await newMessage.save();

    // Broadcast the message to all clients
    if (ws.readyState === ws.OPEN) {
      ws.send(data);
    }
  });
});
