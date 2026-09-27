import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set. Run `npm run setup` first.");

// One connection pool per server process (kept across hot reloads in development).
const g = globalThis as unknown as { __dsSql?: ReturnType<typeof postgres> };
const sql = g.__dsSql ?? postgres(url, { max: 10 });
if (process.env.NODE_ENV !== "production") g.__dsSql = sql;

export const db = drizzle(sql, { schema });
export { schema };
