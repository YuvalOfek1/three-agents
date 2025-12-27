import { AgentState, ChatResponse, ChatResponseData, AgentResponse } from '../types';

export function formatSuccessResponse(state: AgentState): ChatResponse {
  // Build Gemini response
  const geminiResponse: AgentResponse = {
    response: state.geminiResponse || '',
    processingTime: state.metadata.geminiTime || 0,
    ...(state.geminiError && { error: state.geminiError })
  };

  // Build OpenAI response
  const openaiResponse: AgentResponse = {
    response: state.openaiResponse || '',
    processingTime: state.metadata.openaiTime || 0,
    ...(state.openaiError && { error: state.openaiError })
  };

  const data: ChatResponseData = {
    question: state.question,
    agents: {
      gemini: geminiResponse,
      openai: openaiResponse,
      claude: {
        finalAnswer: state.finalAnswer || '',
        reasoning: state.reasoning || '',
        processingTime: state.metadata.claudeTime || 0
      }
    },
    totalProcessingTime: state.metadata.totalTime
  };

  return {
    success: true,
    data
  };
}

export function formatErrorResponse(error: unknown): ChatResponse {
  const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
  const errorDetails = error instanceof Error ? error.stack : undefined;

  return {
    success: false,
    error: errorMessage,
    details: errorDetails
  };
}
