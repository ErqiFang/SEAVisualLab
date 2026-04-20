import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getServerEnv } from "@/lib/env";
import { UploadedImagePayload } from "@/types/generation";

const MAX_UPLOAD_SIZE_BYTES = 8 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

export class UploadValidationError extends Error {
  constructor(message: string, public readonly code = "UPLOAD_VALIDATION_ERROR") {
    super(message);
    this.name = "UploadValidationError";
  }
}

function bufferToDataUrl(buffer: Buffer, mimeType: string) {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

async function persistUpload(buffer: Buffer, mimeType: string, requestOrigin?: string) {
  const extension = MIME_EXTENSION_MAP[mimeType];

  if (!extension) {
    throw new UploadValidationError("Unsupported image type for persistence.");
  }

  const directoryName = new Date().toISOString().slice(0, 10);
  const filename = `${randomUUID()}.${extension}`;
  const relativeDirectory = path.join("runtime-uploads", directoryName);
  const absoluteDirectory = path.join(process.cwd(), "public", relativeDirectory);
  const absolutePath = path.join(absoluteDirectory, filename);
  const publicPath = `/${relativeDirectory.replaceAll("\\", "/")}/${filename}`;

  await mkdir(absoluteDirectory, { recursive: true });
  await writeFile(absolutePath, buffer);

  const env = getServerEnv();
  const origin = env.appBaseUrl ?? requestOrigin;

  return {
    publicPath,
    publicUrl: origin ? `${origin.replace(/\/$/, "")}${publicPath}` : undefined
  };
}

export async function parseUploadedImage(file: File | null, requestOrigin?: string): Promise<UploadedImagePayload> {
  if (!file) {
    throw new UploadValidationError("请先上传商品图片。");
  }

  if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
    throw new UploadValidationError("仅支持 JPG、PNG、WebP 图片。");
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new UploadValidationError("图片大小不能超过 8MB。");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const persisted = await persistUpload(buffer, file.type, requestOrigin);

  return {
    name: file.name,
    mimeType: file.type,
    size: file.size,
    base64: bufferToDataUrl(buffer, file.type),
    publicUrl: persisted.publicUrl
  };
}
