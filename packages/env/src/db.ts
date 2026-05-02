import { createEnv } from "@t3-oss/env-core";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import { z } from "zod";

const envPaths = [
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), "../../apps/server/.env"),
];

for (const path of envPaths) {
  if (existsSync(path)) {
    loadEnv({ path });
  }
}

export const env = createEnv({
  clientPrefix: "",
  client: {},
  server: {
    DATABASE_URL: z.string().min(1),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
