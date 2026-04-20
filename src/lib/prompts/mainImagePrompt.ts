import { styleTemplates } from "@/mock/catalog";
import { MainGenerationRequest, MainGenerationPlan, PlannedMainStyle } from "@/types/generation";

const countryPreferences: Record<string, string> = {
  泰国: "偏好清爽、通勤感强、主体明确的电商主图，模特姿态自然，画面明亮但不过度花哨。",
  印尼: "偏好商业感较强、服装轮廓真实、背景不过度抢主体的商品图片，适合移动端快速识别。",
  菲律宾: "偏好生活化但清楚易懂的商品展示，强调上身效果和真实穿搭氛围。",
  越南: "偏好利落、现代、轻正式的视觉表达，商品主体清晰，适合电商点击。",
  马来西亚: "偏好兼顾清晰度与品质感的商品图，商业氛围明确，构图稳定。"
};

function getStyleInstruction(styleId: string) {
  switch (styleId) {
    case "clean-white-bg":
      return "白底电商图：干净背景，商品主体占比高，轮廓和版型清晰，适合平台主图。";
    case "studio-model-full":
      return "真人工作室型：模特全身展示，工作室干净背景，强调通勤感、版型和正式感。";
    case "street-model-full":
      return "街景生活型：模特全身展示，背景为克制的城市街景，突出真实穿搭氛围。";
    case "flatlay-plus-model":
      return "拼图对比型：左侧展示 SKU 不同颜色平铺图，右侧展示模特上身图，强调电商对比展示。";
    case "model-half":
      return "模特半身展示型：聚焦腰部设计、面料质感与剪裁线条，构图更靠近商品细节。";
    case "selling-point-secondary":
      return "卖点说明型辅图：用图文信息结构说明高腰、垂感、包臀/直筒、通勤百搭等卖点。";
    case "lifestyle-secondary":
      return "生活化场景辅图：补充日常通勤、办公室或城市生活中的搭配场景，增强代入感。";
    case "collage-hero":
      return "拼图型主图：同屏展示商品主体、局部和卖点模块，保持电商信息表达清晰。";
    default:
      return "保持商品主体清晰、模特姿态自然、商业感明确，适合电商点击。";
  }
}

export function buildLocalMainPlan(input: MainGenerationRequest): MainGenerationPlan {
  const selectedTemplates = styleTemplates.filter((template) =>
    input.regenerateStyleId ? template.id === input.regenerateStyleId : input.form.styleTemplateIds.includes(template.id)
  );
  const templates = selectedTemplates.length > 0 ? selectedTemplates : styleTemplates.slice(0, 4);

  const styles: PlannedMainStyle[] = templates.map((template) => ({
    styleId: template.id,
    styleName: template.name,
    styleDescription: template.description,
    sceneDescription: template.scene,
    tags: template.tags,
    recommended: Boolean(template.recommended),
    generationPrompt: [
      `商品：${input.form.name}`,
      `类目：${input.form.category}`,
      `风格：${template.name}`,
      `平台：${input.form.platform}`,
      `国家：${input.form.country}`,
      `场景：${input.form.scenario}`,
      getStyleInstruction(template.id)
    ].join(" | ")
  }));

  return {
    productSummary: `${input.form.name}，${input.form.category}，主打${input.form.colorInfo}，面向 ${input.form.country} ${input.form.platform} 场景。`,
    plannerPrompt: buildMainImagePrompt(input).debugPrompt,
    styles
  };
}

export function buildMainImagePrompt(input: MainGenerationRequest) {
  const countryPreference = countryPreferences[input.form.country] ?? countryPreferences.泰国;
  const selectedStyleNames = styleTemplates
    .filter((style) => input.form.styleTemplateIds.includes(style.id))
    .map((style) => `${style.name}：${getStyleInstruction(style.id)}`)
    .join("\n");

  const debugPrompt = [
    "你是一名面向东南亚跨境电商卖家的商品图片策划模型。",
    "目标：先理解商品，再输出结构化主图/辅图生成规划，用于后续图像生成服务。",
    `商品名称：${input.form.name}`,
    `商品类目：${input.form.category}`,
    `商品描述：${input.form.description}`,
    `材质描述：${input.form.materialDescription}`,
    `颜色信息：${input.form.colorInfo}`,
    `风格关键词：${input.form.styleKeywords}`,
    `适用场景：${input.form.scenario}`,
    `目标平台：${input.form.platform}`,
    `目标国家：${input.form.country}`,
    `图片比例：${input.form.ratio}`,
    `输出类型：${input.form.outputType}`,
    `生成数量：${input.form.quantity}`,
    `风格模板：\n${selectedStyleNames}`,
    `东南亚市场偏好：${countryPreference}`,
    "通用约束：商品主体清晰、模特姿态自然、商业感明确、适合电商点击；不要过度艺术化、背景不要喧宾夺主、服装轮廓与版型真实。",
    "通勤女装 / OL 半裙额外约束：强调利落、修身、轻正式、适合办公室场景，不改变服装基本款式，不过度夸张变形，不过度暴露。",
    "输出要求：返回结构化 JSON，包括 productSummary 和 styles，每个 style 都要包含 styleId、styleName、styleDescription、sceneDescription、tags、recommended、generationPrompt。"
  ].join("\n");

  return {
    systemPrompt: "You are a senior ecommerce image planning model. Return JSON only.",
    userPrompt: debugPrompt,
    debugPrompt
  };
}
