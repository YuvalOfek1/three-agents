import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';
import type { Message, ChatResponse } from './types';

const API_BASE_URL = 'http://localhost:3000';


function App() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim() || loading) return;

    const currentQuestion = question.trim();
    const messageId = Date.now().toString();

    const newMessage: Message = {
      id: messageId,
      question: currentQuestion,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setQuestion('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: currentQuestion }),
      });

      const data: ChatResponse = await response.json();

      if (data.success && data.data) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, response: data.data }
              : msg
          )
        );
      } else {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, error: data.error || 'An error occurred' }
              : msg
          )
        );
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                error:
                  err instanceof Error
                    ? err.message
                    : 'Network error - unable to reach server',
              }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Multi-Agent Decision System</h1>
        <p className="subtitle">
          Ask questions and get comprehensive answers from Gemini, OpenAI, and Claude
        </p>
      </header>

      <div className="chat-container">
        <div className="messages-area">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <h2>Start a conversation</h2>
              <p>Ask any question and our AI agents will provide comprehensive answers</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="message-block">
                <div className="question-block">
                  <div className="question-label">Your Question</div>
                  <div className="question-text">{message.question}</div>
                </div>

                {message.error ? (
                  <div className="error-block">
                    <div className="error-icon">⚠️</div>
                    <div className="error-message">
                      <strong>Error:</strong> {message.error}
                    </div>
                  </div>
                ) : message.response ? (
                  <div className="response-block">
                    <div className="final-answer-section">
                      <div className="section-header claude-header">
                        <span className="agent-icon">🤖</span>
                        <h3>Final Answer (Claude)</h3>
                        <span className="processing-time">
                          {message.response.agents.claude.processingTime}ms
                        </span>
                      </div>
                      <div className="final-answer-content markdown-content">
                        <ReactMarkdown>{message.response.agents.claude.finalAnswer}</ReactMarkdown>
                      </div>
                      <details className="reasoning-section">
                        <summary className="reasoning-label">
                          <span className="summary-icon">▶</span>
                          <span>View Reasoning</span>
                        </summary>
                        <div className="reasoning-content markdown-content">
                          <ReactMarkdown>{message.response.agents.claude.reasoning}</ReactMarkdown>
                        </div>
                      </details>
                    </div>

                    <div className="agents-grid">
                      <div className="agent-card gemini-card">
                        <div className="agent-card-header">
                          <div className="agent-name">
                            <span className="agent-icon">✨</span>
                            <h4>Gemini</h4>
                          </div>
                          <span className="processing-time">
                            {message.response.agents.gemini.processingTime}ms
                          </span>
                        </div>
                        <div className="agent-content markdown-content">
                          {message.response.agents.gemini.error ? (
                            <div className="agent-error">
                              {message.response.agents.gemini.error}
                            </div>
                          ) : (
                            <ReactMarkdown>{message.response.agents.gemini.response}</ReactMarkdown>
                          )}
                        </div>
                      </div>

                      <div className="agent-card openai-card">
                        <div className="agent-card-header">
                          <div className="agent-name">
                            <span className="agent-icon">🔮</span>
                            <h4>OpenAI</h4>
                          </div>
                          <span className="processing-time">
                            {message.response.agents.openai.processingTime}ms
                          </span>
                        </div>
                        <div className="agent-content markdown-content">
                          {message.response.agents.openai.error ? (
                            <div className="agent-error">
                              {message.response.agents.openai.error}
                            </div>
                          ) : (
                            <ReactMarkdown>{message.response.agents.openai.response}</ReactMarkdown>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="metadata">
                      <div className="metadata-item">
                        <span className="metadata-label">Total Processing Time:</span>
                        <span className="metadata-value">
                          {message.response.totalProcessingTime}ms
                        </span>
                      </div>
                      <div className="metadata-item">
                        <span className="metadata-label">Timestamp:</span>
                        <span className="metadata-value">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="loading-block">
                    <div className="loading-spinner"></div>
                    <div className="loading-text">
                      Consulting AI agents... This may take a few seconds
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <form className="input-form" onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question... (e.g., What are the latest developments in quantum computing?)"
              disabled={loading}
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="submit-button"
            >
              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  Processing...
                </>
              ) : (
                <>
                  <span>Send</span>
                  <span className="send-icon">→</span>
                </>
              )}
            </button>
          </div>
          <div className="input-hint">
            Press Enter to send, Shift+Enter for new line
          </div>
        </form>
      </div>
    </div>
  );
}


export default App;