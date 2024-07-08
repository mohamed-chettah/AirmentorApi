import * as dotenv from "dotenv";
dotenv.config();

interface Env {
  MONGODB_CLUSTER: string;
  MONGODB_USER: string;
  MONGODB_PWD: string;
  MONGODB_DATABASE: string;
  SERVER_PORT: string;
}

export const appConfiguration: Env = {
  MONGODB_CLUSTER: process.env.MONGODB_CLUSTER || "",
  MONGODB_USER: process.env.MONGODB_USER || "",
  MONGODB_PWD: process.env.MONGODB_PWD || "",
  MONGODB_DATABASE: process.env.MONGODB_DATABASE || "",
  SERVER_PORT: process.env.PORT || "3000",
};
