import { connect } from "mongoose";
import { appConfiguration } from "../env/env";

const CONNECTION_STRING = `mongodb+srv://${appConfiguration.MONGODB_USER}:${appConfiguration.MONGODB_PWD}@${appConfiguration.MONGODB_CLUSTER}/${appConfiguration.MONGODB_DATABASE}`;

export async function createDatabaseConnection() {
  try {
    console.log("🟡 Initializing connection with remote Database");
    const _con = await connect(CONNECTION_STRING);
    console.log(`🟢 Successfully initialized connection to remote Database: ${CONNECTION_STRING}`);
    return _con;
  } catch (e) {
    console.error(`🔴 Failed to initialize connection to remote Database: ${CONNECTION_STRING}`, e);
    return e;
  }
}
