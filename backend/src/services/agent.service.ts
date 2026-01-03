import { AgentState } from '../types';
import { queryGemini } from './gemini.service';
import { queryOpenAI } from './openai.service';
import { synthesizeResponses } from './claude.service';
import { logger } from '../utils/logger';


// Parallel Agents - runs Gemini and OpenAI in parallel
async function runParallelAgents(state: AgentState): Promise<AgentState> {
  // Run both agents in parallel using Promise.allSettled to handle individual failures
  const [geminiResult, openaiResult] = await Promise.allSettled([
    queryGemini(state.question),
    queryOpenAI(state.question)
  ]);

  const updatedState: AgentState = { ...state };

  // Process Gemini result
  if (geminiResult.status === 'fulfilled') {
    updatedState.geminiResponse = geminiResult.value.response;
    updatedState.metadata.geminiTime = geminiResult.value.time;
    logger.info('Gemini agent succeeded');
  } else {
    const errorMessage = geminiResult.reason instanceof Error
      ? geminiResult.reason.message
      : 'Unknown error';
    updatedState.geminiError = errorMessage;
    logger.error('Gemini agent failed', geminiResult.reason);
  }

  // Process OpenAI result
  if (openaiResult.status === 'fulfilled') {
    updatedState.openaiResponse = openaiResult.value.response;
    updatedState.metadata.openaiTime = openaiResult.value.time;
    logger.info('OpenAI agent succeeded');
  } else {
    const errorMessage = openaiResult.reason instanceof Error
      ? openaiResult.reason.message
      : 'Unknown error';
    updatedState.openaiError = errorMessage;
    logger.error('OpenAI agent failed', openaiResult.reason);
  }

  return updatedState;
}

// Claude Synthesis
async function runClaudeSynthesis(state: AgentState): Promise<AgentState> {
  const { finalAnswer, reasoning, time } = await synthesizeResponses({
    question: state.question,
    geminiResponse: state.geminiResponse,
    geminiError: state.geminiError,
    openaiResponse: state.openaiResponse,
    openaiError: state.openaiError
  });

  const totalTime =
    (state.metadata.geminiTime || 0) +
    (state.metadata.openaiTime || 0) +
    time;

  return {
    ...state,
    finalAnswer,
    reasoning,
    metadata: {
      ...state.metadata,
      claudeTime: time,
      totalTime
    }
  };
}

// Main function to execute the agent workflow
export async function executeAgentWorkflow(question: string): Promise<AgentState> {
  logger.info('Starting agent workflow', { question });

  const initialState: AgentState = {
    question,
    metadata: {
      totalTime: 0
    }
  };

  try {
    // Step 1: Run Gemini and OpenAI in parallel
    const stateAfterAgents = await runParallelAgents(initialState);

    // Step 2: Run Claude synthesis
    const finalState = await runClaudeSynthesis(stateAfterAgents);

    logger.info('Agent workflow completed', {
      totalTime: finalState.metadata.totalTime
    });

    return finalState;
  } catch (error) {
    logger.error('Agent workflow failed', error);
    throw error;
  }
}
