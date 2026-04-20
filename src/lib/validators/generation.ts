import { DetailCategory, DetailGenerationRequest, MainGenerationRequest, UploadedImagePayload } from "@/types/generation";

const MAX_UPLOAD_SIZE_BYTES = 8 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type ValidationSuccess<T> = { success: true; data: T };
type ValidationFailure = { success: false; errors: string[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateImagePayload(value: unknown): ValidationSuccess<UploadedImagePayload> | ValidationFailure {
  if (!isRecord(value)) {
    return { success: false, errors: ["缺少商品图片信息。"] };
  }

  const image = value as Partial<UploadedImagePayload>;
  const errors: string[] = [];

  if (!isNonEmptyString(image.name)) errors.push("图片名称不能为空。");
  const mimeType = isNonEmptyString(image.mimeType) ? image.mimeType : null;

  if (!mimeType || !ACCEPTED_IMAGE_TYPES.has(mimeType)) {
    errors.push("仅支持 JPG、PNG、WebP 图片。");
  }
  if (typeof image.size !== "number" || image.size <= 0 || image.size > MAX_UPLOAD_SIZE_BYTES) {
    errors.push("图片大小需小于 8MB。");
  }
  const base64 = isNonEmptyString(image.base64) ? image.base64 : null;

  if (!base64 || !base64.startsWith("data:image/")) {
    errors.push("图片需以 base64 data URL 形式提交。");
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      name: image.name!,
      mimeType: image.mimeType!,
      size: image.size!,
      base64: image.base64!
    }
  };
}

export function validateMainGenerationRequest(payload: unknown): ValidationSuccess<MainGenerationRequest> | ValidationFailure {
  if (!isRecord(payload)) {
    return { success: false, errors: ["请求体格式无效。"] };
  }

  const imageValidation = validateImagePayload(payload.image);
  const form = payload.form;
  const errors = imageValidation.success ? [] : [...imageValidation.errors];
  const styleTemplateIds = isRecord(form) && Array.isArray(form.styleTemplateIds) ? form.styleTemplateIds.map(String) : [];

  if (!isRecord(form)) {
    errors.push("主图表单数据缺失。");
  } else {
    if (!isNonEmptyString(form.name)) errors.push("请填写商品名称。");
    if (!isNonEmptyString(form.category)) errors.push("请填写商品类目。");
    if (!isNonEmptyString(form.description)) errors.push("请填写商品描述。");
    if (!isNonEmptyString(form.materialDescription)) errors.push("请填写材质描述。");
    if (!isNonEmptyString(form.colorInfo)) errors.push("请填写颜色信息。");
    if (!isNonEmptyString(form.styleKeywords)) errors.push("请填写风格关键词。");
    if (!isNonEmptyString(form.scenario)) errors.push("请填写适用场景。");
    if (!Array.isArray(form.styleTemplateIds) || form.styleTemplateIds.length === 0) {
      errors.push("请至少选择一个风格模板。");
    }
    if (typeof form.quantity !== "number" || form.quantity < 1 || form.quantity > 4) {
      errors.push("生成数量需在 1 到 4 之间。");
    }
  }

  if (errors.length > 0 || !imageValidation.success || !isRecord(form)) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      image: imageValidation.data,
      form: {
        name: String(form.name),
        category: String(form.category),
        description: String(form.description),
        material: String(form.material ?? ""),
        materialDescription: String(form.materialDescription),
        color: String(form.color ?? form.colorInfo),
        colorInfo: String(form.colorInfo),
        styleKeywords: String(form.styleKeywords),
        scenario: String(form.scenario),
        platform: form.platform as MainGenerationRequest["form"]["platform"],
        country: form.country as MainGenerationRequest["form"]["country"],
        quantity: Number(form.quantity),
        ratio: form.ratio as MainGenerationRequest["form"]["ratio"],
        outputType: form.outputType as MainGenerationRequest["form"]["outputType"],
        styleTemplateIds
      },
      regenerateStyleId: payload.regenerateStyleId ? String(payload.regenerateStyleId) : null
    }
  };
}

export function validateDetailGenerationRequest(payload: unknown): ValidationSuccess<DetailGenerationRequest> | ValidationFailure {
  if (!isRecord(payload)) {
    return { success: false, errors: ["请求体格式无效。"] };
  }

  const imageValidation = validateImagePayload(payload.image);
  const form = payload.form;
  const errors = imageValidation.success ? [] : [...imageValidation.errors];
  const focusPoints = isRecord(form) && Array.isArray(form.focusPoints) ? form.focusPoints.map(String) : [];
  const displayScenes = isRecord(form) && Array.isArray(form.displayScenes) ? form.displayScenes.map(String) : [];

  if (!isRecord(form)) {
    errors.push("细节图表单数据缺失。");
  } else {
    if (!isNonEmptyString(form.name)) errors.push("请填写商品名称。");
    if (!isNonEmptyString(form.category)) errors.push("请填写商品类目。");
    if (!isNonEmptyString(form.materialDetail)) errors.push("请填写材质细节。");
    if (!isNonEmptyString(form.fabricKeywords)) errors.push("请填写面料关键词。");
    if (!isNonEmptyString(form.craftKeywords)) errors.push("请填写工艺关键词。");
    if (!isNonEmptyString(form.silhouette)) errors.push("请填写版型描述。");
    if (!Array.isArray(form.focusPoints) || form.focusPoints.length === 0) {
      errors.push("请至少选择一个重点细节。");
    }
    if (!Array.isArray(form.displayScenes) || form.displayScenes.length === 0) {
      errors.push("请至少选择一个展示场景。");
    }
  }

  if (errors.length > 0 || !imageValidation.success || !isRecord(form)) {
    return { success: false, errors };
  }

  const regenerateCategory =
    typeof payload.regenerateCategory === "string" ? (payload.regenerateCategory as DetailCategory) : null;

  return {
    success: true,
    data: {
      image: imageValidation.data,
      form: {
        name: String(form.name),
        category: String(form.category),
        materialDetail: String(form.materialDetail),
        fabricKeywords: String(form.fabricKeywords),
        craftKeywords: String(form.craftKeywords),
        silhouette: String(form.silhouette),
        focusPoints,
        displayScenes
      },
      regenerateCategory
    }
  };
}

export function validateClientImage(file: File) {
  if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
    return "仅支持 JPG、PNG、WebP 图片。";
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return "图片大小不能超过 8MB。";
  }

  return null;
}

export function validateMainGenerationForm(
  payload: unknown
): ValidationSuccess<Omit<MainGenerationRequest, "image"> & { image?: UploadedImagePayload }> | ValidationFailure {
  if (!isRecord(payload)) {
    return { success: false, errors: ["请求体格式无效。"] };
  }

  const form = payload.form;
  const errors: string[] = [];
  const styleTemplateIds = isRecord(form) && Array.isArray(form.styleTemplateIds) ? form.styleTemplateIds.map(String) : [];

  if (!isRecord(form)) {
    errors.push("主图表单数据缺失。");
  } else {
    if (!isNonEmptyString(form.name)) errors.push("请填写商品名称。");
    if (!isNonEmptyString(form.category)) errors.push("请填写商品类目。");
    if (!isNonEmptyString(form.description)) errors.push("请填写商品描述。");
    if (!isNonEmptyString(form.materialDescription)) errors.push("请填写材质描述。");
    if (!isNonEmptyString(form.colorInfo)) errors.push("请填写颜色信息。");
    if (!isNonEmptyString(form.styleKeywords)) errors.push("请填写风格关键词。");
    if (!isNonEmptyString(form.scenario)) errors.push("请填写适用场景。");
    if (styleTemplateIds.length === 0) errors.push("请至少选择一个风格模板。");
    if (typeof form.quantity !== "number" || form.quantity < 1 || form.quantity > 4) {
      errors.push("生成数量需在 1 到 4 之间。");
    }
  }

  if (errors.length > 0 || !isRecord(form)) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      form: {
        name: String(form.name),
        category: String(form.category),
        description: String(form.description),
        material: String(form.material ?? ""),
        materialDescription: String(form.materialDescription),
        color: String(form.color ?? form.colorInfo),
        colorInfo: String(form.colorInfo),
        styleKeywords: String(form.styleKeywords),
        scenario: String(form.scenario),
        platform: form.platform as MainGenerationRequest["form"]["platform"],
        country: form.country as MainGenerationRequest["form"]["country"],
        quantity: Number(form.quantity),
        ratio: form.ratio as MainGenerationRequest["form"]["ratio"],
        outputType: form.outputType as MainGenerationRequest["form"]["outputType"],
        styleTemplateIds
      },
      regenerateStyleId: payload.regenerateStyleId ? String(payload.regenerateStyleId) : null
    }
  };
}

export function validateDetailGenerationForm(
  payload: unknown
): ValidationSuccess<Omit<DetailGenerationRequest, "image"> & { image?: UploadedImagePayload }> | ValidationFailure {
  if (!isRecord(payload)) {
    return { success: false, errors: ["请求体格式无效。"] };
  }

  const form = payload.form;
  const errors: string[] = [];
  const focusPoints = isRecord(form) && Array.isArray(form.focusPoints) ? form.focusPoints.map(String) : [];
  const displayScenes = isRecord(form) && Array.isArray(form.displayScenes) ? form.displayScenes.map(String) : [];

  if (!isRecord(form)) {
    errors.push("细节图表单数据缺失。");
  } else {
    if (!isNonEmptyString(form.name)) errors.push("请填写商品名称。");
    if (!isNonEmptyString(form.category)) errors.push("请填写商品类目。");
    if (!isNonEmptyString(form.materialDetail)) errors.push("请填写材质细节。");
    if (!isNonEmptyString(form.fabricKeywords)) errors.push("请填写面料关键词。");
    if (!isNonEmptyString(form.craftKeywords)) errors.push("请填写工艺关键词。");
    if (!isNonEmptyString(form.silhouette)) errors.push("请填写版型描述。");
    if (focusPoints.length === 0) errors.push("请至少选择一个重点细节。");
    if (displayScenes.length === 0) errors.push("请至少选择一个展示场景。");
  }

  if (errors.length > 0 || !isRecord(form)) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      form: {
        name: String(form.name),
        category: String(form.category),
        materialDetail: String(form.materialDetail),
        fabricKeywords: String(form.fabricKeywords),
        craftKeywords: String(form.craftKeywords),
        silhouette: String(form.silhouette),
        focusPoints,
        displayScenes
      },
      regenerateCategory: typeof payload.regenerateCategory === "string" ? (payload.regenerateCategory as DetailCategory) : null
    }
  };
}
