import * as dotenv from "dotenv";
dotenv.config();

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgres://ghassenbenali@localhost:5432/pos_db",
  },
}; 