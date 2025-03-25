import { AxiosInstance } from "axios";
import { AgentRunsEndpoints } from "./runs";

export class AgentsEndpoints {
  public runs: AgentRunsEndpoints;

  constructor(client: AxiosInstance) {
    this.runs = new AgentRunsEndpoints(client);
  }
}
