import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Disable prefetch as it is not supported for serverless deploys
const queryClient = postgres(process.env.DATABASE_URL, {
  ssl: process.env.NODE_ENV === "production",
  max: 1,
  idle_timeout: 20,
  max_lifetime: 60 * 30
});

export const db = drizzle(queryClient, { schema }); 