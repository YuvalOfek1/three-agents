export interface ChatRequest {
  question: string;
}

export interface AgentResponse {
  response: string;
  processingTime: number;
  error?: string;
}

export interface ClaudeResponse {
  finalAnswer: string;
  reasoning: string;
  processingTime: number;
}

export interface AgentsData {
  gemini: AgentResponse;
  openai: AgentResponse;
  claude: ClaudeResponse;
}

export interface ChatResponseData {
  question: string;
  agents: AgentsData;
  totalProcessingTime: number;
}

export interface ChatResponse {
  success: boolean;
  data?: ChatResponseData;
  error?: string;
  details?: string;
}

export interface Message {
  id: string;
  question: string;
  response?: ChatResponseData;
  error?: string;
  timestamp: Date;
}