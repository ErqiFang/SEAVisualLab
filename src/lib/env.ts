const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

export interface ServerEnv {
  tokenPlanApiKey?: string;
  tokenPlanBaseUrl: string;
  miniMaxModel: string;
  miniMaxImageModel: string;
  enableRealGeneration: boolean;
  enableFallbackMock: boolean;
  requestTimeoutMs: number;
  imageGenerationProvider: string;
  tokenPlanChatPath: string;
  tokenPlanImagePath: string;
  appBaseUrl?: string;
  nodeEnv: string;
}

export class EnvValidationError extends Error {
  constructor(public readonly missingKeys: string[]) {
    super(`Missing required environment variables: ${missingKeys.join(", ")}`);
    this.name = "EnvValidationError";
  }
}

function readBoolean(value: string | undefined, defaultValue: boolean) {
  if (!value) return defaultValue;
  return TRUE_VALUES.has(value.toLowerCase());
}

export function getServerEnv(): ServerEnv {
  return {
    tokenPlanApiKey: process.env.TOKENPLAN_API_KEY,
    tokenPlanBaseUrl: process.env.TOKENPLAN_BASE_URL ?? "https://api.minimax.io",
    miniMaxModel: process.env.MINIMAX_MODEL ?? "MiniMax-M2.7",
    miniMaxImageModel: process.env.MINIMAX_IMAGE_MODEL ?? "image-01",
    enableRealGeneration: readBoolean(process.env.ENABLE_REAL_GENERATION, false),
    enableFallbackMock: readBoolean(process.env.ENABLE_FALLBACK_MOCK, true),
    requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS ?? "45000"),
    imageGenerationProvider: process.env.IMAGE_GENERATION_PROVIDER ?? "minimax-via-tokenplan",
    tokenPlanChatPath: process.env.TOKENPLAN_CHAT_PATH ?? "/anthropic/v1/messages",
    tokenPlanImagePath: process.env.TOKENPLAN_IMAGE_PATH ?? "/v1/image_generation",
    appBaseUrl: process.env.APP_BASE_URL,
    nodeEnv: process.env.NODE_ENV ?? "development"
  };
}

export function assertRealGenerationEnv(env: ServerEnv) {
  const missing = [!env.tokenPlanApiKey && "TOKENPLAN_API_KEY", !env.tokenPlanBaseUrl && "TOKENPLAN_BASE_URL"].filter(Boolean) as string[];

  if (missing.length > 0) {
    throw new EnvValidationError(missing);
  }
}

export function isDevServer() {
  return getServerEnv().nodeEnv !== "production";
}
