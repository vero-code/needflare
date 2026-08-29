import React from 'react';
import { MetricsBanner } from './MetricsBanner';
import { DisasterHeatmap } from './DisasterHeatmap';
import { LogisticsTaskStream } from './LogisticsTaskStream';
import { IncidentEventStream } from './IncidentEventStream';
import type { SectorZone, LogisticsTask } from '../types';

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
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* 1. Top Metrics Banner */}
      <MetricsBanner sectors={sectors} tasks={tasks} />

      {/* 2. Main Operations Grid: Map + Logistics Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(450px, 1.15fr) minmax(420px, 1fr)', gap: '1.25rem' }}>
        <DisasterHeatmap sectors={sectors} />
        <LogisticsTaskStream tasks={tasks} onUpdateTaskStatus={onUpdateTaskStatus} />
      </div>

      {/* 3. Live Incident & Event Log */}
      <IncidentEventStream />
    </div>
  );
};
