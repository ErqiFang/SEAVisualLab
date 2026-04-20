import { TokenPlanClient } from "@/lib/services/tokenPlanClient";
import { DetailGenerationPlan, MainGenerationPlan } from "@/types/generation";

function extractJson<T>(rawText: string): T {
  const trimmed = rawText.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("Provider response did not contain JSON.");
  }

  return JSON.parse(trimmed.slice(start, end + 1)) as T;
}

export class MiniMaxClient {
  constructor(private readonly tokenPlanClient: TokenPlanClient) {}

  async createMainGenerationPlan(input: { systemPrompt: string; userPrompt: string }): Promise<MainGenerationPlan> {
    const responseText = await this.tokenPlanClient.createTextCompletion(input);
    return extractJson<MainGenerationPlan>(responseText);
  }

  async createDetailGenerationPlan(input: { systemPrompt: string; userPrompt: string }): Promise<DetailGenerationPlan> {
    const responseText = await this.tokenPlanClient.createTextCompletion(input);
    return extractJson<DetailGenerationPlan>(responseText);
  }
}
