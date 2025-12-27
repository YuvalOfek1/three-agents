import { HumanMessage } from '@langchain/core/messages';
import { geminiClient } from '../config/llm.config';
import { AgentError } from '../types';
import { logger } from '../utils/logger';

export async function queryGemini(question: string): Promise<{ response: string; time: number }> {
  const startTime = Date.now();

  
  try {
    logger.info('Querying Gemini', { question });

    const googleSearchTool = {
      google_search: {}
    };
    const modelWithSearch = geminiClient.bindTools([googleSearchTool]);

    const response = await modelWithSearch.invoke([
      new HumanMessage(question)
    ], {tools: [googleSearchTool]});

    const time = Date.now() - startTime;
    const responseText = response.content.toString();

    logger.info('Gemini response received', { time });

    return {
      response: responseText,
      time
    };
  } catch (error) {
    logger.error('Gemini query failed', error);

    throw new AgentError(
      'Failed to get response from Gemini',
      'Gemini',
      error
    );
  }
}
