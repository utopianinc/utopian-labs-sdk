// src/index.ts
import axios, { AxiosInstance } from "axios";
import { AgentsEndpoints } from "./endpoints/agents";
import { SDKError, SDKErrorType } from "./errors";

export interface UtopianLabsConfig {
  apiKey: string;
  baseURL?: string;
  version?: string;
}

export class UtopianLabs {
  private client: AxiosInstance;
  public agents: AgentsEndpoints;

  constructor(config: UtopianLabsConfig) {
    const baseURL = config.baseURL || "https://api.utopianlabs.ai";
    const version = config.version || "v1";

    this.client = axios.create({
      baseURL: `${baseURL}/${version}`,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      validateStatus(status) {
        return status >= 200 && status < 400;
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const { status, data } = error.response;

          if (status === 401) {
            return Promise.reject(new SDKError(SDKErrorType.Unauthorized, "Invalid API key"));
          } else if (status === 402) {
            return Promise.reject(new SDKError(SDKErrorType.PaymentRequired, "Payment required"));
          } else if (status === 404) {
            return Promise.reject(new SDKError(SDKErrorType.NotFound, "Resource not found"));
          } else if (status === 400) {
            return Promise.reject(new SDKError(SDKErrorType.BadRequest, data.error?.message || "Bad request"));
          } else if (status === 429) {
            return Promise.reject(new SDKError(SDKErrorType.RateLimitExceeded, "Rate limit exceeded"));
          } else {
            return Promise.reject(new SDKError(SDKErrorType.ApiError, data.error?.message || "API error"));
          }
        }
        return Promise.reject(new SDKError(SDKErrorType.Unknown, error.message || "Network error"));
      }
    );

    // Initialize endpoints
    this.agents = new AgentsEndpoints(this.client);
  }
}

export * from "./errors";
export * from "./types";
export * from "./schemas";
