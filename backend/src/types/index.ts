// LangGraph State Schema
export interface AgentState {
  question: string;
  geminiResponse?: string;
  geminiError?: string;
  openaiResponse?: string;
  openaiError?: string;
  finalAnswer?: string;
  reasoning?: string;
  metadata: {
    geminiTime?: number;
    openaiTime?: number;
    claudeTime?: number;
    totalTime: number;
  };
}

// Individual Agent Response
export interface AgentResponse {
  response: string;
  processingTime: number;
  error?: string;
}

// Chat Request
export interface ChatRequest {
  question: string;
}

// Chat Response
export interface ChatResponse {
  success: boolean;
  data?: ChatResponseData;
  error?: string;
  details?: string;
}

export interface ChatResponseData {
  question: string;
  agents: {
    gemini: AgentResponse;
    openai: AgentResponse;
    claude: {
      finalAnswer: string;
      reasoning: string;
      processingTime: number;
    };
  };
  totalProcessingTime: number;
}

// Environment Variables
export interface EnvConfig {
  PORT: number;
  GEMINI_API_KEY: string;
  OPENAI_API_KEY: string;
  ANTHROPIC_API_KEY: string;
  GEMINI_MODEL: string;
  OPENAI_MODEL: string;
  CLAUDE_MODEL: string;
}

// Error Types
export class AgentError extends Error {
  constructor(
    message: string,
    public agentName: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'AgentError';
  }
}
