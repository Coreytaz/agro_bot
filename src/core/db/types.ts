import { drizzle } from "./drizzle";

export type DrizzleClient = typeof drizzle;

export type DrizzleTx = Parameters<
  Parameters<(typeof drizzle)["transaction"]>[0]
>[0];

export interface DrizzleOptions {
  ctx?: DrizzleClient | DrizzleTx;
}
