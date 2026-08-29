import React, { useState } from 'react';
import { Layers, CheckCircle } from 'lucide-react';
import type { LogisticsTask, EmergencyLevel } from '../types';

interface LogisticsTaskStreamProps {
  tasks: LogisticsTask[];
  onUpdateTaskStatus: (taskId: string, status: LogisticsTask['status']) => void;
}

export const LogisticsTaskStream: React.FC<LogisticsTaskStreamProps> = ({
  tasks,
  onUpdateTaskStatus,
}) => {
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'in_route' | 'delivered'>('all');

  const getPriorityColor = (level: EmergencyLevel) => {
    switch (level) {
      case 'critical':
        return '#ef4444';
      case 'high':
        return '#f97316';
      case 'medium':
        return '#eab308';
      default:
        return '#3b82f6';
    }
  };

  const filteredTasks = tasks.filter((t) => (taskFilter === 'all' ? true : t.status === taskFilter));

  const renderAgentDescription = (text: string) => {
    if (!text.includes('###') && !text.includes('**')) {
      return <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.4' }}>{text}</p>;
    }

    const cleanedLines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.82rem' }}>
        {cleanedLines.map((line, idx) => {
          if (line.startsWith('###') || line.startsWith('##')) {
            const headingText = line.replace(/^[#]+\s*/, '');
            return (
              <div key={idx} style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.85rem', marginTop: idx > 0 ? '4px' : 0 }}>
                {headingText}
              </div>
            );
          }

          if (line.startsWith('-') || line.startsWith('*')) {
            const itemText = line.replace(/^[-*]\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1');
            return (
              <div key={idx} style={{ display: 'flex', gap: '6px', color: '#cbd5e1' }}>
                <span style={{ color: '#38bdf8' }}>•</span>
                <span>{itemText}</span>
              </div>
            );
          }

          const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '$1');
          return (
            <div key={idx} style={{ color: '#cbd5e1', lineHeight: '1.35' }}>
              {formattedLine}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      style={{
        background: '#1e293b',
        borderRadius: '12px',
        padding: '1.25rem',
        border: '1px solid #334155',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={20} color="#f59e0b" />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
            Gemini 3.7 Flash Logistics Stream
          </h3>
        </div>
        <span style={{ fontSize: '0.75rem', background: '#3b82f620', color: '#60a5fa', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
          {filteredTasks.length} missions
        </span>
      </div>

      {/* Quick Filters */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '1rem', background: '#0f172a', padding: '4px', borderRadius: '8px' }}>
        {(['all', 'pending', 'in_route', 'delivered'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setTaskFilter(filter)}
            style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: taskFilter === filter ? '#3b82f6' : 'transparent',
              color: taskFilter === filter ? '#fff' : '#94a3b8',
              textTransform: 'capitalize',
              transition: 'all 0.15s ease',
            }}
          >
            {filter.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Task Scroll List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '530px', paddingRight: '4px' }}>
        {filteredTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontSize: '0.9rem' }}>
            No tasks found in this category.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              style={{
                background: '#0f172a',
                padding: '1rem',
                borderRadius: '10px',
                borderLeft: `5px solid ${getPriorityColor(task.priority)}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                border: '1px solid #33415550',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>{task.title}</span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontWeight: 800,
                    background: `${getPriorityColor(task.priority)}25`,
                    color: getPriorityColor(task.priority),
                  }}
                >
                  {task.priority.toUpperCase()}
                </span>
              </div>

              {/* Structured Agent Output */}
              <div style={{ background: '#1e293b60', padding: '8px 12px', borderRadius: '6px', border: '1px solid #334155' }}>
                {renderAgentDescription(task.description)}
              </div>

              <div style={{ fontSize: '0.8rem', color: '#38bdf8', background: '#0369a125', padding: '6px 10px', borderRadius: '6px', border: '1px solid #0284c740' }}>
                <strong>Allocated Payload:</strong> {task.requiredPayload}
              </div>

              {/* Status Switcher */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', paddingTop: '6px', borderTop: '1px solid #1e293b' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Status: <strong style={{ color: task.status === 'delivered' ? '#34d399' : '#fbbf24' }}>{task.status.replace('_', ' ').toUpperCase()}</strong>
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {task.status !== 'delivered' && (
                    <button
                      onClick={() => onUpdateTaskStatus(task.id, task.status === 'pending' ? 'in_route' : 'delivered')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '5px 12px',
                        borderRadius: '5px',
                        border: 'none',
                        background: task.status === 'pending' ? '#3b82f6' : '#10b981',
                        color: '#fff',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {task.status === 'pending' ? 'Dispatch Team' : <><CheckCircle size={13} /> Mark Delivered</>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
