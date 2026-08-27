export type NeedCategory = 'water' | 'medical' | 'food' | 'shelter' | 'rescue' | 'power';
export type EmergencyLevel = 'critical' | 'high' | 'medium' | 'low';
export type SyncStatus = 'offline_queued' | 'syncing' | 'synced' | 'error';

export interface RawFieldReport {
  id: string;
  volunteerId: string;
  timestamp: number;
  rawText: string;
  sectorId: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface AnonymizedReport {
  id: string;
  timestamp: number;
  sectorId: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  sanitizedSummary: string; // Clear text from PII
  category: NeedCategory;
  estimatedPeopleCount: number;
  preliminaryUrgency: EmergencyLevel;
  piiRemoved: string[]; // List of detected and cut out PII (for security audit)
  syncStatus: SyncStatus;
}

export interface SectorZone {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  radiusMeters: number;
  emergencyLevel: EmergencyLevel;
  totalReportsCount: number;
  dominantNeeds: NeedCategory[];
  activeTaskCount: number;
}

export interface LogisticsTask {
  id: string;
  sectorId: string;
  title: string;
  description: string;
  priority: EmergencyLevel;
  category: NeedCategory;
  requiredPayload: string; // example: "500l of water"
  status: 'pending' | 'in_route' | 'delivered';
  createdAt: number;
}

export interface VeoVisualGuide {
  id: string;
  title: string;
  targetCrisis: NeedCategory;
  generatedPrompt: string;
  videoUrl?: string;
  thumbnailUrl: string;
  keyVisualSteps: string[];
  isBroadcasting: boolean;
}
