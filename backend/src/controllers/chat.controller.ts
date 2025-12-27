import { Request, Response } from 'express';
import { executeAgentWorkflow } from '../services/agent.service';
import { formatSuccessResponse, formatErrorResponse } from '../models/response.model';
import { ChatRequest } from '../types';
import { logger } from '../utils/logger';
//
export async function askQuestion(req: Request, res: Response): Promise<void> {
  try {
    // Validate request body
    const { question } = req.body as ChatRequest;

    if (!question || typeof question !== 'string' || question.trim() === '') {
      res.status(400).json(
        formatErrorResponse(new Error('Question is required and must be a non-empty string'))
      );
      return;
    }

    logger.info('Received question', { question });

    // Execute the agent workflow
    const result = await executeAgentWorkflow(question.trim());

    // Format and send response
    const response = formatSuccessResponse(result);
    res.status(200).json(response);

    logger.info('Request completed successfully', {
      totalTime: result.metadata.totalTime
    });
  } catch (error) {
    logger.error('Request failed', error);

    const response = formatErrorResponse(error);
    res.status(500).json(response);
  }
}
