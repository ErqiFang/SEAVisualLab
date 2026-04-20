import { assertRealGenerationEnv, EnvValidationError, getServerEnv, isDevServer } from "@/lib/env";
import { createFallbackDetailImages, createFallbackMainImages } from "@/lib/mock/fallbackResults";
import { mapDetailGenerationResult } from "@/lib/mappers/detailImageResultMapper";
import { mapMainGenerationResult } from "@/lib/mappers/mainImageResultMapper";
import { buildDetailImagePrompt, buildLocalDetailPlan } from "@/lib/prompts/detailImagePrompt";
import { buildLocalMainPlan, buildMainImagePrompt } from "@/lib/prompts/mainImagePrompt";
import { ImageGenerationService } from "@/lib/services/imageGenerationService";
import { MiniMaxClient } from "@/lib/services/minimaxClient";
import { ProviderRequestError, TokenPlanClient } from "@/lib/services/tokenPlanClient";
import { DetailGenerationRequest, MainGenerationRequest } from "@/types/generation";

function createTaskId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeWarning(error: unknown) {
  if (error instanceof ProviderRequestError && error.code === "TOKENPLAN_INVALID_API_KEY") {
    return "当前 MiniMax / Token Plan API Key 无效、已撤销或没有权限访问该接口，已返回降级结果。";
  }
  if (error instanceof EnvValidationError) {
    return `实时生成不可用：缺少环境变量 ${error.missingKeys.join(", ")}。已返回降级结果。`;
  }
  if (error instanceof Error) {
    return `实时生成不可用，已返回降级结果。${error.message}`;
  }
  return "实时生成不可用，已返回降级结果。";
}

async function buildServerRenderedMainImages(
  request: MainGenerationRequest,
  plan: ReturnType<typeof buildLocalMainPlan> | Awaited<ReturnType<MiniMaxClient["createMainGenerationPlan"]>>,
  env = getServerEnv()
) {
  return new ImageGenerationService({ ...env, enableRealGeneration: false }).generateMainImages(plan, request);
}

async function buildServerRenderedDetailImages(
  request: DetailGenerationRequest,
  plan: ReturnType<typeof buildLocalDetailPlan> | Awaited<ReturnType<MiniMaxClient["createDetailGenerationPlan"]>>,
  env = getServerEnv()
) {
  return new ImageGenerationService({ ...env, enableRealGeneration: false }).generateDetailImages(plan, request);
}

async function buildMainImagesWithFallback(
  request: MainGenerationRequest,
  plan: ReturnType<typeof buildLocalMainPlan> | Awaited<ReturnType<MiniMaxClient["createMainGenerationPlan"]>>,
  env = getServerEnv()
) {
  try {
    return await new ImageGenerationService(env).generateMainImages(plan, request);
  } catch (error) {
    try {
      const rendered = await buildServerRenderedMainImages(request, plan, env);
      return {
        ...rendered,
        warningMessage: normalizeWarning(error)
      };
    } catch (renderError) {
      return {
        images: createFallbackMainImages(plan, request),
        sourceType: "mock-fallback" as const,
        warningMessage: `${ImageGenerationService.getFallbackWarning()} ${normalizeWarning(renderError)}`
      };
    }
  }
}

async function buildDetailImagesWithFallback(
  request: DetailGenerationRequest,
  plan: ReturnType<typeof buildLocalDetailPlan> | Awaited<ReturnType<MiniMaxClient["createDetailGenerationPlan"]>>,
  env = getServerEnv()
) {
  try {
    return await new ImageGenerationService(env).generateDetailImages(plan, request);
  } catch (error) {
    try {
      const rendered = await buildServerRenderedDetailImages(request, plan, env);
      return {
        ...rendered,
        warningMessage: normalizeWarning(error)
      };
    } catch (renderError) {
      return {
        images: createFallbackDetailImages(plan, request),
        sourceType: "mock-fallback" as const,
        warningMessage: `${ImageGenerationService.getFallbackWarning()} ${normalizeWarning(renderError)}`
      };
    }
  }
}

export async function orchestrateMainGeneration(request: MainGenerationRequest) {
  const env = getServerEnv();
  const taskId = createTaskId("main");
  const promptPackage = buildMainImagePrompt(request);
  const localPlan = buildLocalMainPlan(request);

  if (!env.enableRealGeneration) {
    const rendered = await buildMainImagesWithFallback(request, localPlan, env);
    return mapMainGenerationResult({
      taskId,
      request,
      plan: localPlan,
      images: rendered.images,
      sourceType: rendered.sourceType,
      warningMessage: env.enableFallbackMock
        ? "当前配置已关闭实时生成，已返回基于上传图片渲染的预览结果。"
        : rendered.warningMessage
    });
  }

  try {
    assertRealGenerationEnv(env);
    const planner = new MiniMaxClient(new TokenPlanClient(env));
    const plan = await planner.createMainGenerationPlan(promptPackage);
    const rendered = await buildMainImagesWithFallback(request, plan, env);

    return mapMainGenerationResult({
      taskId,
      request,
      plan,
      images: rendered.images,
      sourceType: rendered.sourceType,
      warningMessage: rendered.warningMessage
    });
  } catch (error) {
    if (!env.enableFallbackMock) {
      throw error;
    }

    if (isDevServer()) {
      console.error("[main-generation] fallback triggered", error);
      console.info("[main-generation] debugPrompt\n", promptPackage.debugPrompt);
    }

    const rendered =
      error instanceof ProviderRequestError && error.code === "TOKENPLAN_INVALID_API_KEY"
        ? await buildServerRenderedMainImages(request, localPlan, env)
        : await buildMainImagesWithFallback(request, localPlan, env);

    return mapMainGenerationResult({
      taskId,
      request,
      plan: localPlan,
      images: rendered.images,
      sourceType: rendered.sourceType,
      warningMessage: rendered.sourceType === "mock-fallback" ? rendered.warningMessage : normalizeWarning(error)
    });
  }
}

export async function orchestrateDetailGeneration(request: DetailGenerationRequest) {
  const env = getServerEnv();
  const taskId = createTaskId("detail");
  const promptPackage = buildDetailImagePrompt(request);
  const localPlan = buildLocalDetailPlan(request);

  if (!env.enableRealGeneration) {
    const rendered = await buildDetailImagesWithFallback(request, localPlan, env);
    return mapDetailGenerationResult({
      taskId,
      plan: localPlan,
      images: rendered.images,
      sourceType: rendered.sourceType,
      warningMessage: env.enableFallbackMock
        ? "当前配置已关闭实时生成，已返回基于上传图片渲染的预览结果。"
        : rendered.warningMessage
    });
  }

  try {
    assertRealGenerationEnv(env);
    const planner = new MiniMaxClient(new TokenPlanClient(env));
    const plan = await planner.createDetailGenerationPlan(promptPackage);
    const rendered = await buildDetailImagesWithFallback(request, plan, env);

    return mapDetailGenerationResult({
      taskId,
      plan,
      images: rendered.images,
      sourceType: rendered.sourceType,
      warningMessage: rendered.warningMessage
    });
  } catch (error) {
    if (!env.enableFallbackMock) {
      throw error;
    }

    if (isDevServer()) {
      console.error("[detail-generation] fallback triggered", error);
      console.info("[detail-generation] debugPrompt\n", promptPackage.debugPrompt);
    }

    const rendered =
      error instanceof ProviderRequestError && error.code === "TOKENPLAN_INVALID_API_KEY"
        ? await buildServerRenderedDetailImages(request, localPlan, env)
        : await buildDetailImagesWithFallback(request, localPlan, env);

    return mapDetailGenerationResult({
      taskId,
      plan: localPlan,
      images: rendered.images,
      sourceType: rendered.sourceType,
      warningMessage: rendered.sourceType === "mock-fallback" ? rendered.warningMessage : normalizeWarning(error)
    });
  }
}
