import { Country, DetailGeneratorInput, MainGeneratorInput, Platform, StyleTemplate } from "@/types/generation";

export const platforms: Platform[] = ["Shopee", "Lazada", "TikTok Shop"];
export const countries: Country[] = ["泰国", "印尼", "菲律宾", "越南", "马来西亚"];
export const aspectRatios = ["1:1", "4:5", "16:9"] as const;
export const outputTypes = ["主图", "辅图", "主图 + 辅图"] as const;

export const styleTemplates: StyleTemplate[] = [
  {
    id: "studio-model-full",
    name: "【专业棚拍】干净白底/浅色背景",
    description: "突出商品本身与版型信息，适合品牌化上新和专业感展示。",
    scene: "适合通勤女装、标准化上新、详情页首屏展示",
    tags: ["官方推荐", "点击率高", "版型清晰"],
    recommended: true
  },
  {
    id: "street-model-full",
    name: "【生活场景】真实街拍/咖啡店背景",
    description: "用更贴近生活的场景强化代入感，适合展示自然穿搭氛围。",
    scene: "适合打造生活化内容、社媒投放和 TikTok Shop 场景",
    tags: ["氛围感强", "适合 TikTok", "真实上身"]
  },
  {
    id: "model-half",
    name: "模特半身展示",
    description: "聚焦腰部设计、面料质感和剪裁线条，更适合细节表达。",
    scene: "适合突出腰头、垂感和包臀/直筒版型对比",
    tags: ["腰部设计", "细节导向", "质感展示"]
  },
  {
    id: "flatlay-plus-model",
    name: "左侧拼图平铺 + 右侧模特上身图",
    description: "在一张拼图里同时呈现多色选择与上身效果。",
    scene: "适合 SKU 较多的女装、快速解释颜色差异",
    tags: ["颜色展示", "拼图表达", "SKU 友好"]
  },
  {
    id: "clean-white-bg",
    name: "白底电商图",
    description: "突出商品主体和平台审稿、上架时的清晰度。",
    scene: "适合 Shopee/Lazada 标准主图、强主体呈现",
    tags: ["白底清晰", "上架友好", "主体突出"]
  },
  {
    id: "collage-hero",
    name: "拼图型主图",
    description: "通过模块化信息区展示卖点、局部和上身效果。",
    scene: "适合需要在主图阶段传达更多信息的新品推广",
    tags: ["卖点组合", "信息量高", "转化导向"]
  },
  {
    id: "lifestyle-secondary",
    name: "生活化场景辅图",
    description: "补充真实使用情境，增强代入感和搭配想象。",
    scene: "适合详情页中段，帮助用户理解通勤和日常搭配",
    tags: ["生活化", "搭配感", "氛围图"]
  },
  {
    id: "selling-point-secondary",
    name: "卖点说明型辅图",
    description: "用图文结构说明高腰、垂感、包臀/直筒和通勤百搭等特征。",
    scene: "适合详情页卖点拆解、广告落地页二屏信息补充",
    tags: ["卖点解释", "细节标注", "电商转化"],
    recommended: true
  }
];

export const detailFocusOptions = [
  "正面图",
  "背面图",
  "侧面图",
  "腰部细节",
  "面料细节",
  "图案细节",
  "裙摆细节",
  "走线细节",
  "拉链 / 纽扣 / 口袋等结构细节",
  "上身局部细节"
];

export const detailSceneModes = ["白底细节图", "放大特写图", "模特上身局部图", "场景化细节图", "细节拼图组合图"];

export const defaultMainForm: MainGeneratorInput = {
  name: "OL 高腰垂感半裙",
  category: "女装 / 半裙",
  description: "适合东南亚通勤穿搭的中长款半裙，强调高腰修身和垂感线条。",
  material: "聚酯纤维混纺",
  materialDescription: "面料挺括但有垂感，适合办公室与日常通勤穿着。",
  color: "黑色、浅卡其、深灰",
  colorInfo: "主推黑色，辅推浅卡其和深灰，强化基础百搭色系。",
  styleKeywords: "通勤、轻正式、利落线条、东南亚城市职场女性",
  scenario: "办公室通勤、城市街景、门店上新",
  platform: "Shopee",
  country: "泰国",
  quantity: 3,
  ratio: "4:5",
  outputType: "主图 + 辅图",
  styleTemplateIds: [
    "studio-model-full",
    "street-model-full",
    "model-half",
    "flatlay-plus-model",
    "clean-white-bg",
    "selling-point-secondary"
  ]
};

export const defaultDetailForm: DetailGeneratorInput = {
  name: "OL 高腰垂感半裙",
  category: "女装 / 半裙",
  materialDetail: "细纹理混纺面料，轻薄但不透，带自然垂感。",
  fabricKeywords: "垂感、细纹理、轻薄不透、通勤友好",
  craftKeywords: "高腰腰头、后开叉、顺滑走线、隐形拉链",
  silhouette: "高腰直筒偏包臀，中长长度，适合办公室与日常通勤。",
  focusPoints: ["正面图", "背面图", "侧面图", "腰部细节", "面料细节", "裙摆细节", "上身局部细节"],
  displayScenes: ["白底细节图", "放大特写图", "模特上身局部图", "细节拼图组合图"]
};
