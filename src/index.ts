import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { createDatabaseConnection } from "./database";
import { appConfiguration } from "./env/env";
import announcements from "./routes/announcement";
import users from "./routes/user";
import reviews from "./routes/review";

const PORT = parseInt(appConfiguration.SERVER_PORT) || 3000;

const app = new Hono();
await createDatabaseConnection();
app.route('/api', announcements);
app.route('/api', users);
app.route('/api', reviews);


console.log(`Server is running on port ${PORT}`);

serve({
  fetch: app.fetch,
  port: PORT,
});
