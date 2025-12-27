import { HumanMessage } from '@langchain/core/messages';
import { openaiClient } from '../config/llm.config';
import { AgentError } from '../types';
import { logger } from '../utils/logger';
import { tools } from '@langchain/openai';

export async function queryOpenAI(question: string): Promise<{ response: string; time: number }> {
  const startTime = Date.now();

  try {
    logger.info('Querying OpenAI', { question });
    const response = await openaiClient.invoke([
      new HumanMessage(question)
    ], {tools: [tools.webSearch()]});

    const time = Date.now() - startTime;
    const responseText = response.content[0].text;

    logger.info('OpenAI response received', { time });

    return {
      response: responseText,
      time
    };
  } catch (error) {
    logger.error('OpenAI query failed', error);

    throw new AgentError(
      'Failed to get response from OpenAI',
      'OpenAI',
      error
    );
  }
}
