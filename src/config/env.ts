import { z } from 'zod';
import { BASE_ENV } from '@config/atoms/base-env.js';

const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  PORT: z.preprocess((val) => Number(val), z.number().positive()),
  RATE_LIMIT_RPM: z.preprocess((val) => Number(val), z.number().positive()),
});

const validatedEnv = envSchema.safeParse({
  GEMINI_API_KEY: BASE_ENV.GEMINI_API_KEY,
  PORT: BASE_ENV.PORT,
  RATE_LIMIT_RPM: BASE_ENV.RATE_LIMIT_RPM,
});

if (!validatedEnv.success) {
  console.error('Environment validation failed:', validatedEnv.error.format());
  process.exit(1); // Fail-fast
}

import config from '@config/molecules/server-config.js';
export default config;
