import { Context, Next } from "hono";
import { getCookie } from "hono/cookie";

import * as _jsonwebtoken from "jsonwebtoken";
import { verify as verifyType } from "jsonwebtoken";
import { appConfiguration } from "../env/env";
const jsonwebtoken = <any>_jsonwebtoken;

const verify: typeof verifyType = jsonwebtoken.default.verify;

interface JwtPayload {
  role: "USER" | "ADMIN";
  email: string;
  iat: number;
  exp: number;
  googleId: string;
  name: string;
  picture: string;
}

const roleBasedMiddleware = async (context: Context, next: Next) => {
  // if route GET on /api/categories, /api/cateogries/:id allow without token
  if (context.req.path.startsWith("/api/categories") && context.req.method === "GET") {
    return next();
  }

  if (context.req.path.startsWith("/api/anouncements") && context.req.method === "GET") {
    return next();
  }

  console.log("> Role based middleware");
  const token = getCookie(context, "auth_token");
  if (!token) {
    console.log("! No token provided");
    return context.json({ message: "Unauthorized" }, 401);
  }

  console.log("> Token foudn: ", token);
  console.log("> Verifying token");

  try {
    const decoded = verify(token, appConfiguration.JWT_SECRET) as JwtPayload;
    console.log("> Token verified for a : ", decoded.role);
    const { role } = decoded;
    const path = context.req.path;
    const method = context.req.method;

    console.log("> Path, Method: ", path, method);
    console.log("> Handling rules");

    if (path.startsWith("/auth")) {
      if (method === "GET") {
        return next();
      } else if (role === "ADMIN" && ["POST", "PUT", "DELETE"].includes(method)) {
        return next();
      }
    }

    // Rules for /api/categories
    if (path.startsWith("/api/categories")) {
      if (method === "GET") {
        return next();
      } else if (role === "ADMIN" && ["POST", "PUT", "DELETE"].includes(method)) {
        return next();
      }
    }

    // Rules for /api/skills
    else if (path.startsWith("/api/skills")) {
      if (method === "GET") {
        return next();
      } else if (role === "ADMIN" && ["POST", "PUT", "DELETE"].includes(method)) {
        return next();
      }
    }

    // Rules for /api/announcements
    else if (path.startsWith("/api/announcements")) {
      if (role === "USER" && ["GET", "DELETE", "POST", "PUT", "PATCH"].includes(method)) {
        return next();
      } else if (role === "ADMIN" && ["GET", "DELETE"].includes(method)) {
        return next();
      }
    }

    // Rules for /api/users
    else if (path.startsWith("/api/users")) {
      if (["GET", "DELETE"].includes(method)) {
        return next();
      }
    }

    // If none of the conditions are met, return forbidden
    console.log("! Forbidden for role and ressource : ", role, path, method);
    return context.json({ message: "Forbidden" }, 403);
  } catch (error) {
    return context.json({ message: "Invalid token" }, 401);
  }
};

export default roleBasedMiddleware;
