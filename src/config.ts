import * as dotenv from "dotenv";

dotenv.config();

const config = {
  PORT: process.env.PORT || "3000",
  DATABASE_URL: process.env.DATABASE_URL,
  API_TOKEN: process.env.API_TOKEN,
  LOG_GROUP_ID: process.env.LOG_GROUP_ID,
  URL: process.env.URL,
  eventBuffer: 5,
  JACOB_TG_CHANNEL_ID: process.env.JACOB_TG_CHANNEL_ID || "",
  EVENT_TG_CHANNEL_ID: process.env.EVENT_TG_CHANNEL_ID || "@hysb_events",
};

export default config;
