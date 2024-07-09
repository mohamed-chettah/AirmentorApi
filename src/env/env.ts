import * as dotenv from "dotenv";
dotenv.config();

interface Env {
  SERVER_PORT: number;
  BASE_ROUTE: string;
  APP_URL: string;

  MONGODB_CLUSTER: string;
  MONGODB_USER: string;
  MONGODB_PWD: string;
  MONGODB_DATABASE: string;

  JWT_SECRET: string;
  OAUTH_GOOGLE_CLIENT_ID: string;
  OAUTH_CLIENT_SECRET: string;
  OAUTH_REDIRECT_URI: string;
}

export const appConfiguration: Env = {
  MONGODB_CLUSTER: process.env.MONGODB_CLUSTER || "",
  MONGODB_USER: process.env.MONGODB_USER || "",
  MONGODB_PWD: process.env.MONGODB_PWD || "",
  MONGODB_DATABASE: process.env.MONGODB_DATABASE || "",
  APP_URL: process.env.APP_URL || "",
  SERVER_PORT: parseInt(process.env.PORT || "3001"),
  BASE_ROUTE: process.env.BASE_ROUTE || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  OAUTH_GOOGLE_CLIENT_ID: process.env.OAUTH_GOOGLE_CLIENT_ID || "",
  OAUTH_CLIENT_SECRET: process.env.OAUTH_CLIENT_SECRET || "",
  OAUTH_REDIRECT_URI: process.env.OAUTH_REDIRECT_URI || "",
};
