import { z } from "zod";

const originListSchema = z
  .string()
  .default("")
  .transform((value) => value.split(",").map((origin) => origin.trim()).filter(Boolean))
  .pipe(
    z.array(
      z.string().refine((origin) => URL.canParse(origin) && new URL(origin).origin === origin, {
        message: "must be an origin like https://bomo.refugies.info (no path, no trailing slash)",
      }),
    ),
  );

const configSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default("0.0.0.0"),
  MONGODB_URI: z.string().min(1),
  ALGOLIA_APP_ID: z.string().min(1),
  ALGOLIA_SEARCH_API_KEY: z.string().min(1),
  ALGOLIA_INDEX_NAME: z.string().min(1),
  EDITOR_ORIGINS: originListSchema,
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
});

export type Config = z.infer<typeof configSchema>;

export const loadConfig = (env: NodeJS.ProcessEnv = process.env): Config => configSchema.parse(env);
