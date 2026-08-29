import React from 'react';
import { MetricsBanner } from './MetricsBanner';
import { DisasterHeatmap } from './DisasterHeatmap';
import { LogisticsTaskStream } from './LogisticsTaskStream';
import { IncidentEventStream } from './IncidentEventStream';
import type { SectorZone, LogisticsTask, AnonymizedReport } from '../types';

interface CoordinatorDashboardProps {
  sectors: SectorZone[];
  tasks: LogisticsTask[];
  reports: AnonymizedReport[];
  onUpdateTaskStatus: (taskId: string, status: LogisticsTask['status']) => void;
}

export const CoordinatorDashboard: React.FC<CoordinatorDashboardProps> = ({
  sectors,
  tasks,
  reports,
  onUpdateTaskStatus,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* 1. Top Metrics Banner */}
      <MetricsBanner sectors={sectors} tasks={tasks} />

      {/* 2. Main Operations Grid: Left (Map with switch) + Right (Old Logistics Stream) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(450px, 1.18fr) minmax(400px, 1fr)', gap: '1.25rem' }}>
        {/* Left Block: Map with embedded switcher */}
        <DisasterHeatmap sectors={sectors} tasks={tasks} />

        {/* Right Block: Single old logistics task stream */}
        <LogisticsTaskStream tasks={tasks} onUpdateTaskStatus={onUpdateTaskStatus} />
      </div>

      {/* 3. Live Incident & Event Log — real data from submitted reports */}
      <IncidentEventStream reports={reports} tasks={tasks} />
    </div>
  );
};
