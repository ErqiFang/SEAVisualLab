import { DetailGeneratedImage, DetailGenerationPlan, DetailGenerationResponse, ResultSourceType } from "@/types/generation";

export function mapDetailGenerationResult(params: {
  taskId: string;
  plan: DetailGenerationPlan;
  images: DetailGeneratedImage[];
  sourceType: ResultSourceType;
  warningMessage?: string;
}): DetailGenerationResponse {
  return {
    taskId: params.taskId,
    status: params.sourceType === "real" ? "success" : "partial_success",
    productSummary: params.plan.productSummary,
    sourceType: params.sourceType,
    warningMessage: params.warningMessage,
    progressLabel: `已完成 ${params.plan.groups.length} 组细节结果整理`,
    groups: params.plan.groups.map((group) => ({
      category: group.category,
      summary: group.summary,
      items: params.images.filter((image) => image.category === group.category),
      sourceType: params.sourceType,
      canRegenerate: true
    })),
    debugPrompt: params.plan.plannerPrompt
  };
}
