import { VeoVisualGuide, NeedCategory } from '../types';

export class VeoService {
  public static initialGuides: VeoVisualGuide[] = [
    {
      id: 'veo-water-01',
      title: 'Universal Water Filtration & Purification',
      targetCrisis: 'water',
      generatedPrompt:
        'Cinematic 4K instructional video, no text, universal demonstration: Step 1 Cut plastic bottle in half. Step 2 Layer cloth, crushed wood charcoal, sand, and pebbles. Step 3 Pour murky water, show clear filtered water pouring into clean cup. Step 4 Boil over fire. High contrast, clear hands gesture.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=800&auto=format&fit=crop&q=80',
      keyVisualSteps: [
        '1. Cut plastic bottle base and place inverted as funnel',
        '2. Add layers: Cloth -> Crushed Charcoal -> Sand -> Pebbles',
        '3. Slowly pour contaminated flood water through layers',
        '4. Boil filtered output for 3 minutes before drinking',
      ],
      isBroadcasting: true,
    },
    {
      id: 'veo-med-02',
      title: 'Emergency Pressure Bandage & Wound Control',
      targetCrisis: 'medical',
      generatedPrompt:
        'Photorealistic 4K, zero language, universal first aid: Person calmly applying direct cloth pressure to bleeding arm wound, elevating above heart, wrapping elastic bandage tightly with lock knot. Clear instructional motions.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
      keyVisualSteps: [
        '1. Press clean cloth firmly directly on the wound',
        '2. Keep limb elevated above heart level',
        '3. Wrap securely with tight overlapping bandage turns',
        '4. Fasten securely and monitor finger circulation',
      ],
      isBroadcasting: true,
    },
    {
      id: 'veo-shelter-03',
      title: 'Hypothermia Prevention & Space Blanket Rig',
      targetCrisis: 'shelter',
      generatedPrompt:
        'Step-by-step 4K visual survival guide: Unfolding silver mylar emergency blanket, wrapping reflective shiny side inwards against body, securing corners with paracord between two supports to deflect wind and rain.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800&auto=format&fit=crop&q=80',
      keyVisualSteps: [
        '1. Wrap shiny silver side facing body to reflect heat',
        '2. Fasten corners with cord to create aerodynamic lean-to',
        '3. Insulate ground contact with dry branches and leaves',
      ],
      isBroadcasting: false,
    },
  ];

  /**
   * Simulating generation of a new video via Google Veo API
   */
  public static async generateNewVeoGuide(
    category: NeedCategory,
    customPrompt: string
  ): Promise<VeoVisualGuide> {
    // Simulating rendering of the Veo video model
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const id = `veo-${category}-${Date.now().toString().slice(-4)}`;
    return {
      id,
      title: `Emergency Protocol: ${category.toUpperCase()}`,
      targetCrisis: category,
      generatedPrompt: customPrompt,
      thumbnailUrl: 'https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?w=800&auto=format&fit=crop&q=80',
      keyVisualSteps: [
        '1. Universal step: Assess immediate surroundings for safety',
        '2. Universal step: Apply standard non-verbal disaster protocol',
        '3. Universal step: Signal volunteers using bright reflective marker',
      ],
      isBroadcasting: true,
    };
  }
}
