import { ServerEnv } from "@/lib/env";
import { ProviderRequestError, TokenPlanClient } from "@/lib/services/tokenPlanClient";
import {
  DetailGeneratedImage,
  DetailGenerationPlan,
  DetailGenerationRequest,
  MainGeneratedImage,
  MainGenerationPlan,
  MainGenerationRequest,
  ResultSourceType
} from "@/types/generation";

type GeneratedBatch<TImage> = {
  images: TImage[];
  sourceType: ResultSourceType;
  warningMessage?: string;
};

const SERVER_RENDERED_WARNING = "实时生成暂未开启，当前返回的是基于上传商品图生成的服务端预览结果。";

const FALLBACK_WARNING = "服务端预览也不可用，已返回静态兜底素材以保证流程可用。";

const MAIN_KIND = "主图" as const;
const SUB_KIND = "辅图" as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hashSeed(seed: string) {
  let value = 0;
  for (let index = 0; index < seed.length; index += 1) {
    value = (value * 31 + seed.charCodeAt(index)) % 2147483647;
  }
  return value;
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function svgToDataUrl(markup: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
}

function sizeForRatio(ratio: MainGenerationRequest["form"]["ratio"]) {
  if (ratio === "1:1") return { width: 1080, height: 1080 };
  if (ratio === "16:9") return { width: 1440, height: 810 };
  return { width: 1080, height: 1350 };
}

function pickPalette(seed: string) {
  const palettes = [
    { bg: "#f8f5ef", panel: "#ffffff", accent: "#1f7a73", soft: "#d8ece7", text: "#122033" },
    { bg: "#f6f2ee", panel: "#ffffff", accent: "#c46a2d", soft: "#f7dcc8", text: "#172033" },
    { bg: "#f4f7fb", panel: "#ffffff", accent: "#3f67b1", soft: "#dce6fb", text: "#14223a" },
    { bg: "#f7f6f1", panel: "#ffffff", accent: "#4d7754", soft: "#dce8d8", text: "#1b271f" }
  ] as const;

  return palettes[hashSeed(seed) % palettes.length];
}

function buildChipMarkup(labels: string[], accent: string, soft: string, text: string) {
  return labels
    .slice(0, 3)
    .map(
      (label, index) => `
        <g transform="translate(${72 + index * 180}, 72)">
          <rect rx="24" ry="24" width="156" height="42" fill="${soft}" stroke="${accent}" stroke-opacity="0.18"/>
          <text x="78" y="27" text-anchor="middle" font-size="18" font-weight="600" fill="${text}" font-family="Arial, sans-serif">${escapeXml(label)}</text>
        </g>
      `
    )
    .join("");
}

function buildCaption(value: string, limit = 76) {
  if (value.length <= limit) return value;
  return `${value.slice(0, Math.max(0, limit - 1))}…`;
}

function buildMainSvg(options: {
  seed: string;
  ratio: MainGenerationRequest["form"]["ratio"];
  imageUrl: string;
  title: string;
  subtitle: string;
  kicker: string;
  tags: string[];
  footer: string;
  variant: number;
}) {
  const { width, height } = sizeForRatio(options.ratio);
  const palette = pickPalette(options.seed);
  const imageInset = 54;
  const copyX = width > height ? Math.round(width * 0.58) : 72;
  const copyY = width > height ? 96 : Math.round(height * 0.67);
  const imageWidth = width > height ? Math.round(width * 0.46) : width - imageInset * 2;
  const imageHeight = width > height ? height - imageInset * 2 : Math.round(height * 0.54);
  const imageY = width > height ? imageInset : 88;
  const imageX = imageInset;
  const accentBandY = height - 144;
  const variantBadge = options.variant > 0 ? ` · V${options.variant + 1}` : "";

  return svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="${palette.bg}"/>
      <rect x="24" y="24" width="${width - 48}" height="${height - 48}" rx="34" fill="${palette.panel}" stroke="${palette.soft}"/>
      ${buildChipMarkup(options.tags, palette.accent, palette.soft, palette.text)}
      <rect x="${imageX}" y="${imageY}" width="${imageWidth}" height="${imageHeight}" rx="30" fill="${palette.soft}"/>
      <image href="${escapeXml(options.imageUrl)}" x="${imageX}" y="${imageY}" width="${imageWidth}" height="${imageHeight}" preserveAspectRatio="xMidYMid slice"/>
      <rect x="${copyX}" y="${copyY}" width="${width > height ? width - copyX - 72 : width - 144}" height="${width > height ? height - copyY - 90 : accentBandY - copyY - 28}" rx="28" fill="${palette.panel}" fill-opacity="0.96"/>
      <text x="${copyX}" y="${copyY}" font-size="20" letter-spacing="4" font-weight="700" fill="${palette.accent}" font-family="Arial, sans-serif">${escapeXml(options.kicker)}</text>
      <text x="${copyX}" y="${copyY + 58}" font-size="${width > height ? 42 : 40}" font-weight="800" fill="${palette.text}" font-family="Arial, sans-serif">${escapeXml(options.title)}</text>
      <text x="${copyX}" y="${copyY + 104}" font-size="24" fill="${palette.text}" fill-opacity="0.78" font-family="Arial, sans-serif">${escapeXml(options.subtitle)}</text>
      <text x="${copyX}" y="${copyY + 152}" font-size="18" fill="${palette.text}" fill-opacity="0.62" font-family="Arial, sans-serif">${escapeXml(options.footer + variantBadge)}</text>
      <rect x="40" y="${accentBandY}" width="${width - 80}" height="84" rx="28" fill="${palette.text}"/>
      <text x="72" y="${accentBandY + 34}" font-size="24" font-weight="700" fill="#ffffff" font-family="Arial, sans-serif">${escapeXml(options.title)}</text>
      <text x="72" y="${accentBandY + 60}" font-size="17" fill="rgba(255,255,255,0.75)" font-family="Arial, sans-serif">${escapeXml(options.footer)}</text>
    </svg>
  `);
}

function buildDetailSvg(options: {
  seed: string;
  imageUrl: string;
  title: string;
  description: string;
  category: string;
  scene: string;
  variant: number;
}) {
  const width = 1080;
  const height = 1350;
  const palette = pickPalette(options.seed);
  const variantBadge = options.variant > 0 ? ` · V${options.variant + 1}` : "";

  return svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="${palette.bg}"/>
      <rect x="26" y="26" width="${width - 52}" height="${height - 52}" rx="36" fill="${palette.panel}" stroke="${palette.soft}"/>
      <rect x="60" y="60" width="${width - 120}" height="770" rx="34" fill="${palette.soft}"/>
      <image href="${escapeXml(options.imageUrl)}" x="60" y="60" width="${width - 120}" height="770" preserveAspectRatio="xMidYMid slice"/>
      <rect x="60" y="862" width="${width - 120}" height="428" rx="32" fill="${palette.text}"/>
      <text x="96" y="924" font-size="20" letter-spacing="4" font-weight="700" fill="${palette.soft}" font-family="Arial, sans-serif">${escapeXml(options.category)}</text>
      <text x="96" y="986" font-size="44" font-weight="800" fill="#ffffff" font-family="Arial, sans-serif">${escapeXml(options.title)}</text>
      <text x="96" y="1036" font-size="21" fill="rgba(255,255,255,0.78)" font-family="Arial, sans-serif">${escapeXml(options.scene + variantBadge)}</text>
      <text x="96" y="1098" font-size="20" fill="rgba(255,255,255,0.82)" font-family="Arial, sans-serif">${escapeXml(options.description)}</text>
      <rect x="96" y="1146" width="248" height="46" rx="23" fill="${palette.accent}"/>
      <text x="220" y="1175" text-anchor="middle" font-size="18" font-weight="700" fill="#ffffff" font-family="Arial, sans-serif">SEA Visual Lab</text>
      <text x="96" y="1234" font-size="18" fill="rgba(255,255,255,0.62)" font-family="Arial, sans-serif">Server-rendered preview based on uploaded image</text>
    </svg>
  `);
}

function createServerRenderedMainAssets(plan: MainGenerationPlan, request: MainGenerationRequest): MainGeneratedImage[] {
  const includeMain = request.form.outputType !== "辅图";
  const includeSub = request.form.outputType !== "主图";
  const subCount = clamp(request.form.quantity, 1, 3);
  const baseImageUrl = request.image.base64;

  return plan.styles.flatMap((style) => {
    const assets: MainGeneratedImage[] = [];

    if (includeMain) {
      const imageUrl = buildMainSvg({
        seed: `${style.styleId}-main-${request.form.name}`,
        ratio: request.form.ratio,
        imageUrl: baseImageUrl,
        title: style.styleName,
        subtitle: buildCaption(request.form.name),
        kicker: "MAIN VISUAL",
        tags: style.tags,
        footer: buildCaption(`${request.form.platform} · ${request.form.country} · ${request.form.category}`, 52),
        variant: 0
      });

      assets.push({
        imageId: `${style.styleId}-main-1`,
        styleId: style.styleId,
        kind: MAIN_KIND,
        title: `${style.styleName} / 主图`,
        caption: `${request.form.name} · ${request.form.country} · ${request.form.platform}`,
        imageUrl,
        generationPrompt: style.generationPrompt,
        sourceType: "server-rendered",
        canRegenerate: true,
        downloadUrl: imageUrl
      });
    }

    if (includeSub) {
      for (let index = 0; index < subCount; index += 1) {
        const imageUrl = buildMainSvg({
          seed: `${style.styleId}-sub-${index}-${request.form.name}`,
          ratio: request.form.ratio,
          imageUrl: baseImageUrl,
          title: `${style.styleName} / 辅图`,
          subtitle: buildCaption(style.sceneDescription),
          kicker: "SECONDARY VISUAL",
          tags: [style.tags[index % Math.max(style.tags.length, 1)] ?? style.styleName, request.form.platform, request.form.country],
          footer: buildCaption(`${request.form.styleKeywords || request.form.scenario || request.form.materialDescription}`, 56),
          variant: index
        });

        assets.push({
          imageId: `${style.styleId}-sub-${index + 1}`,
          styleId: style.styleId,
          kind: SUB_KIND,
          title: `${style.styleName} / 辅图 ${index + 1}`,
          caption: `${style.tags[0] ?? style.styleName} · ${style.sceneDescription}`,
          imageUrl,
          generationPrompt: style.generationPrompt,
          sourceType: "server-rendered",
          canRegenerate: true,
          downloadUrl: imageUrl
        });
      }
    }

    return assets;
  });
}

function createServerRenderedDetailAssets(plan: DetailGenerationPlan, request: DetailGenerationRequest): DetailGeneratedImage[] {
  const baseImageUrl = request.image.base64;

  return plan.groups.flatMap((group, groupIndex) =>
    group.details.map((detail, detailIndex) => {
      const imageUrl = buildDetailSvg({
        seed: `${group.category}-${detail.detailId}-${request.form.name}`,
        imageUrl: baseImageUrl,
        title: detail.label,
        description: buildCaption(detail.description, 72),
        category: group.category,
        scene: detail.recommendedScene,
        variant: groupIndex + detailIndex
      });

      return {
        detailId: detail.detailId,
        category: group.category,
        label: detail.label,
        description: detail.description,
        imageUrl,
        recommendedScene: detail.recommendedScene,
        generationPrompt: detail.generationPrompt,
        sourceType: "server-rendered" as const,
        canRegenerate: true,
        downloadUrl: imageUrl
      };
    })
  );
}

function resolveSubjectReference(request: MainGenerationRequest | DetailGenerationRequest) {
  if (request.image.publicUrl) {
    return request.image.publicUrl;
  }

  if (request.image.base64) {
    return request.image.base64;
  }

  throw new ProviderRequestError(
    "Uploaded image could not be converted into a provider-compatible reference.",
    "IMAGE_REFERENCE_MISSING",
    500
  );
}

function createMainAssetsFromProvider(
  plan: MainGenerationPlan,
  request: MainGenerationRequest,
  providerImagesByStyle: Map<string, string[]>
): MainGeneratedImage[] {
  const includeMain = request.form.outputType !== "辅图";
  const includeSub = request.form.outputType !== "主图";
  const subCount = clamp(request.form.quantity, 1, 3);

  return plan.styles.flatMap((style) => {
    const queue = [...(providerImagesByStyle.get(style.styleId) ?? [])];
    const assets: MainGeneratedImage[] = [];

    if (includeMain && queue.length > 0) {
      const imageUrl = queue.shift()!;
      assets.push({
        imageId: `${style.styleId}-main-1`,
        styleId: style.styleId,
        kind: MAIN_KIND,
        title: `${style.styleName} / 主图`,
        caption: `${request.form.name} · ${request.form.country} · ${request.form.platform}`,
        imageUrl,
        generationPrompt: style.generationPrompt,
        sourceType: "real",
        canRegenerate: true,
        downloadUrl: imageUrl
      });
    }

    if (includeSub) {
      for (let index = 0; index < subCount; index += 1) {
        const imageUrl = queue.shift();
        if (!imageUrl) break;

        assets.push({
          imageId: `${style.styleId}-sub-${index + 1}`,
          styleId: style.styleId,
          kind: SUB_KIND,
          title: `${style.styleName} / 辅图 ${index + 1}`,
          caption: `${style.tags[0] ?? style.styleName} · ${style.sceneDescription}`,
          imageUrl,
          generationPrompt: style.generationPrompt,
          sourceType: "real",
          canRegenerate: true,
          downloadUrl: imageUrl
        });
      }
    }

    return assets;
  });
}

export class ImageGenerationService {
  private readonly tokenPlanClient: TokenPlanClient;

  constructor(private readonly env: ServerEnv) {
    this.tokenPlanClient = new TokenPlanClient(env);
  }

  async generateMainImages(plan: MainGenerationPlan, request: MainGenerationRequest): Promise<GeneratedBatch<MainGeneratedImage>> {
    if (!this.env.enableRealGeneration) {
      return {
        images: createServerRenderedMainAssets(plan, request),
        sourceType: "server-rendered",
        warningMessage: SERVER_RENDERED_WARNING
      };
    }

    const referenceUrl = resolveSubjectReference(request);
    const includeMain = request.form.outputType !== "辅图";
    const includeSub = request.form.outputType !== "主图";
    const totalCount = (includeMain ? 1 : 0) + (includeSub ? clamp(request.form.quantity, 1, 3) : 0);
    const providerImagesByStyle = new Map<string, string[]>();

    for (const style of plan.styles) {
      const images = await this.tokenPlanClient.createImageGeneration({
        prompt: style.generationPrompt,
        aspectRatio: request.form.ratio,
        imageCount: totalCount,
        subjectReferenceUrl: referenceUrl
      });
      providerImagesByStyle.set(style.styleId, images);
    }

    return {
      images: createMainAssetsFromProvider(plan, request, providerImagesByStyle),
      sourceType: "real"
    };
  }

  async generateDetailImages(plan: DetailGenerationPlan, request: DetailGenerationRequest): Promise<GeneratedBatch<DetailGeneratedImage>> {
    if (!this.env.enableRealGeneration) {
      return {
        images: createServerRenderedDetailAssets(plan, request),
        sourceType: "server-rendered",
        warningMessage: SERVER_RENDERED_WARNING
      };
    }

    const referenceUrl = resolveSubjectReference(request);
    const images: DetailGeneratedImage[] = [];

    for (const group of plan.groups) {
      for (const detail of group.details) {
        const [imageUrl] = await this.tokenPlanClient.createImageGeneration({
          prompt: detail.generationPrompt,
          imageCount: 1,
          subjectReferenceUrl: referenceUrl
        });

        images.push({
          detailId: detail.detailId,
          category: group.category,
          label: detail.label,
          description: detail.description,
          imageUrl,
          recommendedScene: detail.recommendedScene,
          generationPrompt: detail.generationPrompt,
          sourceType: "real",
          canRegenerate: true,
          downloadUrl: imageUrl
        });
      }
    }

    return {
      images,
      sourceType: "real"
    };
  }

  static getFallbackWarning() {
    return FALLBACK_WARNING;
  }
}
