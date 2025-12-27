import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { config } from 'dotenv';
import { EnvConfig } from '../types';
import { logger } from '../utils/logger';

// Load environment variables
config();

// Validate environment variables
function validateEnv(): EnvConfig {
  const requiredEnvVars = [
    'GEMINI_API_KEY',
    'OPENAI_API_KEY',
  ];

  const missing = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  return {
    PORT: parseInt(process.env.PORT || '3000', 10),
    GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY!,
    GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-5-mini',
    CLAUDE_MODEL: process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929'
  };
}

export const env = validateEnv();

// Initialize Gemini client
export const geminiClient = new ChatGoogleGenerativeAI({
  apiKey: env.GEMINI_API_KEY,
  model: env.GEMINI_MODEL,
  temperature: 0.7
});

// Initialize OpenAI client
export const openaiClient = new ChatOpenAI({
  apiKey: env.OPENAI_API_KEY,
  modelName: env.OPENAI_MODEL,
  temperature: 1,
});

// Initialize Claude client
export const claudeClient = new ChatAnthropic({
  apiKey: env.ANTHROPIC_API_KEY,
  modelName: env.CLAUDE_MODEL,
  temperature: 0.7
});


logger.info('LLM clients initialized successfully', {
  geminiModel: env.GEMINI_MODEL,
  openaiModel: env.OPENAI_MODEL,
  claudeModel: env.CLAUDE_MODEL
});