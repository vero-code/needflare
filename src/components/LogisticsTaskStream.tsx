import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Layers,
  CheckCircle,
  Truck,
  Anchor,
  Compass,
  Wind,
  AlertTriangle,
  Clock,
  Package,
  Navigation,
} from 'lucide-react';
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

  const getTransportIcon = (mode?: LogisticsTask['transportMode']) => {
    switch (mode) {
      case 'BOAT_AMPHIBIOUS':
        return <Anchor size={14} color="#06b6d4" />;
      case 'OFFROAD_SQUAD':
        return <Compass size={14} color="#f59e0b" />;
      case 'DRONE_AIRDROP':
        return <Wind size={14} color="#c084fc" />;
      case '4x4_TRUCK':
      default:
        return <Truck size={14} color="#38bdf8" />;
    }
  };

  const filteredTasks = tasks
    .filter((t) => (taskFilter === 'all' ? true : t.status === taskFilter))
    .sort((a, b) => {
      // AI-generated tasks float to top, then sort by createdAt descending
      const aAI = (a as any).aiGenerated ? 1 : 0;
      const bAI = (b as any).aiGenerated ? 1 : 0;
      if (bAI !== aAI) return bAI - aAI;
      return b.createdAt - a.createdAt;
    });
  const nowMs = Date.now();
  const isLive = (task: LogisticsTask) =>
    !!(task as any).aiGenerated && (nowMs - task.createdAt) < 30 * 60 * 1000;

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
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
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
              fontWeight: 700,
              cursor: 'pointer',
              background: taskFilter === filter ? '#3b82f6' : 'transparent',
              color: taskFilter === filter ? '#fff' : '#94a3b8',
              textTransform: 'capitalize',
              transition: 'all 0.15s ease',
            }}
          >
            {filter === 'all' ? `All (${tasks.length})` : filter.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Task Scroll List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.9rem', maxHeight: '580px', paddingRight: '4px' }}>
        {filteredTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b', fontSize: '0.9rem' }}>
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
              {/* Header: Title + Sector & Priority Badges */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '6px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', fontWeight: 800, background: '#1e293b', color: '#38bdf8', padding: '1px 6px', borderRadius: '3px' }}>
                      {task.id.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', fontWeight: 800, background: '#f59e0b20', color: '#fbbf24', padding: '1px 6px', borderRadius: '3px' }}>
                      SECTOR: {task.sectorId.toUpperCase()}
                    </span>
                    {((task as any).aiGenerated || (!['task-101', 'task-102', 'task-103', 'task-104'].includes(task.id))) && (
                      <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', fontWeight: 800, background: '#6366f125', color: '#a78bfa', padding: '1px 6px', borderRadius: '3px', border: '1px solid #6366f150' }}>
                        🤖 GEMINI AGENT DISPATCH
                      </span>
                    )}
                    {isLive(task) && (
                      <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', fontWeight: 800, background: '#10b98125', color: '#34d399', padding: '1px 8px', borderRadius: '3px', border: '1px solid #10b98150' }}>
                        ✨ NEW
                      </span>
                    )}
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f8fafc' }}>{task.title}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 800,
                      background: `${getPriorityColor(task.priority)}25`,
                      color: getPriorityColor(task.priority),
                    }}
                  >
                    {task.priority.toUpperCase()}
                  </span>

                  {task.status === 'in_route' && task.etaMinutes && (
                    <span style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '3px', background: '#0284c720', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      <Clock size={11} /> ETA {task.etaMinutes}m
                    </span>
                  )}
                </div>
              </div>

              {/* Rationale / Description */}
              <div style={{ background: '#090d16', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>AI DECISION RATIONALE:</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.55' }} className="markdown-rationale">
                  <ReactMarkdown>{task.description}</ReactMarkdown>
                </div>
              </div>

              {/* Cargo / Allocated Payload Breakdown */}
              <div style={{ background: '#1e293b70', padding: '8px 10px', borderRadius: '6px', border: '1px solid #334155' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Package size={13} />
                  CARGO / ALLOCATED PAYLOAD:
                </div>
                {task.payloadItems && task.payloadItems.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {task.payloadItems.map((item, idx) => (
                      <div key={idx} style={{ fontSize: '0.75rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ color: '#38bdf8' }}>•</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.75rem', color: '#e2e8f0' }}>{task.requiredPayload}</div>
                )}
              </div>

              {/* Crew & Transport Mode */}
              {task.assignedSquad && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#94a3b8' }}>
                  {getTransportIcon(task.transportMode)}
                  <span>
                    Crew: <strong style={{ color: '#f1f5f9' }}>{task.assignedSquad}</strong>
                    {task.transportMode ? ` (${task.transportMode.replace('_', ' ')})` : ''}
                  </span>
                </div>
              )}

              {/* Recommended Corridor & Terrain Warning */}
              {task.recommendedRoute && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#cbd5e1' }}>
                  <Navigation size={12} color="#f59e0b" />
                  <span>
                    Corridor: <strong style={{ color: '#fde68a' }}>{task.recommendedRoute}</strong>
                  </span>
                </div>
              )}

              {task.terrainWarning && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', color: '#f87171', background: '#ef444415', padding: '4px 8px', borderRadius: '4px', border: '1px solid #ef444430' }}>
                  <AlertTriangle size={12} />
                  <span>{task.terrainWarning}</span>
                </div>
              )}

              {/* Status Switcher Action Button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px', paddingTop: '6px', borderTop: '1px solid #1e293b' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Status: <strong style={{ color: task.status === 'delivered' ? '#34d399' : task.status === 'in_route' ? '#38bdf8' : '#fbbf24' }}>
                    {task.status === 'delivered' ? 'DELIVERED (CARGO HANDED OVER)' : task.status === 'in_route' ? 'IN ROUTE' : 'PENDING DISPATCH'}
                  </strong>
                </span>

                <div style={{ display: 'flex', gap: '4px' }}>
                  {task.status !== 'delivered' && (
                    <button
                      onClick={() => onUpdateTaskStatus(task.id, task.status === 'pending' ? 'in_route' : 'delivered')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: task.status === 'pending' ? '#3b82f6' : '#10b981',
                        color: '#fff',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {task.status === 'pending' ? (
                        <>
                          <Truck size={13} />
                          <span>Accept &amp; Dispatch</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={13} />
                          <span>Confirm Delivery</span>
                        </>
                      )}
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
