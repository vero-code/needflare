import type { VeoVisualGuide, NeedCategory } from '../types';

export class VeoService {
  public static initialGuides: VeoVisualGuide[] = [];

  public static async generateNewVeoGuide(
    category: NeedCategory,
    customPrompt: string
  ): Promise<VeoVisualGuide> {
    const AGENT_URL = (import.meta as any).env?.VITE_AGENT_URL || 'http://localhost:8080';
    try {
      const res = await fetch(`${AGENT_URL}/api/veo/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, prompt: customPrompt }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.guide) return data.guide;
      }
    } catch (e) {
      console.warn('Backend Veo call failed:', e);
    }

    const id = `veo-${category}-${Date.now().toString().slice(-4)}`;
    return {
      id,
      title: `Emergency Protocol: ${category.toUpperCase()}`,
      targetCrisis: category,
      generatedPrompt: customPrompt,
      thumbnailUrl: '',
      videoUrl: '',
      keyVisualSteps: [
        '1. Universal step: Assess immediate surroundings for safety',
        '2. Universal step: Apply standard non-verbal disaster protocol',
        '3. Universal step: Signal volunteers using bright reflective marker',
      ],
      isBroadcasting: true,
    };
  }
}
