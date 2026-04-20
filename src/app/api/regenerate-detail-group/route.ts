import { NextResponse } from "next/server";
import { orchestrateDetailGeneration } from "@/lib/services/generationOrchestrator";
import { parseUploadedImage, UploadValidationError } from "@/lib/services/upload/imageUploadService";
import { parseJsonField } from "@/lib/utils/request-formdata";
import { validateDetailGenerationForm } from "@/lib/validators/generation";
import { ApiErrorResponse } from "@/types/generation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const payload = await parseJsonField<Record<string, unknown>>(formData, "payload");
    const validation = validateDetailGenerationForm(payload);

    if (!validation.success || !validation.data.regenerateCategory) {
      return NextResponse.json<ApiErrorResponse>(
        {
          status: "error",
          code: "VALIDATION_ERROR",
          message: "细节分组重生成参数无效。",
          details: validation.success ? ["缺少需要重生成的细节分类。"] : validation.errors
        },
        { status: 400 }
      );
    }

    const image = await parseUploadedImage(formData.get("image") as File | null, new URL(request.url).origin);
    const result = await orchestrateDetailGeneration({
      ...validation.data,
      image
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return NextResponse.json<ApiErrorResponse>(
        {
          status: "error",
          code: error.code,
          message: error.message
        },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiErrorResponse>(
      {
        status: "error",
        code: "REGENERATE_DETAIL_GROUP_ERROR",
        message: error instanceof Error ? error.message : "细节分组重生成失败。"
      },
      { status: 500 }
    );
  }
}
