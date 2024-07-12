import {serve} from "@hono/node-server";
import {Context, Hono} from "hono";
import {cors} from "hono/cors";
import * as _jsonwebtoken from "jsonwebtoken";
import {sign as signType, verify as verifyType} from "jsonwebtoken";
import WebSocket, {WebSocketServer} from "ws";
import {createDatabaseConnection} from "./database";
import {appConfiguration} from "./env/env";
import roleBasedMiddleware from "./middleware/middleware";
import {Message} from "./models/message";
import announcements from "./routes/announcement";
import auth from "./routes/auth";
import categories from "./routes/categorie";
import messages from "./routes/message";
import reviews from "./routes/review";
import skills from "./routes/skill";
import users from "./routes/user";
import {Conversation} from "./models/conversation";
import conversations from "./routes/conversation";
import {User} from "./models/user";

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
app.route(BASE_ROUTE, conversations);
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
const wss = new WebSocketServer({server});

wss.on('connection', (ws: any) => {
    ws.on('error', console.error);

    ws.on('message', async (data: any) => {
        try {
            // Convert data buffer to object
            const dataSave = JSON.parse(data);
            console.log('Received message:', dataSave);
            // Find or create conversation
            // @ts-ignore
            let conversation = null;//conversationId:  6691022246648914c2b5a7b5

            console.log("conversationId: ", dataSave.conversationId)
            if (dataSave.conversationId === "" || dataSave.conversationId === undefined || dataSave.conversationId === null) {
                console.log("conversationId is empty")
                conversation = await Conversation.findOne({
                    idAnnouncement: dataSave.announcement,
                    idUser: dataSave.user,
                    idCreator: dataSave.creator
                });
            } else {
                console.log("conversationId is not empty")
                conversation = await Conversation.findOne({
                    _id: dataSave.conversationId
                });
            }


            if (!conversation) {
                console.log('Creating new conversation')
                conversation = new Conversation({
                    idAnnouncement: [dataSave.announcement],
                    idUser: [dataSave.user],
                    idCreator: [dataSave.creator],
                    messages: []
                });
                await conversation.save();
            }
            let user = await User.findOne({_id: dataSave.user});
            const newMessage = new Message({
                user: user,
                content: dataSave.content,
                timestamp: dataSave.timestamp
            });

            await newMessage.save();

            // Add message to conversation
            // @ts-ignore
            conversation.messages.push(newMessage._id);
            await conversation.updateOne({messages: conversation.messages});

            // Broadcast the message to all clients
            wss.clients.forEach((client: any) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        conversationId: conversation._id,
                        user: user,
                        content: dataSave.content,
                        timestamp: dataSave.timestamp
                    }));
                }

            });
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });
});
