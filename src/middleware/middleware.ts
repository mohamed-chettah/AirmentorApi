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

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "PATCH";
type Role = "USER" | "ADMIN";

interface Rule {
  path: string;
  methods: HttpMethod[];
  roles: Role[];
}

const rules: Rule[] = [
  { path: "/api/categories", methods: ["GET"], roles: [] },
  { path: "/api/categories", methods: ["POST", "PUT", "DELETE"], roles: ["ADMIN"] },
  { path: "/api/skills", methods: ["GET"], roles: [] },
  { path: "/api/skills", methods: ["POST", "PUT", "DELETE"], roles: ["ADMIN"] },
  { path: "/api/reviews", methods: ["GET", "POST", "DELETE"], roles: ["USER"] },
  { path: "/api/announcements", methods: ["GET", "DELETE", "POST", "PUT", "PATCH"], roles: ["USER"] },
  { path: "/api/announcements", methods: ["GET", "DELETE"], roles: ["ADMIN"] },
  { path: "/api/announcements", methods: ["GET"], roles: [] },
  { path: "/api/users", methods: ["GET", "DELETE", "PUT", "PATCH"], roles: ["USER", "ADMIN"] },
  { path: "/auth", methods: ["GET"], roles: [] },
  { path: "/auth", methods: ["POST", "PUT", "DELETE"], roles: ["ADMIN"] },
  { path: "/api/messages", methods: ["GET"], roles: ["USER"] },
];

const roleBasedMiddleware = async (context: Context, next: Next) => {
  console.log("> Role based middleware");

  const path = context.req.path;
  const method = context.req.method as HttpMethod;

  // Check if the route is public (no roles required)
  const publicRule = rules.find((rule) => path.startsWith(rule.path) && rule.methods.includes(method) && rule.roles.length === 0);

  if (publicRule) {
    return next();
  }

  const token = getCookie(context, "auth_token");
  if (!token) {
    console.log("! No token provided");
    return context.json({ message: "Unauthorized" }, 401);
  }

  console.log("> Token found: ", token);
  console.log("> Verifying token");

  try {
    const decoded = verify(token, appConfiguration.JWT_SECRET) as JwtPayload;
    console.log("> Token verified for a : ", decoded.role);
    const role = decoded.role as Role;

    console.log("> Path, Method: ", path, method);
    console.log("> Handling rules");

    const matchingRule = rules.find(
      (rule) => path.startsWith(rule.path) && rule.methods.includes(method) && rule.roles.includes(role)
    );

    if (matchingRule) {
      return next();
    }

    console.log("! Forbidden for role and resource : ", role, path, method);
    return context.json({ message: "Forbidden" }, 403);
  } catch (error) {
    return context.json({ message: "Invalid token" }, 401);
  }
};

export default roleBasedMiddleware;
