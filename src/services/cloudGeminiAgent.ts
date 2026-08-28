import type { AnonymizedReport, SectorZone, LogisticsTask, VeoVisualGuide, NeedCategory, EmergencyLevel } from '../types';

export class CloudGeminiAgent {
  public static initialSectors: SectorZone[] = [
    {
      id: 'sector-alpha',
      name: 'Sector Alpha (Biscayne Coastal Shore)',
      coordinates: { lat: 25.7617, lng: -80.1918 },
      radiusMeters: 950,
      emergencyLevel: 'critical',
      totalReportsCount: 14,
      dominantNeeds: ['water', 'rescue'],
      activeTaskCount: 2,
    },
    {
      id: 'sector-bravo',
      name: 'Sector Bravo (Downtown Riverwalk)',
      coordinates: { lat: 25.7750, lng: -80.1890 },
      radiusMeters: 750,
      emergencyLevel: 'high',
      totalReportsCount: 9,
      dominantNeeds: ['medical', 'power'],
      activeTaskCount: 1,
    },
    {
      id: 'sector-delta',
      name: 'Sector Delta (North Harbor Logistics)',
      coordinates: { lat: 25.7920, lng: -80.1780 },
      radiusMeters: 650,
      emergencyLevel: 'medium',
      totalReportsCount: 4,
      dominantNeeds: ['food', 'shelter'],
      activeTaskCount: 1,
    },
  ];

  public static initialTasks: LogisticsTask[] = [
    {
      id: 'task-101',
      sectorId: 'sector-alpha',
      title: 'Urgent delivery of drinking water and filters',
      description: 'Aggregated request from 14 points: flooding of the central water supply.',
      priority: 'critical',
      category: 'water',
      requiredPayload: '1200 l of water, 80 portable filtration kits',
      status: 'in_route',
      createdAt: Date.now() - 3600000,
    },
    {
      id: 'task-102',
      sectorId: 'sector-bravo',
      title: 'Mobile first aid team and generator',
      description: 'Power line damage, 3 people injured by shrapnel, power needed to store insulin.',
      priority: 'high',
      category: 'medical',
      requiredPayload: '1 kW gasoline generator, tactical medicine kits',
      status: 'pending',
      createdAt: Date.now() - 1800000,
    },
  ];

  /**
   * Gemini Taskmaster: processing incoming anonymized reports through Genkit Flow
  */
  public static async processCloudTriage(
    newReport: AnonymizedReport,
    currentSectors: SectorZone[],
    currentTasks: LogisticsTask[]
  ): Promise<{
    updatedSectors: SectorZone[];
    generatedTask?: LogisticsTask;
    triggeredVeoPrompt?: string;
    agentReasoning?: string;
  }> {
    let agentReasoning = '';
    let triggeredVeoPrompt: string | undefined;

    // 1. Attempt to call the real Genkit Gemini 3.7 Flash agent through the backend
    try {
      const response = await fetch('http://localhost:8080/needflareTriageFlow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            sanitizedReport: newReport.sanitizedSummary,
            sectorId: newReport.sectorId,
            estimatedPeople: newReport.estimatedPeopleCount,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🤖 [Genkit Gemini 3.7 Response]:', data);
        agentReasoning = data.result?.agentReasoning || '';
      }
    } catch (err) {
      console.warn('⚠️ Genkit server offline, using client-side fallback:', err);
    }

    // 2. Updating sector state
    let targetSector = currentSectors.find((s) => s.id === newReport.sectorId);
    let updatedSectors = [...currentSectors];

    if (targetSector) {
      const isCritical = newReport.preliminaryUrgency === 'critical' || targetSector.emergencyLevel === 'critical';
      const updatedSector: SectorZone = {
        ...targetSector,
        totalReportsCount: targetSector.totalReportsCount + 1,
        emergencyLevel: isCritical ? 'critical' : targetSector.emergencyLevel,
        dominantNeeds: Array.from(new Set([...targetSector.dominantNeeds, newReport.category])),
        activeTaskCount: targetSector.activeTaskCount + (newReport.preliminaryUrgency === 'critical' ? 1 : 0),
      };
      updatedSectors = updatedSectors.map((s) => (s.id === targetSector!.id ? updatedSector : s));
      targetSector = updatedSector;
    }

    // 3. Auto-generation of logistics task
    let generatedTask: LogisticsTask | undefined;
    if (newReport.preliminaryUrgency === 'critical' || newReport.preliminaryUrgency === 'high') {
      generatedTask = {
        id: `task-${Date.now().toString().slice(-4)}`,
        sectorId: newReport.sectorId,
        title: `Emergency supply: ${this.getCategoryTitle(newReport.category)}`,
        description: agentReasoning || `Agent Triage: ${newReport.sanitizedSummary}`,
        priority: newReport.preliminaryUrgency,
        category: newReport.category,
        requiredPayload: this.calculatePayload(newReport.category, newReport.estimatedPeopleCount),
        status: 'pending',
        createdAt: Date.now(),
      };
    }

    // 4. Generating prompt for Google Veo
    if (newReport.category === 'water' || newReport.category === 'medical' || newReport.category === 'shelter') {
      triggeredVeoPrompt = this.generateVeoPrompt(newReport.category);
    }

    return {
      updatedSectors,
      generatedTask,
      triggeredVeoPrompt,
      agentReasoning,
    };
  }

  private static getCategoryTitle(category: NeedCategory): string {
    const map: Record<NeedCategory, string> = {
      water: 'Water supply and purification',
      medical: 'Medical assistance',
      food: 'Food supply',
      shelter: 'Temporary shelter',
      rescue: 'Search and rescue operations',
      power: 'Power supply and communication',
    };
    return map[category] || category;
  }

  private static calculatePayload(category: NeedCategory, people: number): string {
    const count = Math.max(people, 1);
    switch (category) {
      case 'water':
        return `${count * 15} l of drinking water, ${Math.ceil(count / 4)} purification tablets`;
      case 'medical':
        return `${Math.ceil(count / 2)} first aid kits, hemostatics, splints`;
      case 'food':
        return `${count * 3} MRE dry rations, vitamins`;
      case 'shelter':
        return `${Math.ceil(count / 3)} thermal blankets, ${Math.ceil(count / 5)} tent tarps`;
      case 'rescue':
        return `1 search and rescue team, hydraulic equipment`;
      case 'power':
        return `2 portable 30000mAh power banks, emergency radio receiver`;
      default:
        return 'Basic humanitarian kit';
    }
  }

  public static generateVeoPrompt(category: NeedCategory): string {
    switch (category) {
      case 'water':
        return 'Cinematic 4K instructional video, no text, universal mime demonstration: Hands layering cloth, crushed charcoal, and sand into a plastic bottle to filter dirty river water into clear water, followed by boiling over a camping stove. Clear step-by-step visual actions, high contrast, disaster relief context.';
      case 'medical':
        return 'Clear instructional 4K video, zero text: A volunteer demonstrating applying a direct pressure bandage to an arm wound, elevating the limb, and wrapping tightly with elastic gauze. Educational, calm tone, hyper-realistic, universal body language.';
      case 'shelter':
        return 'Survival instructional video, universal visual guide: Constructing a quick emergency thermal shelter using a mylar space blanket, cord, and two trees. Step by step tying knots and securing corners from rain and wind, no dialogue or subtitles.';
      default:
        return 'Universal emergency survival instructions, high clarity visual steps, no spoken words.';
    }
  }
}
