import { styleTemplates } from "@/mock/catalog";
import { detailImageUrlMap, styleImageUrlMap } from "@/mock/media";
import {
  DetailGeneratedImage,
  DetailGenerationPlan,
  DetailGenerationRequest,
  MainGeneratedImage,
  MainGenerationPlan,
  MainGenerationRequest
} from "@/types/generation";

export function createFallbackMainImages(plan: MainGenerationPlan, request: MainGenerationRequest): MainGeneratedImage[] {
  return plan.styles.flatMap((style) => {
    const styleAssets = styleImageUrlMap[style.styleId] ?? [];
    const outputType = request.form.outputType;
    const includeMain = outputType !== "辅图";
    const includeSub = outputType !== "主图";

    const items: MainGeneratedImage[] = [];

    if (includeMain) {
      items.push({
        imageId: `${style.styleId}-main-1`,
        styleId: style.styleId,
        kind: "主图",
        title: `${style.styleName} / 主图`,
        caption: `${request.form.name} · ${request.form.country} · ${request.form.platform}`,
        imageUrl: styleAssets[0] ?? "",
        generationPrompt: style.generationPrompt,
        sourceType: "mock-fallback",
        canRegenerate: true,
        downloadUrl: styleAssets[0] ?? ""
      });
    }

    if (includeSub) {
      const subCount = Math.max(1, Math.min(request.form.quantity, 3));
      for (let index = 0; index < subCount; index += 1) {
        items.push({
          imageId: `${style.styleId}-sub-${index + 1}`,
          styleId: style.styleId,
          kind: "辅图",
          title: `${style.styleName} / 辅图 ${index + 1}`,
          caption: `${style.tags[0] ?? style.styleName} · ${style.sceneDescription}`,
          imageUrl: styleAssets[(index + 1) % styleAssets.length] ?? styleAssets[0] ?? "",
          generationPrompt: style.generationPrompt,
          sourceType: "mock-fallback",
          canRegenerate: true,
          downloadUrl: styleAssets[(index + 1) % styleAssets.length] ?? styleAssets[0] ?? ""
        });
      }
    }

    return items;
  });
}

const detailUrlByLabel: Record<string, string> = {
  正面图: detailImageUrlMap.structure.front,
  背面图: detailImageUrlMap.structure.back,
  腰部细节: detailImageUrlMap.structure.waist,
  面料细节: detailImageUrlMap.material.fabric,
  裙摆细节: detailImageUrlMap.material.hem,
  侧面图: detailImageUrlMap.wearing.side,
  "上身局部细节": detailImageUrlMap.wearing.closeup
};

export function createFallbackDetailImages(plan: DetailGenerationPlan, _request: DetailGenerationRequest): DetailGeneratedImage[] {
  void _request;
  return plan.groups.flatMap((group) =>
    group.details.map((detail) => ({
      detailId: detail.detailId,
      category: group.category,
      label: detail.label,
      description: detail.description,
      imageUrl: detailUrlByLabel[detail.label] ?? detailImageUrlMap.material.fabric,
      recommendedScene: detail.recommendedScene,
      generationPrompt: detail.generationPrompt,
      sourceType: "mock-fallback" as const,
      canRegenerate: true,
      downloadUrl: detailUrlByLabel[detail.label] ?? detailImageUrlMap.material.fabric
    }))
  );
}

export function getStyleMetadata(styleId: string) {
  return styleTemplates.find((item) => item.id === styleId);
}
