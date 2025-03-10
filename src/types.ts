// src/types.ts
import { z } from "zod";
import { zGetAgentRunRequest, zGetAgentRunResponse, zPostAgentRunRequest, zPostAgentRunResponse } from "./schemas";

export type GetAgentRunRequest = z.infer<typeof zGetAgentRunRequest>;
export type GetAgentRunResponse = z.infer<typeof zGetAgentRunResponse>;
export type PostAgentRunRequestInput = z.input<typeof zPostAgentRunRequest>;
export type PostAgentRunResponse = z.infer<typeof zPostAgentRunResponse>;

// Export additional helper types
export type ResearchStep = {
  action: string;
  outcome?: string;
};

export type QualificationScore = "high" | "medium" | "low";
export type TimingScore = "high" | "medium" | "low";
