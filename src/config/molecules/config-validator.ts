import { z } from 'zod';
import { logger } from '@shared/logger/index.js';

/**
 * Molecule: Config Validator (PR-001)
 * Uses Zod to validate all required environment variables before the server starts.
 * Throws a human-readable error listing every failing field.
 */

// ---------------------------------------------------------------------------
// Zod schema ??validate raw process.env (all values are strings at this point)
// ---------------------------------------------------------------------------
const envSchema = z
  .object({
    // Server
    PORT: z
      .string()
      .optional()
      .default('4000')
      .refine((v) => {
        const n = Number(v);
        return Number.isInteger(n) && n > 0 && n <= 65535;
      }, { message: '端口必須在 1 到 65535 之間' }),

      // At least one AI provider credential must be present
      GITHUB_PAT_TOKEN:    z.string().optional(),
      GEMINI_API_KEY:      z.string().optional(),
      AZURE_OPENAI_API_KEY: z.string().optional(),
      AZURE_OPENAI_ENDPOINT: z.string().optional(),
      AZURE_OPENAI_DEPLOYMENT: z.string().optional(),

      // Rate-limiting
      RATE_LIMIT_RPM: z
      .string()
      .optional()
      .default('30')
      .refine((v) => {
        const n = Number(v);
        return Number.isInteger(n) && n >= 1;
      }, { message: 'RATE_LIMIT_RPM 必須為正整數' }),


    // Security
    CORS_ALLOW_ALL_ORIGINS: z
      .enum(['true', 'false'])
      .optional()
      .default('false'),
    EXPOSE_DEBUG_ENDPOINTS: z
      .enum(['true', 'false'])
      .optional()
      .default('false'),

    // Log format
    LOG_FORMAT: z
      .enum(['json', 'pretty'])
      .optional()
      .default('json'),
  })
  .superRefine((env, ctx) => {
    // Cross-field: at least one AI provider must be configured
    const hasGithub = !!env.GITHUB_PAT_TOKEN?.trim();
    const hasGemini = !!env.GEMINI_API_KEY?.trim();
    const hasAzure =
      !!env.AZURE_OPENAI_API_KEY?.trim() &&
      !!env.AZURE_OPENAI_ENDPOINT?.trim() &&
      !!env.AZURE_OPENAI_DEPLOYMENT?.trim();

    if (!hasGithub && !hasGemini && !hasAzure) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['GITHUB_PAT_TOKEN'],
        message:
          '缺少必要的 AI 認證：請提供 GITHUB_PAT_TOKEN 或 GEMINI_API_KEY，或完整的 Azure OpenAI 設定 (API_KEY + ENDPOINT + DEPLOYMENT)',
      });
    }
  });

// ---------------------------------------------------------------------------
// Public validator
// ---------------------------------------------------------------------------
export const ConfigValidator = {
  validate() {
    logger.info('ConfigValidator', 'Validating configuration...');

    const result = envSchema.safeParse(process.env);

    if (!result.success) {
      const issues = result.error.issues
        .map((issue, idx) => {
          const field = issue.path.join('.') || '(global)';
          return `  ${idx + 1}. [${field}] ${issue.message}`;
        })
        .join('\n');

      logger.error('ConfigValidator', '配置驗證失敗', { issues });
      throw new Error(
        `[ConfigValidationError] 基於安全與穩定性考慮，伺服器啟動前必須檢查 .env 設定：\n${issues}`
      );
    }

    logger.info('ConfigValidator', 'Configuration validation PASSED.');
  },
};


