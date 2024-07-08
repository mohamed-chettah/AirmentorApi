import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { createDatabaseConnection } from "./database";
import { appConfiguration } from "./env/env";

const PORT = parseInt(appConfiguration.SERVER_PORT) || 3000;

const app = new Hono();
await createDatabaseConnection();

console.log(`Server is running on port ${PORT}`);

serve({
  fetch: app.fetch,
  port: PORT,
});
