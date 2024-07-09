import { OAuth2Client } from "google-auth-library";
import { Context, Hono, Next } from "hono";
import * as _jsonwebtoken from "jsonwebtoken";
import { sign as signType, verify as verifyType } from "jsonwebtoken";
const jsonwebtoken = <any>_jsonwebtoken;

const sign: typeof signType = jsonwebtoken.default.sign;
const verify: typeof verifyType = jsonwebtoken.default.verify;

import { getCookie, setCookie } from "hono/cookie";
import { appConfiguration } from "../env/env";
import { User } from "../models/user";

const app = new Hono().basePath("/auth");

const oauth2Client = new OAuth2Client(
  appConfiguration.OAUTH_GOOGLE_CLIENT_ID,
  appConfiguration.OAUTH_CLIENT_SECRET,
  appConfiguration.OAUTH_REDIRECT_URI
);

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

// const authMiddleware = verify(getCookie(c, "auth_token"), appConfiguration.JWT_SECRET);

app.get("/google", (c: Context) => {
  console.log("> Initiating Google OAuth flow");
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"],
  });

  console.log("> Redirecting to Google OAuth");
  return c.redirect(authUrl);
});

app.get("/google/callback", async (c: Context) => {
  //randomuser.me/api/port
  https: console.log("> Handling Google OAuth callback");
  const code = c.req.query("code");

  if (!code) {
    console.log("! No code provided");
    return c.json({ error: "No code provided" }, 400);
  }

  try {
    console.log("> Exchanging code for tokens");
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    console.log("> Verifying Google ID token");

    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: appConfiguration.OAUTH_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      console.log("! No payload");
      return c.json({ error: "No payload" }, 400);
    }

    const { sub: googleId, email, name, picture } = payload;

    console.info(`> User authenticated: ${name} (${email})`);

    const userExists = await User.findOne({ googleId });

    if (userExists) {
      console.log("> User already exists in MongoDB");
    } else {
      console.log("> Creating new user in MongoDB");
      const newUser = new User({ googleId, email, name, profile_picture: picture });
      await newUser.save();
    }

    const token = sign({ googleId, name }, appConfiguration.JWT_SECRET, { expiresIn: "7d" });

    setCookie(c, "auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return c.redirect("http://localhost:3000/");
  } catch (error) {
    console.error("Error during authentication:", error);
    return c.json({ error: "Error during authentication" }, 500);
  }
});

app.get("/check", authMiddleware, (c: Context) => {
  console.log("> Checking token validity");
  const token = c.get("jwtPayload");
  return c.json({ valid: true, user: token });
});

app.get("/dashboard", authMiddleware, (c: Context) => {
  console.log("> Loggin user out");
  const token = c.get("jwtPayload");
  return c.json({ message: "Welcome to your dashboard!", user: token });
});

app.get("/logout", (c: Context) => {
  console.log("> Loggin user out");
  setCookie(c, "auth_token", "", { maxAge: 0 });
  return c.redirect("http://localhost:3000/");
});

export default app;
