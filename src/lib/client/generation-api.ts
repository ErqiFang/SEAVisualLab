import {
  ApiErrorResponse,
  DetailAsset,
  DetailGenerationRequest,
  DetailGenerationResponse,
  DetailResultGroup,
  MainGenerationRequest,
  MainGenerationResponse,
  MainVisualGroup,
  UploadedAsset
} from "@/types/generation";

function buildMultipartBody(payload: Record<string, unknown>, uploadedAsset: UploadedAsset) {
  const formData = new FormData();
  const file = uploadedAsset.file;

  if (!file) {
    throw new Error("未找到上传文件，请重新选择商品图片。");
  }

  formData.append("image", file, uploadedAsset.name);
  formData.append("payload", JSON.stringify(payload));
  return formData;
}

async function postMultipart<TResponse>(url: string, payload: Record<string, unknown>, uploadedAsset: UploadedAsset): Promise<TResponse> {
  const response = await fetch(url, {
    method: "POST",
    body: buildMultipartBody(payload, uploadedAsset)
  });

  const json = (await response.json()) as TResponse | ApiErrorResponse;

  if (!response.ok) {
    const error = json as ApiErrorResponse;
    const message = error.details?.join("；") ?? error.message ?? "请求失败。";
    throw new Error(message);
  }

  return json as TResponse;
}

export async function requestMainGeneration(body: Omit<MainGenerationRequest, "image">, uploadedAsset: UploadedAsset) {
  return postMultipart<MainGenerationResponse>("/api/generate-main-images", body as Record<string, unknown>, uploadedAsset);
}

export async function requestDetailGeneration(body: Omit<DetailGenerationRequest, "image">, uploadedAsset: UploadedAsset) {
  return postMultipart<DetailGenerationResponse>("/api/generate-detail-images", body as Record<string, unknown>, uploadedAsset);
}

export async function requestRegenerateStyle(body: Omit<MainGenerationRequest, "image">, uploadedAsset: UploadedAsset) {
  return postMultipart<MainGenerationResponse>("/api/regenerate-style", body as Record<string, unknown>, uploadedAsset);
}

export async function requestRegenerateDetailGroup(body: Omit<DetailGenerationRequest, "image">, uploadedAsset: UploadedAsset) {
  return postMultipart<DetailGenerationResponse>("/api/regenerate-detail-group", body as Record<string, unknown>, uploadedAsset);
}

export function mapMainResponseToUi(response: MainGenerationResponse): MainVisualGroup[] {
  return response.styles.map((style) => ({
    styleId: style.styleId,
    styleName: style.styleName,
    description: style.styleDescription,
    sceneFit: style.sceneDescription,
    tags: style.tags,
    recommended: style.recommended,
    generationPrompt: style.generationPrompt,
    sourceType: style.sourceType,
    assets: [...style.mainImages, ...style.subImages].map((image) => ({
      id: image.imageId,
      kind: image.kind,
      title: image.title,
      caption: image.caption,
      src: image.imageUrl,
      sourceType: image.sourceType,
      generationPrompt: image.generationPrompt
    }))
  }));
}

export function mapDetailResponseToUi(response: DetailGenerationResponse): DetailResultGroup[] {
  return response.groups.map((group) => ({
    category: group.category,
    summary: group.summary,
    sourceType: group.sourceType,
    assets: group.items.map<DetailAsset>((item) => ({
      id: item.detailId,
      label: item.label,
      description: item.description,
      tags: [item.recommendedScene],
      type: item.label,
      sceneMode: item.recommendedScene,
      src: item.imageUrl,
      canRegenerate: item.canRegenerate ?? true,
      sourceType: item.sourceType,
      generationPrompt: item.generationPrompt
    }))
  }));
}
