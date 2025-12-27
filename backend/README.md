# Multi-Agent LLM Decision System - Backend API Documentation

A sophisticated multi-agent system that leverages three leading LLMs (Gemini, OpenAI, and Claude) to provide comprehensive, well-reasoned answers to user questions with web search capabilities.

## Features

- **Parallel Agent Execution**: Gemini and OpenAI agents run simultaneously for optimal performance
- **Web Search Integration**: Both Gemini and OpenAI have real-time web search capabilities
- **Intelligent Synthesis**: Claude analyzes and synthesizes responses from both agents
- **Type-Safe**: Built with TypeScript for reliability and maintainability
- **Comprehensive Error Handling**: Gracefully handles agent failures while still providing results
- **RESTful API**: Clean Express-based API with CORS support
- **Structured Logging**: JSON-formatted logs with timestamps and context

## Architecture

```
┌─────────────┐
│   User      │
│  Question   │
└──────┬──────┘
       │
       v
┌──────────────────┐
│  Express API     │
│  /api/chat/ask   │
└────────┬─────────┘
         │
         v
┌────────────────────────┐
│   LangGraph Workflow   │
│                        │
│  ┌────────────────┐    │
│  │  Parallel Exec │    │
│  │                │    │
│  │  ┌──────────┐  │    │
│  │  │  Gemini  │  │    │
│  │  └──────────┘  │    │
│  │                │    │
│  │  ┌──────────┐  │    │
│  │  │ OpenAI   │  │    │
│  │  └──────────┘  │    │
│  └────────┬───────┘    │
│           │            │
│           v            │
│  ┌────────────────┐    │
│  │  Claude Agent  │    │
│  │  (Synthesis)   │    │
│  └────────────────┘    │
└────────┬───────────────┘
         │
         v
┌────────────────────┐
│  Final Response    │
│  - All Responses   │
│  - Reasoning       │
│  - Timing Data     │
└────────────────────┘
```

## Project Structure

```
3AgentDecision/
├── src/
│   ├── routes/
│   │   └── chat.routes.ts          # API routes
│   ├── controllers/
│   │   └── chat.controller.ts      # Request handlers
│   ├── services/
│   │   ├── agent.service.ts        # LangGraph orchestration
│   │   ├── gemini.service.ts       # Gemini integration
│   │   ├── openai.service.ts       # OpenAI integration
│   │   └── claude.service.ts       # Claude synthesis
│   ├── models/
│   │   └── response.model.ts       # Response formatting
│   ├── config/
│   │   └── llm.config.ts           # LLM client setup
│   ├── utils/
│   │   └── logger.ts               # Logging utility
│   ├── types/
│   │   └── index.ts                # TypeScript definitions
│   ├── app.ts                      # Express app
│   └── server.ts                   # Server entry point
├── dist/                           # Compiled JavaScript
├── .env                            # Environment variables
├── .env.example                    # Example env file
├── tsconfig.json                   # TypeScript config
└── package.json                    # Dependencies
```

## Prerequisites

- Node.js v18 or higher
- npm or yarn
- API keys for:
  - Google Gemini
  - OpenAI
  - Anthropic (Claude)

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Edit the `.env` file and add your API keys:
   ```
   GEMINI_API_KEY=your_actual_gemini_key
   OPENAI_API_KEY=your_actual_openai_key
   ANTHROPIC_API_KEY=your_actual_anthropic_key
   ```

3. **Get your API keys**:
   - **Gemini**: https://makersuite.google.com/app/apikey
   - **OpenAI**: https://platform.openai.com/api-keys
   - **Anthropic**: https://console.anthropic.com/settings/keys

## Usage

### Development Mode

Run with hot reload:
```bash
npm run dev
```

### Production Build

Build and run:
```bash
npm run build
npm start
```

### API Endpoints

#### 1. Root Endpoint
**GET** `/`

Returns API information and available endpoints.

**Response (200):**
```json
{
  "message": "Multi-Agent LLM Decision System API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "ask": "POST /api/chat/ask"
  }
}
```

---

#### 2. Health Check
**GET** `/health`

Check if the server is running.

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-27T12:00:00.000Z"
}
```

---

#### 3. Ask Question (Main Endpoint)
**POST** `/api/chat/ask`

Submit a question to the multi-agent system.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```typescript
{
  "question": string  // Required, non-empty string
}
```

**Example Request:**
```json
{
  "question": "What are the latest developments in quantum computing?"
}
```

**Success Response (200):**
```typescript
{
  "success": true,
  "data": {
    "question": string,
    "agents": {
      "gemini": {
        "response": string,
        "processingTime": number,  // milliseconds
        "error"?: string           // Present only if agent failed
      },
      "openai": {
        "response": string,
        "processingTime": number,  // milliseconds
        "error"?: string           // Present only if agent failed
      },
      "claude": {
        "finalAnswer": string,
        "reasoning": string,
        "processingTime": number   // milliseconds
      }
    },
    "totalProcessingTime": number  // milliseconds
  }
}
```

**Example Success Response:**
```json
{
  "success": true,
  "data": {
    "question": "What is the capital of France?",
    "agents": {
      "gemini": {
        "response": "The capital of France is Paris, a major European city and a global center for art, fashion, gastronomy and culture...",
        "processingTime": 1234
      },
      "openai": {
        "response": "Paris is the capital city of France. It's one of the most populous cities in Europe...",
        "processingTime": 1456
      },
      "claude": {
        "finalAnswer": "The capital of France is Paris. Both agents correctly identified this, and Paris serves as France's political, economic, and cultural center.",
        "reasoning": "Both Gemini and OpenAI provided accurate and complementary information about Paris. I've synthesized their responses to give a complete answer.",
        "processingTime": 890
      }
    },
    "totalProcessingTime": 3580
  }
}
```

**Error Response (400 - Bad Request):**
```json
{
  "success": false,
  "error": "Question is required and must be a non-empty string"
}
```

**Error Response (500 - Server Error):**
```json
{
  "success": false,
  "error": "Error message here",
  "details": "Stack trace or additional details (in development mode)"
}
```

**Error Response (404 - Not Found):**
```json
{
  "success": false,
  "error": "Endpoint not found!",
  "path": "/invalid/path"
}
```

## Testing with cURL

```bash
curl -X POST http://localhost:3000/api/chat/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What is artificial intelligence?"}'
```

## Testing with Postman

1. Create a new POST request
2. URL: `http://localhost:3000/api/chat/ask`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
   ```json
   {
     "question": "Explain quantum computing"
   }
   ```

## How It Works

1. **User submits a question** via POST request to `/api/chat/ask`

2. **LangGraph workflow starts**:
   - Gemini and OpenAI agents execute in parallel
   - Each agent generates a response to the question
   - Both responses (or errors) are captured with timing data

3. **Claude synthesizes**:
   - Receives both agent responses
   - Analyzes quality, accuracy, and completeness
   - Generates a final synthesized answer
   - Provides reasoning for the synthesis approach

4. **Response returned**:
   - All agent responses
   - Claude's final answer and reasoning
   - Processing time for each agent
   - Total processing time

## Error Handling

The system gracefully handles errors:
- If one agent fails, the other's response is still used
- Claude can synthesize even with partial data
- All errors are logged and included in the response
- Failed agents show error messages in the response

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| PORT | No | 3000 | Server port |
| GEMINI_API_KEY | Yes | - | Google Gemini API key |
| OPENAI_API_KEY | Yes | - | OpenAI API key |
| ANTHROPIC_API_KEY | Yes | - | Anthropic API key |
| GEMINI_MODEL | No | gemini-pro | Gemini model name |
| OPENAI_MODEL | No | gpt-4 | OpenAI model name |
| CLAUDE_MODEL | No | claude-3-5-sonnet-20241022 | Claude model name |

## TypeScript Interfaces for Frontend

### Request Type

```typescript
interface ChatRequest {
  question: string;
}
```

### Response Types

```typescript
interface ChatResponse {
  success: boolean;
  data?: ChatResponseData;
  error?: string;
  details?: string;
}

interface ChatResponseData {
  question: string;
  agents: AgentsData;
  totalProcessingTime: number;
}

interface AgentsData {
  gemini: AgentResponse;
  openai: AgentResponse;
  claude: ClaudeResponse;
}

interface AgentResponse {
  response: string;
  processingTime: number;
  error?: string;
}

interface ClaudeResponse {
  finalAnswer: string;
  reasoning: string;
  processingTime: number;
}
```

## Frontend Integration Guide

### Base Configuration

```typescript
const API_BASE_URL = 'http://localhost:3000';
const API_ENDPOINTS = {
  health: '/health',
  ask: '/api/chat/ask',
};
```

### Using Fetch API

```typescript
async function askQuestion(question: string): Promise<ChatResponseData> {
  const response = await fetch(`${API_BASE_URL}/api/chat/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: ChatResponse = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Unknown error occurred');
  }

  return data.data!;
}

// Usage
try {
  const result = await askQuestion('What is AI?');
  console.log('Final Answer:', result.agents.claude.finalAnswer);
  console.log('Reasoning:', result.agents.claude.reasoning);
  console.log('Gemini Response:', result.agents.gemini.response);
  console.log('OpenAI Response:', result.agents.openai.response);
} catch (error) {
  console.error('Error:', error);
}
```

### Using Axios

```typescript
import axios, { AxiosInstance } from 'axios';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

async function askQuestion(question: string): Promise<ChatResponseData> {
  try {
    const response = await apiClient.post<ChatResponse>('/api/chat/ask', {
      question,
    });

    if (!response.data.success) {
      throw new Error(response.data.error);
    }

    return response.data.data!;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || error.message);
    }
    throw error;
  }
}
```

### React Example

```typescript
import { useState } from 'react';
import type { ChatResponseData, AgentResponse } from './types';

function ChatComponent() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ChatResponseData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('http://localhost:3000/api/chat/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        setResponse(data.data);
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-component">
      <form onSubmit={handleSubmit}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          disabled={loading}
          rows={4}
        />
        <button type="submit" disabled={loading || !question.trim()}>
          {loading ? 'Processing...' : 'Ask Question'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div className="response-container">
          {/* Final Answer */}
          <div className="final-answer">
            <h3>Answer</h3>
            <p>{response.agents.claude.finalAnswer}</p>
          </div>

          {/* Reasoning */}
          <div className="reasoning">
            <h4>Reasoning</h4>
            <p>{response.agents.claude.reasoning}</p>
          </div>

          {/* Agent Responses */}
          <details className="agent-responses">
            <summary>View Individual Agent Responses</summary>

            <div className="agent-response">
              <h5>Gemini ({response.agents.gemini.processingTime}ms)</h5>
              {response.agents.gemini.error ? (
                <p className="error">{response.agents.gemini.error}</p>
              ) : (
                <p>{response.agents.gemini.response}</p>
              )}
            </div>

            <div className="agent-response">
              <h5>OpenAI ({response.agents.openai.processingTime}ms)</h5>
              {response.agents.openai.error ? (
                <p className="error">{response.agents.openai.error}</p>
              ) : (
                <p>{response.agents.openai.response}</p>
              )}
            </div>
          </details>

          {/* Metadata */}
          <div className="metadata">
            <small>
              Total processing time: {response.totalProcessingTime}ms
              <br />
              Claude synthesis: {response.agents.claude.processingTime}ms
            </small>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatComponent;
```

### Vue.js Example

```typescript
<template>
  <div class="chat-component">
    <form @submit.prevent="handleSubmit">
      <textarea
        v-model="question"
        placeholder="Ask a question..."
        :disabled="loading"
        rows="4"
      />
      <button type="submit" :disabled="loading || !question.trim()">
        {{ loading ? 'Processing...' : 'Ask Question' }}
      </button>
    </form>

    <div v-if="error" class="error-message">
      <strong>Error:</strong> {{ error }}
    </div>

    <div v-if="response" class="response-container">
      <div class="final-answer">
        <h3>Answer</h3>
        <p>{{ response.agents.claude.finalAnswer }}</p>
      </div>

      <div class="reasoning">
        <h4>Reasoning</h4>
        <p>{{ response.agents.claude.reasoning }}</p>
      </div>

      <details class="agent-responses">
        <summary>View Individual Agent Responses</summary>

        <div class="agent-response">
          <h5>Gemini ({{ response.agents.gemini.processingTime }}ms)</h5>
          <p v-if="response.agents.gemini.error" class="error">
            {{ response.agents.gemini.error }}
          </p>
          <p v-else>{{ response.agents.gemini.response }}</p>
        </div>

        <div class="agent-response">
          <h5>OpenAI ({{ response.agents.openai.processingTime }}ms)</h5>
          <p v-if="response.agents.openai.error" class="error">
            {{ response.agents.openai.error }}
          </p>
          <p v-else>{{ response.agents.openai.response }}</p>
        </div>
      </details>

      <div class="metadata">
        <small>
          Total processing time: {{ response.totalProcessingTime }}ms
        </small>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { ChatResponseData } from './types';

const question = ref('');
const loading = ref(false);
const response = ref<ChatResponseData | null>(null);
const error = ref<string | null>(null);

async function handleSubmit() {
  if (!question.value.trim()) return;

  loading.value = true;
  error.value = null;
  response.value = null;

  try {
    const res = await fetch('http://localhost:3000/api/chat/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: question.value.trim() }),
    });

    const data = await res.json();

    if (data.success) {
      response.value = data.data;
    } else {
      error.value = data.error || 'An error occurred';
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Network error';
  } finally {
    loading.value = false;
  }
}
</script>
```

### Error Handling Best Practices

```typescript
async function askQuestionWithErrorHandling(question: string) {
  try {
    const response = await fetch('http://localhost:3000/api/chat/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });

    // Handle HTTP errors
    if (!response.ok) {
      if (response.status === 400) {
        throw new Error('Invalid question format');
      } else if (response.status === 404) {
        throw new Error('API endpoint not found');
      } else if (response.status === 500) {
        throw new Error('Server error occurred');
      } else {
        throw new Error(`HTTP error ${response.status}`);
      }
    }

    const data = await response.json();

    // Handle API-level errors
    if (!data.success) {
      throw new Error(data.error || 'Unknown API error');
    }

    return data.data;
  } catch (error) {
    // Network errors
    if (error instanceof TypeError) {
      throw new Error('Network error - unable to reach server');
    }

    // Re-throw other errors
    throw error;
  }
}
```

## CORS Configuration

The backend has CORS enabled for all origins in development. For production, update `src/app.ts`:

```typescript
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));
```

## Web Search Capabilities

Both agents have web search enabled:

- **Gemini**: Uses Google Search grounding (`google_search` tool)
- **OpenAI**: Uses OpenAI web search tool

This ensures responses include current, up-to-date information from the web.

## Customization

### Changing Models

Edit the `.env` file:
```env
GEMINI_MODEL=gemini-2.5-flash
OPENAI_MODEL=gpt-5-mini
CLAUDE_MODEL=claude-sonnet-4-5-20250929
```

### Adding More Agents

1. Create a new service file in `src/services/your-agent.service.ts`
2. Add the agent call in `agent.service.ts` (parallel or sequential)
3. Update the response types in `src/types/index.ts`
4. Update the response formatter in `src/models/response.model.ts`

## Development

### TypeScript Compilation

```bash
npm run build
```

### Code Structure

- **Routes**: Define API endpoints
- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic and LLM integrations
- **Models**: Data formatting
- **Config**: Configuration and initialization
- **Types**: TypeScript type definitions

## Performance

- **Parallel Execution**: Gemini and OpenAI run simultaneously, reducing total time
- **Typical Response Time**: 3-5 seconds for most questions
- **Scalability**: Can handle multiple concurrent requests

## Security Notes

- Never commit `.env` file to version control
- Keep API keys secure
- Use environment variables for sensitive data
- Consider rate limiting for production

## Future Enhancements

- Add request caching for repeated questions
- Implement streaming responses
- Add more LLM providers (Llama, Mistral, etc.)
- Add model selection per request
- Add authentication/authorization
- Add request rate limiting
- Add database storage for conversation history

## License

ISC

## Support

For issues or questions, please check the logs for detailed error information.
