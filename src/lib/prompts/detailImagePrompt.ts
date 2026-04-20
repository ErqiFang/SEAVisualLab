import { DetailGenerationPlan, DetailGenerationRequest, PlannedDetailItem } from "@/types/generation";

const detailBlueprints: Array<{
  category: "结构细节" | "材质细节" | "上身细节";
  items: Array<{ detailId: string; label: string; description: string; recommendedScene: string }>;
}> = [
  {
    category: "结构细节",
    items: [
      { detailId: "front-view", label: "正面图", description: "展示整体版型与长度。", recommendedScene: "白底细节图" },
      { detailId: "back-view", label: "背面图", description: "展示后腰、后中线、开叉等设计。", recommendedScene: "放大特写图" },
      { detailId: "waist-detail", label: "腰部细节", description: "展示高腰设计、腰头结构。", recommendedScene: "放大特写图" }
    ]
  },
  {
    category: "材质细节",
    items: [
      { detailId: "fabric-detail", label: "面料细节", description: "展示纹理、厚薄感、垂感。", recommendedScene: "放大特写图" },
      { detailId: "hem-detail", label: "裙摆细节", description: "展示走线与下摆形态。", recommendedScene: "细节拼图组合图" }
    ]
  },
  {
    category: "上身细节",
    items: [
      { detailId: "side-view", label: "侧面图", description: "展示垂坠感和修身线条。", recommendedScene: "模特上身局部图" },
      { detailId: "wearing-closeup", label: "上身局部细节", description: "展示贴合度与通勤质感。", recommendedScene: "模特上身局部图" }
    ]
  }
];

export function buildLocalDetailPlan(input: DetailGenerationRequest): DetailGenerationPlan {
  const focusSet = new Set(input.form.focusPoints);

  return {
    productSummary: `${input.form.name} 的细节图规划，重点突出版型、面料和上身质感。`,
    plannerPrompt: buildDetailImagePrompt(input).debugPrompt,
    groups: detailBlueprints.map((group) => ({
      category: group.category,
      summary:
        group.category === "结构细节"
          ? "展示正面、背面和腰部结构，帮助用户理解版型与做工。"
          : group.category === "材质细节"
            ? "通过面料放大和裙摆走线，表达纹理、垂感和工艺完成度。"
            : "结合上身局部和侧面图，说明贴合度、修身线条和真实穿着质感。",
      details: group.items
        .filter((item) => focusSet.size === 0 || focusSet.has(item.label))
        .map<PlannedDetailItem>((item) => ({
          detailId: item.detailId,
          category: group.category,
          label: item.label,
          description: item.description,
          recommendedScene: item.recommendedScene,
          generationPrompt: [
            `商品：${input.form.name}`,
            `细节：${item.label}`,
            `版型：${input.form.silhouette}`,
            `材质：${input.form.materialDetail}`,
            `工艺关键词：${input.form.craftKeywords}`
          ].join(" | ")
        }))
    }))
  };
}

export function buildDetailImagePrompt(input: DetailGenerationRequest) {
  const debugPrompt = [
    "你是一名商品细节图策划模型，负责输出电商详情页细节图方案。",
    `商品名称：${input.form.name}`,
    `商品类目：${input.form.category}`,
    `材质细节描述：${input.form.materialDetail}`,
    `面料关键词：${input.form.fabricKeywords}`,
    `工艺关键词：${input.form.craftKeywords}`,
    `版型描述：${input.form.silhouette}`,
    `希望重点展示的细节：${input.form.focusPoints.join("、")}`,
    `细节展示场景：${input.form.displayScenes.join("、")}`,
    "规则：保持商品核心特征一致，不改变基本款式，不过度夸张变形，不过度暴露，重点突出真实材质、真实结构和电商可用性。",
    "OL 半裙默认逻辑：正面展示整体版型与长度；背面展示后腰、后中线和开叉；侧面展示垂坠感和修身线条；腰部展示高腰设计和腰头结构；面料展示纹理、厚薄感和垂感；裙摆展示走线与下摆形态；上身局部展示贴合度与通勤质感。",
    "输出要求：返回结构化 JSON，包括 productSummary、groups，每组包含 category、summary、details，每个 detail 包含 detailId、label、description、recommendedScene、generationPrompt。"
  ].join("\n");

  return {
    systemPrompt: "You are a senior ecommerce detail image planning model. Return JSON only.",
    userPrompt: debugPrompt,
    debugPrompt
  };
}
