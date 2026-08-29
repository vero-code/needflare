import React from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import type { SectorZone, EmergencyLevel } from '../types';

interface DisasterHeatmapProps {
  sectors: SectorZone[];
  centerCoords?: [number, number];
}

export const DisasterHeatmap: React.FC<DisasterHeatmapProps> = ({
  sectors,
  centerCoords = [25.776, -80.187],
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={20} color="#38bdf8" />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
            Disaster Priority Heatmap
          </h3>
        </div>
        <span style={{ fontSize: '0.75rem', background: '#0284c720', color: '#38bdf8', padding: '3px 8px', borderRadius: '12px', fontWeight: 600 }}>
          Live Cloud Brain Sync
        </span>
      </div>

      <div style={{ minHeight: '580px', height: '100%', borderRadius: '10px', overflow: 'hidden', border: '1px solid #334155' }}>
        <MapContainer center={centerCoords} zoom={13} style={{ height: '100%', minHeight: '580px', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {sectors.map((sector) => (
            <Circle
              key={sector.id}
              center={[sector.coordinates.lat, sector.coordinates.lng]}
              radius={sector.radiusMeters}
              pathOptions={{
                color: getSectorColor(sector.emergencyLevel),
                fillColor: getSectorColor(sector.emergencyLevel),
                fillOpacity: 0.35,
                weight: 2,
              }}
            >
              <Popup>
                <div style={{ color: '#0f172a', padding: '4px' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 700 }}>{sector.name}</h4>
                  <div style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                    Emergency Level:{' '}
                    <strong style={{ color: getSectorColor(sector.emergencyLevel), textTransform: 'uppercase' }}>
                      {sector.emergencyLevel}
                    </strong>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                    Reports: {sector.totalReportsCount} | Active Tasks: {sector.activeTaskCount}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '4px' }}>
                    Dominant Needs: {sector.dominantNeeds.join(', ')}
                  </div>
                </div>
              </Popup>
            </Circle>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};
