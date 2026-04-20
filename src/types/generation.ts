import type { StaticImageData } from "next/image";

export type Platform = "Shopee" | "Lazada" | "TikTok Shop";
export type Country = "泰国" | "印尼" | "菲律宾" | "越南" | "马来西亚";
export type AspectRatio = "1:1" | "4:5" | "16:9";
export type OutputType = "主图" | "辅图" | "主图 + 辅图";
export type GenerationStatus = "idle" | "validating" | "uploading" | "submitting" | "generating" | "success" | "partial_success" | "error";
export type DetailCategory = "结构细节" | "材质细节" | "上身细节";
export type DetailViewMode = "grid" | "list";
export type ImageSource = string | StaticImageData;
export type ResultSourceType = "real" | "server-rendered" | "mock-fallback";
export type TaskResultStatus = "success" | "partial_success";

export interface ProductInfo {
  name: string;
  category: string;
  description: string;
  material: string;
  color: string;
  scenario: string;
  platform: Platform;
  country: Country;
}

export interface StyleTemplate {
  id: string;
  name: string;
  description: string;
  scene: string;
  tags: string[];
  recommended?: boolean;
}

export interface MainGeneratorInput extends ProductInfo {
  styleKeywords: string;
  materialDescription: string;
  colorInfo: string;
  quantity: number;
  ratio: AspectRatio;
  outputType: OutputType;
  styleTemplateIds: string[];
}

export interface DetailGeneratorInput {
  name: string;
  category: string;
  materialDetail: string;
  fabricKeywords: string;
  craftKeywords: string;
  silhouette: string;
  focusPoints: string[];
  displayScenes: string[];
}

export interface UploadedImagePayload {
  name: string;
  mimeType: string;
  size: number;
  base64: string;
  publicUrl?: string;
}

export interface UploadedAsset extends UploadedImagePayload {
  previewUrl: string;
  file?: File;
}

export interface GeneratedAsset {
  id: string;
  kind: "主图" | "辅图" | "细节图";
  title: string;
  caption: string;
  src: ImageSource;
  sourceType: ResultSourceType;
  generationPrompt?: string;
}

export interface MainVisualGroup {
  styleId: string;
  styleName: string;
  description: string;
  sceneFit: string;
  tags: string[];
  recommended: boolean;
  assets: GeneratedAsset[];
  generationPrompt?: string;
  sourceType: ResultSourceType;
}

export interface DetailAsset {
  id: string;
  label: string;
  description: string;
  tags: string[];
  type: string;
  sceneMode: string;
  src: ImageSource;
  canRegenerate: boolean;
  sourceType: ResultSourceType;
  generationPrompt?: string;
}

export interface DetailResultGroup {
  category: DetailCategory;
  summary: string;
  assets: DetailAsset[];
  sourceType: ResultSourceType;
}

export interface MainGenerationRequest {
  image: UploadedImagePayload;
  form: MainGeneratorInput;
  regenerateStyleId?: string | null;
}

export interface DetailGenerationRequest {
  image: UploadedImagePayload;
  form: DetailGeneratorInput;
  regenerateCategory?: DetailCategory | null;
}

export interface PlannedMainStyle {
  styleId: string;
  styleName: string;
  styleDescription: string;
  sceneDescription: string;
  tags: string[];
  recommended: boolean;
  generationPrompt: string;
}

export interface MainGenerationPlan {
  productSummary: string;
  plannerPrompt: string;
  styles: PlannedMainStyle[];
}

export interface PlannedDetailItem {
  detailId: string;
  category: DetailCategory;
  label: string;
  description: string;
  recommendedScene: string;
  generationPrompt: string;
}

export interface DetailGenerationPlan {
  productSummary: string;
  plannerPrompt: string;
  groups: Array<{
    category: DetailCategory;
    summary: string;
    details: PlannedDetailItem[];
  }>;
}

export interface MainGeneratedImage {
  imageId: string;
  styleId: string;
  kind: "主图" | "辅图";
  title: string;
  caption: string;
  imageUrl: string;
  generationPrompt: string;
  sourceType: ResultSourceType;
  canRegenerate?: boolean;
  downloadUrl?: string;
}

export interface DetailGeneratedImage {
  detailId: string;
  category: DetailCategory;
  label: string;
  description: string;
  imageUrl: string;
  recommendedScene: string;
  generationPrompt: string;
  sourceType: ResultSourceType;
  canRegenerate?: boolean;
  downloadUrl?: string;
}

export interface MainStyleResult {
  styleId: string;
  styleName: string;
  styleDescription: string;
  sceneDescription: string;
  tags: string[];
  recommended: boolean;
  mainImages: MainGeneratedImage[];
  subImages: MainGeneratedImage[];
  generationPrompt: string;
  sourceType: ResultSourceType;
  canRegenerate: boolean;
}

export interface DetailGroupResult {
  category: DetailCategory;
  summary: string;
  items: DetailGeneratedImage[];
  sourceType: ResultSourceType;
  canRegenerate: boolean;
}

export interface MainGenerationResponse {
  taskId: string;
  status: TaskResultStatus;
  productSummary: string;
  selectedPlatform: Platform;
  selectedCountry: Country;
  sourceType: ResultSourceType;
  warningMessage?: string;
  progressLabel?: string;
  styles: MainStyleResult[];
  debugPrompt?: string;
}

export interface DetailGenerationResponse {
  taskId: string;
  status: TaskResultStatus;
  productSummary: string;
  sourceType: ResultSourceType;
  warningMessage?: string;
  progressLabel?: string;
  groups: DetailGroupResult[];
  debugPrompt?: string;
}

export interface ApiErrorResponse {
  status: "error";
  message: string;
  code: string;
  details?: string[];
}
