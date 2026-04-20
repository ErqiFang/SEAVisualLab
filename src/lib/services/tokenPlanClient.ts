import { ServerEnv, isDevServer } from "@/lib/env";

export class ProviderRequestError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode = 500
  ) {
    super(message);
    this.name = "ProviderRequestError";
  }
}

type TextCompletionInput = {
  systemPrompt: string;
  userPrompt: string;
};

type ImageGenerationInput = {
  prompt: string;
  aspectRatio?: string;
  imageCount?: number;
  subjectReferenceUrl?: string;
};

function joinUrl(baseUrl: string, pathName: string) {
  return `${baseUrl.replace(/\/$/, "")}/${pathName.replace(/^\//, "")}`;
}

function normalizeAspectRatio(ratio?: string) {
  return ratio || "1:1";
}

function extractErrorMessage(errorPayload: unknown, status: number) {
  if (typeof errorPayload === "string" && errorPayload.trim()) return errorPayload;

  if (typeof errorPayload === "object" && errorPayload !== null) {
    const record = errorPayload as Record<string, unknown>;
    const nested =
      record.error && typeof record.error === "object"
        ? (record.error as Record<string, unknown>).message
        : record.message;

    if (typeof nested === "string" && nested.trim()) {
      return nested;
    }
  }

  return `Provider request failed with status ${status}.`;
}

function uniquePaths(paths: string[]) {
  return [...new Set(paths.map((item) => item.trim()).filter(Boolean))];
}

function readBaseResp(json: Record<string, unknown>) {
  const baseResp = json.base_resp;
  if (!baseResp || typeof baseResp !== "object") return null;
  const record = baseResp as Record<string, unknown>;
  const statusCode = typeof record.status_code === "number" ? record.status_code : null;
  const statusMsg = typeof record.status_msg === "string" ? record.status_msg : "";
  return {
    statusCode,
    statusMsg
  };
}

function readTextLikeContent(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (Array.isArray(value)) {
    const text = value
      .map((item) => {
        if (typeof item === "string") return item;
        if (typeof item === "object" && item !== null) {
          const record = item as Record<string, unknown>;
          if (typeof record.text === "string") return record.text;
          if (typeof record.content === "string") return record.content;
        }
        return null;
      })
      .filter((item): item is string => Boolean(item))
      .join("\n");

    return text.trim() ? text : null;
  }

  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>;
    if (typeof record.text === "string" && record.text.trim()) {
      return record.text;
    }
    if (typeof record.content === "string" && record.content.trim()) {
      return record.content;
    }
  }

  return null;
}

export class TokenPlanClient {
  constructor(private readonly env: ServerEnv) {}

  private async requestJsonAtPath<TResponse>(pathName: string, body: Record<string, unknown>) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.env.requestTimeoutMs);

    try {
      const response = await fetch(joinUrl(this.env.tokenPlanBaseUrl, pathName), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.env.tokenPlanApiKey}`
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      const json = (await response.json().catch(() => null)) as TResponse | Record<string, unknown> | null;

      if (!response.ok) {
        throw new ProviderRequestError(
          extractErrorMessage(json, response.status),
          "TOKENPLAN_HTTP_ERROR",
          response.status
        );
      }

      if (json && typeof json === "object") {
        const baseResp = readBaseResp(json as Record<string, unknown>);
        if (baseResp && baseResp.statusCode !== null && baseResp.statusCode !== 0) {
          throw new ProviderRequestError(
            baseResp.statusMsg || `Provider business error ${baseResp.statusCode}.`,
            baseResp.statusCode === 2049 ? "TOKENPLAN_INVALID_API_KEY" : "TOKENPLAN_BUSINESS_ERROR",
            baseResp.statusCode === 2049 ? 401 : 502
          );
        }
      }

      if (isDevServer()) {
        console.info(`[tokenplan] ${pathName} ok`);
      }

      return json as TResponse;
    } catch (error) {
      if (error instanceof ProviderRequestError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new ProviderRequestError("TokenPlan request timed out.", "TOKENPLAN_TIMEOUT", 504);
      }

      throw new ProviderRequestError(
        error instanceof Error ? error.message : "Unknown TokenPlan error.",
        "TOKENPLAN_UNKNOWN_ERROR",
        500
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async requestJsonWithPathFallback<TResponse>(paths: string[], body: Record<string, unknown>) {
    let lastError: ProviderRequestError | null = null;

    for (const pathName of uniquePaths(paths)) {
      try {
        return await this.requestJsonAtPath<TResponse>(pathName, body);
      } catch (error) {
        if (!(error instanceof ProviderRequestError)) {
          throw error;
        }

        lastError = error;
        if (isDevServer()) {
          console.warn(`[tokenplan] ${pathName} failed`, error.statusCode, error.message);
        }

        if (error.statusCode !== 404) {
          throw error;
        }
      }
    }

    throw lastError ?? new ProviderRequestError("Provider request failed.", "TOKENPLAN_HTTP_ERROR", 500);
  }

  async createTextCompletion(input: TextCompletionInput) {
    const standardJson = await this.requestJsonWithPathFallback<Record<string, unknown>>(
      ["/v1/text/chatcompletion_v2", "/v1/text/chatcompletion", this.env.tokenPlanChatPath, "/anthropic/v1/messages", "/v1/messages"],
      {
        // Prefer the native MiniMax text chat endpoint first so text planning and image generation
        // both use the same Bearer-token auth scheme under Token Plan.
        model: this.env.miniMaxModel,
        messages: [
          { role: "system", content: input.systemPrompt },
          { role: "user", content: input.userPrompt }
        ],
        stream: false,
        max_completion_tokens: 2048,
        temperature: 0.2
      }
    ).catch(async (error) => {
      if (!(error instanceof ProviderRequestError) || error.statusCode !== 404) {
        throw error;
      }

      return this.requestJsonWithPathFallback<Record<string, unknown>>(
        ["/anthropic/v1/messages", "/v1/messages", "/v1/chat/completions", "/openai/v1/chat/completions", "/v1/responses"],
        {
          model: this.env.miniMaxModel,
          max_tokens: 4096,
          system: input.systemPrompt,
          messages: [{ role: "user", content: [{ type: "text", text: input.userPrompt }] }]
        }
      ).catch(async (anthropicError) => {
        if (!(anthropicError instanceof ProviderRequestError) || anthropicError.statusCode !== 404) {
          throw anthropicError;
        }

        return this.requestJsonWithPathFallback<Record<string, unknown>>(
          ["/v1/chat/completions", "/openai/v1/chat/completions", "/v1/responses"],
          {
            model: this.env.miniMaxModel,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: input.systemPrompt },
              { role: "user", content: input.userPrompt }
            ]
          }
        );
      });
    });

    const standardChoiceMessage = (standardJson.choices as Array<{ message?: { content?: unknown; reasoning_content?: unknown } }> | undefined)?.[0]?.message;
    const standardContent =
      readTextLikeContent(standardJson.reply) ??
      readTextLikeContent(standardJson.output_text) ??
      readTextLikeContent(standardJson.text) ??
      readTextLikeContent((standardJson.data as { text?: unknown } | undefined)?.text) ??
      readTextLikeContent(standardChoiceMessage?.content);

    const anthropicContent = readTextLikeContent(standardJson.content);

    const content = standardContent || anthropicContent;

    if (typeof content !== "string" || content.trim().length === 0) {
      if (isDevServer()) {
        console.error("[tokenplan] text response parse failed", JSON.stringify(standardJson, null, 2));
      }
      throw new ProviderRequestError("TokenPlan response did not contain readable text.", "TOKENPLAN_EMPTY_RESPONSE", 502);
    }

    return content;
  }

  async createImageGeneration(input: ImageGenerationInput) {
    const miniMaxStyleBody: Record<string, unknown> = {
      model: this.env.miniMaxImageModel,
      prompt: input.prompt,
      aspect_ratio: normalizeAspectRatio(input.aspectRatio),
      n: input.imageCount ?? 1,
      response_format: "base64",
      ...(input.subjectReferenceUrl
        ? {
            subject_reference: [
              {
                type: "image",
                image_file: input.subjectReferenceUrl
              }
            ]
          }
        : {})
    };

    const openAiCompatibleBody: Record<string, unknown> = {
      model: this.env.miniMaxImageModel,
      prompt: input.prompt,
      n: input.imageCount ?? 1,
      size: normalizeAspectRatio(input.aspectRatio) === "16:9" ? "1536x864" : normalizeAspectRatio(input.aspectRatio) === "4:5" ? "1024x1280" : "1024x1024",
      ...(input.subjectReferenceUrl ? { image: input.subjectReferenceUrl } : {})
    };

    const attempts: Array<{ paths: string[]; body: Record<string, unknown> }> = [
      {
        paths: [this.env.tokenPlanImagePath, "/v1/image_generation", "/v1/image/generations", "/v1/image_generation_v2"],
        body: miniMaxStyleBody
      },
      {
        paths: ["/v1/images/generations", "/openai/v1/images/generations"],
        body: openAiCompatibleBody
      }
    ];

    let lastError: ProviderRequestError | null = null;
    for (const attempt of attempts) {
      try {
        const json = await this.requestJsonWithPathFallback<Record<string, unknown>>(attempt.paths, attempt.body);
        const imageData = json.data;
        const imageUrlsFromObject =
          imageData && typeof imageData === "object" && Array.isArray((imageData as Record<string, unknown>).image_urls)
            ? ((imageData as Record<string, unknown>).image_urls as unknown[])
                .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
            : [];

        const base64ImagesFromObject =
          imageData && typeof imageData === "object" && Array.isArray((imageData as Record<string, unknown>).images_base64)
            ? ((imageData as Record<string, unknown>).images_base64 as unknown[])
                .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
                .map((item) => `data:image/png;base64,${item}`)
            : [];

        const candidates = [
          ...(Array.isArray(json.data) ? json.data : []),
          ...(Array.isArray(json.output) ? json.output : []),
          ...(Array.isArray(json.images) ? json.images : [])
        ] as Array<Record<string, unknown>>;

        const mappedImages = candidates
          .map((item) => {
            const base64 = item.image_base64 ?? item.b64_json ?? item.base64;
            const url = item.url ?? item.image_url;

            if (typeof base64 === "string" && base64.trim()) {
              return `data:image/png;base64,${base64}`;
            }

            if (typeof url === "string" && url.trim()) {
              return url;
            }

            return null;
          })
          .filter((value): value is string => Boolean(value));

        const images = [...imageUrlsFromObject, ...base64ImagesFromObject, ...mappedImages];

        if (images.length > 0) {
          return images;
        }

        lastError = new ProviderRequestError("TokenPlan image response did not contain any images.", "TOKENPLAN_EMPTY_IMAGE_RESPONSE", 502);
      } catch (error) {
        if (error instanceof ProviderRequestError) {
          lastError = error;
          if (error.statusCode === 404) {
            continue;
          }
        }
        throw error;
      }
    }

    throw lastError ?? new ProviderRequestError("TokenPlan image response did not contain any images.", "TOKENPLAN_EMPTY_IMAGE_RESPONSE", 502);
  }
}
