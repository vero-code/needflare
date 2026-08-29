import React, { useState } from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Globe, Grid } from 'lucide-react';
import { TacticalGridMap } from './TacticalGridMap';
import type { SectorZone, LogisticsTask, EmergencyLevel } from '../types';

interface DisasterHeatmapProps {
  sectors: SectorZone[];
  tasks?: LogisticsTask[];
  centerCoords?: [number, number];
}

export const DisasterHeatmap: React.FC<DisasterHeatmapProps> = ({
  sectors,
  tasks = [],
  centerCoords = [25.776, -80.187],
}) => {
  const [mapMode, setMapMode] = useState<'GEOGRAPHIC' | 'TACTICAL_GRID'>('TACTICAL_GRID');

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
        gap: '0.75rem',
      }}
    >
      {/* Map Header with Engine Switcher */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          paddingBottom: '0.5rem',
          borderBottom: '1px solid #33415550',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={20} color={mapMode === 'TACTICAL_GRID' ? '#f59e0b' : '#38bdf8'} />
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
            {mapMode === 'TACTICAL_GRID' ? 'Tactical Sector Grid & Priority Map' : 'Disaster Priority Geographic Heatmap'}
          </h3>
        </div>

        {/* Map Engine Mode Switcher Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: '#0f172a',
            padding: '3px',
            borderRadius: '8px',
            border: '1px solid #334155',
          }}
        >
          <button
            type="button"
            onClick={() => setMapMode('TACTICAL_GRID')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: mapMode === 'TACTICAL_GRID' ? '#f59e0b' : 'transparent',
              color: mapMode === 'TACTICAL_GRID' ? '#000' : '#94a3b8',
              transition: 'all 0.15s ease',
            }}
          >
            <Grid size={13} />
            Tactical Grid (Vector)
          </button>

          <button
            type="button"
            onClick={() => setMapMode('GEOGRAPHIC')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: mapMode === 'GEOGRAPHIC' ? '#3b82f6' : 'transparent',
              color: mapMode === 'GEOGRAPHIC' ? '#fff' : '#94a3b8',
              transition: 'all 0.15s ease',
            }}
          >
            <Globe size={13} />
            Geographic (Leaflet)
          </button>
        </div>
      </div>

      {/* Map Content Body */}
      {mapMode === 'TACTICAL_GRID' ? (
        <TacticalGridMap sectors={sectors} tasks={tasks} />
      ) : (
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
      )}
    </div>
  );
};
