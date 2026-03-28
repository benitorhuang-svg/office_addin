import config from './server-config.js';

/**
 * Molecule: Config Validator
 * Ensures all required environment variables are present and valid before the server starts.
 */
export const ConfigValidator = {
  validate() {
    console.log('[Setup] Validating configuration...');
    const errors: string[] = [];

    // 1. Required Core SDK Authentication
    const hasGithubToken = !!config.getServerPatToken();
    const hasGeminiKey = !!config.GEMINI_API_KEY;
    const isAzure = config.isAzureConfigured();

    if (!hasGithubToken && !hasGeminiKey && !isAzure) {
      errors.push('缺少必要的 AI 認證 (GitHub PAT, Gemini API Key 或 Azure OpenAI)');
    }

    // 2. Port Validation
    const port = Number(config.PORT);
    if (isNaN(port) || port <= 0 || port > 65535) {
      errors.push(`不正確的埠號設定: ${config.PORT}`);
    }

    // 3. Model Consistency
    if (config.AVAILABLE_MODELS.length === 0) {
      errors.push('沒有可用的模型設定 (AVAILABLE_MODELS_GITHUB / AVAILABLE_MODELS_GEMINI)');
    }

    if (errors.length > 0) {
      console.error('❌ 配置驗證失敗:');
      errors.forEach((err, idx) => console.error(`${idx + 1}. ${err}`));
      throw new Error(`[ConfigValidationError] 基於安全與穩定性考量，伺服器無法啟動。請檢查 .env 設定。\n${errors.join('\n')}`);
    }

    console.log('[Setup] Configuration validation PASSED.');
  }
};
