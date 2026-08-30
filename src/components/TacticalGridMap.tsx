import React, { useState } from 'react';
import type { SectorZone, LogisticsTask } from '../types';

interface TacticalGridMapProps {
  sectors?: SectorZone[];
  tasks?: LogisticsTask[];
  onSelectSector?: (sectorId: string) => void;
}

const SVG_SECTORS: Record<
  string,
  {
    x: number;
    y: number;
    w: number;
    h: number;
    name: string;
    hazardType?: 'FLOOD' | 'DEBRIS';
    urgencyScore: number;
    totalPeople: number;
    t1Count: number;
    triageCounts: { t1: number; t2: number; t3: number; t4: number };
  }
> = {
  'ALPHA-1': {
    x: 30,
    y: 30,
    w: 200,
    h: 140,
    name: 'Coastal Bay Marina & Base Hub',
    urgencyScore: 32,
    totalPeople: 3,
    t1Count: 0,
    triageCounts: { t1: 0, t2: 1, t3: 2, t4: 0 },
  },
  'ALPHA-2': {
    x: 250,
    y: 30,
    w: 220,
    h: 140,
    name: 'Residential Waterfront Ridge',
    urgencyScore: 45,
    totalPeople: 0,
    t1Count: 0,
    triageCounts: { t1: 0, t2: 0, t3: 0, t4: 0 },
  },
  'BRAVO-1': {
    x: 30,
    y: 190,
    w: 180,
    h: 160,
    name: 'Downtown Commercial Plaza',
    urgencyScore: 68,
    totalPeople: 14,
    t1Count: 2,
    triageCounts: { t1: 2, t2: 4, t3: 6, t4: 2 },
  },
  'BRAVO-2': {
    x: 230,
    y: 190,
    w: 240,
    h: 160,
    name: 'Hospital District / Trauma Center',
    hazardType: 'FLOOD',
    urgencyScore: 94,
    totalPeople: 18,
    t1Count: 7,
    triageCounts: { t1: 7, t2: 6, t3: 3, t4: 2 },
  },
  'BRAVO-3': {
    x: 490,
    y: 190,
    w: 180,
    h: 160,
    name: 'Eastern Rail & Transit Hub',
    urgencyScore: 50,
    totalPeople: 0,
    t1Count: 0,
    triageCounts: { t1: 0, t2: 0, t3: 0, t4: 0 },
  },
  'CHARLIE-1': {
    x: 30,
    y: 370,
    w: 210,
    h: 170,
    name: 'High-Density Residential Sector',
    hazardType: 'DEBRIS',
    urgencyScore: 89,
    totalPeople: 24,
    t1Count: 5,
    triageCounts: { t1: 5, t2: 10, t3: 6, t4: 3 },
  },
  'CHARLIE-2': {
    x: 260,
    y: 370,
    w: 220,
    h: 170,
    name: 'Central Water Reservoir & Works',
    hazardType: 'FLOOD',
    urgencyScore: 72,
    totalPeople: 0,
    t1Count: 0,
    triageCounts: { t1: 0, t2: 0, t3: 0, t4: 0 },
  },
  'DELTA-1': {
    x: 30,
    y: 560,
    w: 240,
    h: 150,
    name: 'South Industrial Logistics Park',
    urgencyScore: 40,
    totalPeople: 0,
    t1Count: 0,
    triageCounts: { t1: 0, t2: 0, t3: 0, t4: 0 },
  },
  'DELTA-2': {
    x: 290,
    y: 560,
    w: 380,
    h: 150,
    name: 'Airport Perimeter & Relief Airstrip',
    urgencyScore: 55,
    totalPeople: 6,
    t1Count: 0,
    triageCounts: { t1: 0, t2: 3, t3: 3, t4: 0 },
  },
};

const SAMPLE_REPORTS = [
  {
    id: 'rep-b2-1',
    sector: 'BRAVO-2',
    anonToken: 'NF-BRAVO-2-T1-9A3F',
    triageLevel: 'T1_IMMEDIATE',
    summary: 'Hospital District [SECTOR_BRAVO-2_SNAP]. 4 injured, critical need for hemostatics and pediatric IV kits.',
    flags: ['Critical Bleeding', 'Backup Oxygen Failed'],
    xOffset: 70,
    yOffset: 95,
  },
  {
    id: 'rep-c1-1',
    sector: 'CHARLIE-1',
    anonToken: 'NF-CHARLIE-1-T1-42C1',
    triageLevel: 'T1_IMMEDIATE',
    summary: 'Apartment collapse [SECTOR_CHARLIE-1_SNAP]. 3 trapped under ceiling slab, severe crushing injuries.',
    flags: ['Risk of Roof Collapse', 'Trauma Resuscitation'],
    xOffset: 85,
    yOffset: 110,
  },
  {
    id: 'rep-c1-2',
    sector: 'CHARLIE-1',
    anonToken: 'NF-CHARLIE-1-T2-77B4',
    triageLevel: 'T2_URGENT',
    summary: 'Basement water ingress [SECTOR_CHARLIE-1_SNAP]. 14 civilians without clean drinking water > 48h.',
    flags: ['No Water > 48h'],
    xOffset: 140,
    yOffset: 125,
  },
  {
    id: 'rep-b1-1',
    sector: 'BRAVO-1',
    anonToken: 'NF-BRAVO-1-T2-11D9',
    triageLevel: 'T2_URGENT',
    summary: 'Commercial shelter [SECTOR_BRAVO-1_SNAP]. 12 elderly residents requiring insulin.',
    flags: ['Insulin < 4 Hours'],
    xOffset: 100,
    yOffset: 100,
  },
];

export const TacticalGridMap: React.FC<TacticalGridMapProps> = ({
  sectors: _sectors = [],
  tasks: _tasks = [],
  onSelectSector,
}) => {
  const [selectedSectorId, setSelectedSectorId] = useState<string>('BRAVO-2');
  const [triageFilter, setTriageFilter] = useState<string>('ALL');
  const [showRoutes, setShowRoutes] = useState<boolean>(true);

  const filteredReports = SAMPLE_REPORTS.filter((r) => {
    if (triageFilter === 'ALL') return true;
    return r.triageLevel === triageFilter;
  });

  const getUrgencyColor = (score: number, isSelected: boolean) => {
    if (isSelected) return { fill: '#f59e0b25', stroke: '#f59e0b', strokeWidth: 3 };
    if (score >= 85) return { fill: '#ef444420', stroke: '#ef4444', strokeWidth: 2 };
    if (score >= 60) return { fill: '#f59e0b15', stroke: '#f59e0b', strokeWidth: 1.5 };
    if (score >= 40) return { fill: '#eab30815', stroke: '#eab308', strokeWidth: 1.5 };
    return { fill: '#10b98115', stroke: '#10b981', strokeWidth: 1.5 };
  };

  const handleSectorClick = (secId: string) => {
    setSelectedSectorId(secId);
    if (onSelectSector) onSelectSector(secId);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Tactical Controls & Filter */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          background: '#0f172a',
          padding: '6px 10px',
          borderRadius: '8px',
          border: '1px solid #334155',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>TRIAGE FILTER:</span>
          <select
            value={triageFilter}
            onChange={(e) => setTriageFilter(e.target.value)}
            style={{
              background: '#1e293b',
              color: '#fff',
              border: '1px solid #334155',
              borderRadius: '5px',
              padding: '4px 8px',
              fontSize: '0.72rem',
              fontWeight: 700,
              outline: 'none',
            }}
          >
            <option value="ALL">ALL LEVELS ({SAMPLE_REPORTS.length})</option>
            <option value="T1_IMMEDIATE">T1 IMMEDIATE (RED)</option>
            <option value="T2_URGENT">T2 URGENT (YELLOW)</option>
            <option value="T3_DELAYED">T3 DELAYED</option>
            <option value="T4_STABLE">T4 STABLE</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => setShowRoutes((v) => !v)}
          style={{
            padding: '4px 10px',
            borderRadius: '5px',
            border: 'none',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
            background: showRoutes ? '#f59e0b' : '#334155',
            color: showRoutes ? '#000' : '#cbd5e1',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.15s ease',
          }}
        >
          {showRoutes ? '✓ ROUTES ON' : 'ROUTES OFF'}
        </button>
      </div>

      {/* SVG Tactical Vector Canvas */}
      <div
        style={{
          background: '#090d16',
          borderRadius: '10px',
          border: '1px solid #334155',
          padding: '6px',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '520px',
        }}
      >
        {/* Coordinates Overlay */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            zIndex: 10,
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid #334155',
            borderRadius: '5px',
            padding: '3px 8px',
            fontSize: '0.68rem',
            color: '#34d399',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 700,
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
          UTM WGS-84 (GRID-SNAP)
        </div>

        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 10,
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid #334155',
            borderRadius: '5px',
            padding: '3px 8px',
            fontSize: '0.68rem',
            color: '#f59e0b',
            fontWeight: 700,
          }}
        >
          BASE HUB: ALPHA-1
        </div>

        <svg
          viewBox="0 0 700 740"
          style={{ width: '100%', height: 'auto', minHeight: '500px', display: 'block', userSelect: 'none' }}
        >
          <defs>
            <pattern id="tacticalGrid2" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" />
            </pattern>
            <pattern id="floodHatch2" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M-1,1 l2,-2 M0,10 l10,-10 M9,11 l2,-2" stroke="#06b6d4" strokeWidth="1.2" opacity="0.45" />
            </pattern>
            <pattern id="debrisHatch2" width="12" height="12" patternUnits="userSpaceOnUse">
              <path d="M 0 0 L 12 12 M 12 0 L 0 12" stroke="#ef4444" strokeWidth="1.2" opacity="0.45" />
            </pattern>
          </defs>

          <rect width="700" height="740" fill="url(#tacticalGrid2)" />

          {/* Sectors */}
          {Object.entries(SVG_SECTORS).map(([secId, geo]) => {
            const isSelected = selectedSectorId === secId;
            const styling = getUrgencyColor(geo.urgencyScore, isSelected);

            return (
              <g key={secId} onClick={() => handleSectorClick(secId)} style={{ cursor: 'pointer' }}>
                <rect
                  x={geo.x}
                  y={geo.y}
                  width={geo.w}
                  height={geo.h}
                  rx={6}
                  fill={styling.fill}
                  stroke={styling.stroke}
                  strokeWidth={styling.strokeWidth}
                  style={{ transition: 'all 0.15s ease' }}
                />

                {geo.hazardType === 'FLOOD' && (
                  <rect
                    x={geo.x + 4}
                    y={geo.y + 4}
                    width={geo.w - 8}
                    height={geo.h - 8}
                    rx={4}
                    fill="url(#floodHatch2)"
                    pointerEvents="none"
                  />
                )}
                {geo.hazardType === 'DEBRIS' && (
                  <rect
                    x={geo.x + 4}
                    y={geo.y + 4}
                    width={geo.w - 8}
                    height={geo.h - 8}
                    rx={4}
                    fill="url(#debrisHatch2)"
                    pointerEvents="none"
                  />
                )}

                <text
                  x={geo.x + 12}
                  y={geo.y + 24}
                  fill={isSelected ? '#f59e0b' : '#f8fafc'}
                  fontSize="13"
                  fontFamily="monospace"
                  fontWeight="800"
                >
                  [{secId}] {geo.urgencyScore >= 85 ? '🔥 CRITICAL' : ''}
                </text>

                <text
                  x={geo.x + 12}
                  y={geo.y + 42}
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  REPORTS: {geo.triageCounts.t1 + geo.triageCounts.t2} | VICTIMS: {geo.totalPeople}
                </text>

                {geo.t1Count > 0 && (
                  <g transform={`translate(${geo.x + geo.w - 28}, ${geo.y + 24})`}>
                    <circle r="10" fill="#ef4444" opacity="0.6">
                      <animate attributeName="r" values="8;13;8" dur="1.8s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.7;0.2;0.7" dur="1.8s" repeatCount="indefinite" />
                    </circle>
                    <circle r="7" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                    <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="900" fontFamily="monospace">
                      !
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Dispatch Corridors */}
          {showRoutes && (
            <g pointerEvents="none">
              <path
                d="M 130 100 Q 240 130 350 270"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="3"
                strokeDasharray="6 4"
              />
              <path
                d="M 130 100 Q 110 250 135 450"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3"
                strokeDasharray="6 4"
              />
              <circle cx="130" cy="100" r="9" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
              <circle cx="130" cy="100" r="4" fill="#3b82f6" />
              <text x="145" y="104" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="800">
                HUB &quot;NORTH&quot; (BASE)
              </text>
            </g>
          )}

          {/* Pins */}
          {filteredReports.map((r) => {
            const secGeo = SVG_SECTORS[r.sector] || SVG_SECTORS['BRAVO-2'];
            const pinX = secGeo.x + r.xOffset;
            const pinY = secGeo.y + r.yOffset;

            let pinColor = '#10b981';
            if (r.triageLevel === 'T1_IMMEDIATE') pinColor = '#ef4444';
            else if (r.triageLevel === 'T2_URGENT') pinColor = '#f59e0b';

            return (
              <g key={r.id} style={{ cursor: 'pointer' }} onClick={() => handleSectorClick(r.sector)}>
                {r.triageLevel === 'T1_IMMEDIATE' && (
                  <circle cx={pinX} cy={pinY} r="10" fill="#ef4444" opacity="0.4">
                    <animate attributeName="r" values="8;14;8" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle cx={pinX} cy={pinY} r="6" fill={pinColor} stroke="#ffffff" strokeWidth="1.5" />
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div
          style={{
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px solid #1e293b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            fontSize: '0.72rem',
            color: '#94a3b8',
            fontFamily: 'monospace',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
              T1 Immediate
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
              T2 Urgent
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308', display: 'inline-block' }} />
              T3 Delayed
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              T4 Stable
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#06b6d4' }}>/// Flood Zone</span>
            <span style={{ color: '#ef4444' }}>XXX Debris Hazard</span>
          </div>
        </div>
      </div>
    </div>
  );
};
