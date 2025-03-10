// src/endpoints/agents/runs.ts
import { AxiosInstance } from "axios";
import { GetAgentRunRequest, GetAgentRunResponse, PostAgentRunRequestInput, PostAgentRunResponse } from "../../types";
import { zGetAgentRunRequest, zPostAgentRunRequest } from "../../schemas";
import { SDKError, SDKErrorType } from "../../errors";
import { z } from "zod";

export class AgentRunsEndpoints {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  /**
   * Get an agent run by ID
   * @param params Request parameters including run ID
   * @returns The agent run details
   */
  async get(params: GetAgentRunRequest): Promise<GetAgentRunResponse> {
    try {
      // Validate input with Zod
      const validatedParams = zGetAgentRunRequest.parse(params);

      const response = await this.client.get<GetAgentRunResponse>(`/agents/runs/${validatedParams.run}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "ZodError") {
        const zodError = error as z.ZodError;
        throw new SDKError(SDKErrorType.ValidationError, `Invalid request data: ${zodError.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
      }
      throw error;
    }
  }

  /**
   * Create a new agent run
   * @param data Request data for creating a new agent run
   * @returns The created agent run
   */
  async create(data: PostAgentRunRequestInput): Promise<Omit<PostAgentRunResponse, "_status">> {
    try {
      // Validate input with Zod
      const validatedData = zPostAgentRunRequest.parse(data);

      const response = await this.client.post<PostAgentRunResponse>("/agents/runs", validatedData);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "ZodError") {
        const zodError = error as z.ZodError;
        throw new SDKError(SDKErrorType.ValidationError, `Invalid request data: ${zodError.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
      }
      throw error;
    }
  }
}
