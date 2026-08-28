import React from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, AlertOctagon, Layers, Activity, Truck, Cpu, CheckCircle } from 'lucide-react';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Metrics Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '10px', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#ef444420', color: '#ef4444', padding: '10px', borderRadius: '8px' }}>
            <AlertOctagon size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Active Crisis Sectors</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc' }}>{sectors.length}</div>
          </div>
        </div>

        <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '10px', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#3b82f620', color: '#38bdf8', padding: '10px', borderRadius: '8px' }}>
            <Activity size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Triage Reports</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc' }}>
              {sectors.reduce((sum, s) => sum + s.totalReportsCount, 0)}
            </div>
          </div>
        </div>

        <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '10px', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#10b98120', color: '#34d399', padding: '10px', borderRadius: '8px' }}>
            <Truck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Auto Logistics Tasks</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc' }}>{tasks.length}</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Map + Logistics Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1.25fr) minmax(340px, 1fr)', gap: '1.5rem' }}>
        {/* Interactive Map */}
        <div style={{ background: '#1e293b', borderRadius: '12px', padding: '1.25rem', border: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={20} color="#38bdf8" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>
                Disaster Priority Heatmap
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Live Cloud Brain Sync</span>
          </div>

          <div style={{ height: '440px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #334155' }}>
            <MapContainer center={centerCoords} zoom={13} style={{ height: '100%', width: '100%' }}>
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

        {/* Gemini 3.7 Logistics Task Stream */}
        <div style={{ background: '#1e293b', borderRadius: '12px', padding: '1.25rem', border: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={20} color="#f59e0b" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>
                Gemini 3.7 Flash Logistics Tasks
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', background: '#3b82f620', color: '#60a5fa', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
              Agentic Tools Active
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '440px' }}>
            {tasks.map((task) => (
              <div
                key={task.id}
                style={{
                  background: '#0f172a',
                  padding: '1rem',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${getSectorColor(task.priority)}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>{task.title}</span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 800,
                      background: `${getSectorColor(task.priority)}20`,
                      color: getSectorColor(task.priority),
                    }}
                  >
                    {task.priority.toUpperCase()}
                  </span>
                </div>

                {/* Structured Agent Output */}
                <div style={{ background: '#1e293b50', padding: '8px 10px', borderRadius: '6px', border: '1px solid #334155' }}>
                  {renderAgentDescription(task.description)}
                </div>

                <div style={{ fontSize: '0.8rem', color: '#38bdf8', background: '#0369a120', padding: '6px 10px', borderRadius: '6px', border: '1px solid #0284c740' }}>
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
                          padding: '4px 10px',
                          borderRadius: '4px',
                          border: 'none',
                          background: task.status === 'pending' ? '#3b82f6' : '#10b981',
                          color: '#fff',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {task.status === 'pending' ? 'Dispatch Team' : <><CheckCircle size={12} /> Mark Delivered</>}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
