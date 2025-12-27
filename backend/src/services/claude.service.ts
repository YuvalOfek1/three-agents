import { HumanMessage } from '@langchain/core/messages';
import { claudeClient } from '../config/llm.config';
import { AgentError } from '../types';
import { logger } from '../utils/logger';

interface SynthesisInput {
  question: string;
  geminiResponse?: string;
  geminiError?: string;
  openaiResponse?: string;
  openaiError?: string;
}

interface SynthesisOutput {
  finalAnswer: string;
  reasoning: string;
  time: number;
}

export async function synthesizeResponses(input: SynthesisInput): Promise<SynthesisOutput> {
  const startTime = Date.now();

  try {
    logger.info('Claude synthesizing responses');

    // Build the synthesis prompt
    const prompt = buildSynthesisPrompt(input);

    const response = await claudeClient.invoke([
      new HumanMessage(prompt)
    ]);

    const time = Date.now() - startTime;
    const responseText = response.content.toString();

    // Parse the response to extract final answer and reasoning
    const { finalAnswer, reasoning } = parseClaudeResponse(responseText);

    logger.info('Claude synthesis complete', { time });

    return {
      finalAnswer,
      reasoning,
      time
    };
  } catch (error) {
    logger.error('Claude synthesis failed', error);

    throw new AgentError(
      'Failed to synthesize responses with Claude',
      'Claude',
      error
    );
  }
}

function buildSynthesisPrompt(input: SynthesisInput): string {
  let prompt = `You are tasked with synthesizing and evaluating responses from multiple AI models to provide the best possible answer to a user's question.

Original Question: ${input.question}

`;

  // Add Gemini's response
  if (input.geminiResponse) {
    prompt += `Gemini's Response:
${input.geminiResponse}

`;
  } else if (input.geminiError) {
    prompt += `Gemini's Response: [ERROR] ${input.geminiError}

`;
  }

  // Add OpenAI's response
  if (input.openaiResponse) {
    prompt += `OpenAI's Response:
${input.openaiResponse}

`;
  } else if (input.openaiError) {
    prompt += `OpenAI's Response: [ERROR] ${input.openaiError}

`;
  }

  prompt += `Your task:
1. Analyze both responses (if available) for accuracy, completeness, and quality
2. Synthesize the best aspects of both responses into a single, comprehensive answer
3. If only one response is available (due to errors), evaluate and potentially improve it
4. Provide clear reasoning for your synthesis approach

Please structure your response EXACTLY as follows:

REASONING:
[Your detailed reasoning about the responses and your synthesis approach]

FINAL ANSWER:
[Your synthesized answer to the original question]`;

  return prompt;
}

function parseClaudeResponse(response: string): { finalAnswer: string; reasoning: string } {
  // Try to extract REASONING and FINAL ANSWER sections
  const reasoningMatch = response.match(/REASONING:\s*([\s\S]*?)(?=FINAL ANSWER:|$)/i);
  const finalAnswerMatch = response.match(/FINAL ANSWER:\s*([\s\S]*?)$/i);

  const reasoning = reasoningMatch?.[1]?.trim() || 'No reasoning provided';
  const finalAnswer = finalAnswerMatch?.[1]?.trim() || response.trim();

  return {
    reasoning,
    finalAnswer
  };
}
