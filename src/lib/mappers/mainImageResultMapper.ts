import { getStyleMetadata } from "@/lib/mock/fallbackResults";
import {
  MainGeneratedImage,
  MainGenerationPlan,
  MainGenerationRequest,
  MainGenerationResponse,
  MainStyleResult,
  ResultSourceType
} from "@/types/generation";

export function mapMainGenerationResult(params: {
  taskId: string;
  request: MainGenerationRequest;
  plan: MainGenerationPlan;
  images: MainGeneratedImage[];
  sourceType: ResultSourceType;
  warningMessage?: string;
}): MainGenerationResponse {
  const styles: MainStyleResult[] = params.plan.styles.map((style) => {
    const metadata = getStyleMetadata(style.styleId);
    const styleImages = params.images.filter((image) => image.styleId === style.styleId);

    return {
      styleId: style.styleId,
      styleName: style.styleName,
      styleDescription: style.styleDescription,
      sceneDescription: style.sceneDescription,
      tags: metadata?.tags ?? style.tags,
      recommended: Boolean(metadata?.recommended ?? style.recommended),
      mainImages: styleImages.filter((image) => image.kind === "主图"),
      subImages: styleImages.filter((image) => image.kind === "辅图"),
      generationPrompt: style.generationPrompt,
      sourceType: params.sourceType,
      canRegenerate: true
    };
  });

  return {
    taskId: params.taskId,
    status: params.sourceType === "real" ? "success" : "partial_success",
    productSummary: params.plan.productSummary,
    selectedPlatform: params.request.form.platform,
    selectedCountry: params.request.form.country,
    sourceType: params.sourceType,
    warningMessage: params.warningMessage,
    progressLabel: `已完成 ${styles.length} 组主图 / 辅图结果整理`,
    styles,
    debugPrompt: params.plan.plannerPrompt
  };
}
