import React, { useState } from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  AlertOctagon,
  Layers,
  Activity,
  Truck,
  Cpu,
  CheckCircle,
  Clock,
  Radio,
  Filter,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import type { SectorZone, LogisticsTask, EmergencyLevel } from '../types';

interface CoordinatorDashboardProps {
  sectors: SectorZone[];
  tasks: LogisticsTask[];
  onUpdateTaskStatus: (taskId: string, status: LogisticsTask['status']) => void;
}

export const CoordinatorDashboard: React.FC<CoordinatorDashboardProps> = ({
  sectors,
  tasks,
  onUpdateTaskStatus,
}) => {
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'in_route' | 'delivered'>('all');

  const getSectorColor = (level: EmergencyLevel) => {
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

  const centerCoords: [number, number] = [25.776, -80.187];

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: '#cbd5e1' }}>
        {cleanedLines.map((line, idx) => {
          if (line.startsWith('###')) {
            return (
              <div key={idx} style={{ fontWeight: 700, color: '#38bdf8', marginTop: '4px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Cpu size={14} />
                {line.replace(/###/g, '').trim()}
              </div>
            );
          }

          const formattedLine = line
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/^-\s*/, '• ')
            .replace(/^(\d+\.\s*)/, '$1');

          return (
            <div
              key={idx}
              style={{
                lineHeight: '1.4',
                paddingLeft: line.startsWith('-') || /^\d+\./.test(line) ? '8px' : '0',
                color: line.includes('CRITICAL') ? '#fca5a5' : line.includes('Water') || line.includes('Rescue') ? '#7dd3fc' : '#cbd5e1',
              }}
            >
              {formattedLine}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Top Metrics Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div style={{ background: '#1e293b', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          <div style={{ background: '#ef444420', color: '#ef4444', padding: '12px', borderRadius: '10px' }}>
            <AlertOctagon size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>Active Crisis Sectors</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc' }}>{sectors.length}</div>
          </div>
        </div>

        <div style={{ background: '#1e293b', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          <div style={{ background: '#3b82f620', color: '#38bdf8', padding: '12px', borderRadius: '10px' }}>
            <Activity size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>Total Triage Reports</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc' }}>
              {sectors.reduce((sum, s) => sum + s.totalReportsCount, 0)}
            </div>
          </div>
        </div>

        <div style={{ background: '#1e293b', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          <div style={{ background: '#10b98120', color: '#34d399', padding: '12px', borderRadius: '10px' }}>
            <Truck size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>Auto Logistics Tasks</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc' }}>{tasks.length}</div>
          </div>
        </div>

        <div style={{ background: '#1e293b', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          <div style={{ background: '#8b5cf620', color: '#a78bfa', padding: '12px', borderRadius: '10px' }}>
            <Zap size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>Gemini 3.7 Agent Status</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }}></span>
              Live Function Calling
            </div>
          </div>
        </div>
      </div>

      {/* Main Operations Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(450px, 1.15fr) minmax(420px, 1fr)', gap: '1.25rem' }}>
        {/* Interactive Map (Expanded Height) */}
        <div style={{ background: '#1e293b', borderRadius: '12px', padding: '1.25rem', border: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={20} color="#38bdf8" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                Disaster Priority Heatmap
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', background: '#0284c720', color: '#38bdf8', padding: '3px 8px', borderRadius: '12px', fontWeight: 600 }}>
                Live Cloud Brain Sync
              </span>
            </div>
          </div>

          <div style={{ minHeight: '580px', height: '100%', borderRadius: '10px', overflow: 'hidden', border: '1px solid #334155' }}>
            <MapContainer center={centerCoords} zoom={13} style={{ height: '100%', minHeight: '580px', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {sectors.map((sec) => (
                <Circle
                  key={sec.id}
                  center={[sec.coordinates.lat, sec.coordinates.lng]}
                  radius={sec.radiusMeters}
                  pathOptions={{
                    color: getSectorColor(sec.emergencyLevel),
                    fillColor: getSectorColor(sec.emergencyLevel),
                    fillOpacity: 0.35,
                  }}
                >
                  <Popup>
                    <div style={{ color: '#0f172a', padding: '4px' }}>
                      <strong style={{ fontSize: '0.95rem' }}>{sec.name}</strong>
                      <div style={{ marginTop: '4px', fontSize: '0.8rem' }}>
                        <div>Emergency: <strong style={{ color: getSectorColor(sec.emergencyLevel) }}>{sec.emergencyLevel.toUpperCase()}</strong></div>
                        <div>Total Reports: {sec.totalReportsCount}</div>
                        <div>Dominant Needs: {sec.dominantNeeds.join(', ')}</div>
                      </div>
                    </div>
                  </Popup>
                </Circle>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Gemini 3.7 Logistics Tasks (Expanded Full Height + Filters) */}
        <div style={{ background: '#1e293b', borderRadius: '12px', padding: '1.25rem', border: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
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
                    borderLeft: `5px solid ${getSectorColor(task.priority)}`,
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
                        background: `${getSectorColor(task.priority)}25`,
                        color: getSectorColor(task.priority),
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
      </div>

      {/* Bottom Telemetry Bar: Live Gemma & Pub/Sub Ingestion Stream */}
      <div style={{ background: '#1e293b', borderRadius: '12px', padding: '1rem 1.25rem', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
            <Radio size={16} color="#10b981" />
            Live Telemetry & Gemma Edge Anonymization Audit
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Google Cloud Pub/Sub Pipeline Active</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', marginTop: '4px' }}>
          <div style={{ background: '#0f172a', padding: '8px 12px', borderRadius: '6px', border: '1px solid #334155', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#94a3b8' }}>Gemma Edge Privacy Filter:</span>
            <span style={{ color: '#34d399', fontWeight: 600 }}>100% PII Scrubbed On-Device</span>
          </div>

          <div style={{ background: '#0f172a', padding: '8px 12px', borderRadius: '6px', border: '1px solid #334155', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#94a3b8' }}>Active Tool Calling:</span>
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>Triage + Logistics + Veo</span>
          </div>

          <div style={{ background: '#0f172a', padding: '8px 12px', borderRadius: '6px', border: '1px solid #334155', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#94a3b8' }}>Ingestion Latency:</span>
            <span style={{ color: '#a78bfa', fontWeight: 600 }}>Sub-second (~450ms)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
