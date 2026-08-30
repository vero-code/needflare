import type { VeoVisualGuide, NeedCategory } from '../types';

export class VeoService {
  public static initialGuides: VeoVisualGuide[] = [];

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
