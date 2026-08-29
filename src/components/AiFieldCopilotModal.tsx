import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Send, Bot, User, X, AlertCircle } from 'lucide-react';

interface AiFieldCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
  time: string;
}

const QUICK_QUERIES = [
  'What is the standard water triage quota for 6 trapped citizens?',
  'Recommend priority routes for flooded Sector Alpha (Miami Marina)',
  'How should insulin be transported without power grid?',
  'Status of universal Veo broadcast for water decontamination',
];

export const AiFieldCopilotModal: React.FC<AiFieldCopilotModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'Hello, Field Responder. I am your Gemini 3.7 Flash Disaster Copilot. You can ask me about triage protocols, route recommendations, payload estimations, or Veo survival broadcasts.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Real Gemini 3.7 Flash call via GenKit agent server
    const AGENT_URL = (import.meta as any).env?.VITE_AGENT_URL || 'http://localhost:8080';
    try {
      const response = await fetch(`${AGENT_URL}/needflareTriageFlow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            sanitizedReport: textToSend,
            sectorId: 'coordinator-copilot-query',
            estimatedPeople: 1,
          },
        }),
      });

      let reply = 'Gemini agent offline — check server connection.';
      if (response.ok) {
        const data = await response.json();
        reply = data.result?.agentReasoning || 'Agent processed the request but returned no reasoning.';
      }

      const botMsg: Message = {
        role: 'assistant',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      // Fallback if server is completely unreachable
      const botMsg: Message = {
        role: 'assistant',
        text: '⚠️ Gemini 3.7 server unreachable. Start the agent server with `npm run server` on port 8080.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: '#0f172a',
          border: '1px solid #334155',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '650px',
          height: '620px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: '#1e293b',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #334155',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#8b5cf620', padding: '8px', borderRadius: '8px' }}>
              <Sparkles size={20} color="#a78bfa" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                Gemini 3.7 Disaster Copilot
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Field Commander & Volunteer Decision Support
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Query Chips */}
        <div style={{ padding: '8px 12px', background: '#0b1329', borderBottom: '1px solid #1e293b', display: 'flex', gap: '6px', overflowX: 'auto' }}>
          {QUICK_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                color: '#cbd5e1',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.7rem',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Messages Body */}
        <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start',
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
              }}
            >
              {m.role === 'assistant' && (
                <div style={{ background: '#8b5cf620', padding: '6px', borderRadius: '6px', flexShrink: 0 }}>
                  <Bot size={16} color="#a78bfa" />
                </div>
              )}
              <div
                style={{
                  background: m.role === 'user' ? '#3b82f6' : '#1e293b',
                  color: '#f8fafc',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  lineHeight: '1.4',
                  border: m.role === 'user' ? 'none' : '1px solid #334155',
                }}
              >
                {m.role === 'assistant' ? (
                  <div className="markdown-rationale">
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </div>
                ) : (
                  m.text
                )}
                <div style={{ fontSize: '0.65rem', color: m.role === 'user' ? '#dbeafe' : '#64748b', marginTop: '4px', textAlign: 'right' }}>
                  {m.time}
                </div>
              </div>
              {m.role === 'user' && (
                <div style={{ background: '#3b82f620', padding: '6px', borderRadius: '6px', flexShrink: 0 }}>
                  <User size={16} color="#60a5fa" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
              <Sparkles size={16} color="#a78bfa" className="animate-spin" />
              <span>Gemini 3.7 synthesizing tactical guidance...</span>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div
          style={{
            padding: '12px',
            background: '#1e293b',
            borderTop: '1px solid #334155',
            display: 'flex',
            gap: '8px',
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Gemini 3.7 about triage, routes, or logistics..."
            style={{
              flex: 1,
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '10px 12px',
              color: '#f8fafc',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
          <button
            onClick={() => handleSend()}
            style={{
              background: '#3b82f6',
              border: 'none',
              borderRadius: '8px',
              padding: '0 16px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
