import { AxiosInstance } from "axios";
import { GetMeResponse } from "../schemas";
import { SDKErrorType } from "../errors";
import { SDKError } from "../errors";

export class MeEndpoints {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  /**
   * Validate the API key and return the organization name
   * @returns The organization name
   */
  async me(): Promise<GetMeResponse> {
    try {
      const response = await this.client.get<GetMeResponse>(`/me`);
      return response.data;
    } catch (error: unknown) {
      if (
        error instanceof SDKError &&
        error.type === SDKErrorType.Unauthorized
      ) {
        throw new SDKError(SDKErrorType.Unauthorized, "Invalid API key");
      }
      throw error;
    }
  }
}
