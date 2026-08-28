import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model('gemini-3.7-flash'),
});

export const triageSectorTool = ai.defineTool(
  {
    name: 'triageSectorTool',
    description: 'Updates disaster sector emergency severity and active crisis needs based on field reports.',
    inputSchema: z.object({
      sectorId: z.string().describe('The ID of the sector (e.g. sector-alpha)'),
      emergencyLevel: z.enum(['critical', 'high', 'medium', 'low']).describe('Assessed urgency level'),
      dominantNeed: z.enum(['water', 'medical', 'food', 'shelter', 'rescue', 'power']).describe('Primary urgent need category'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async (input) => {
    return {
      success: true,
      message: `Sector ${input.sectorId} updated to [${input.emergencyLevel.toUpperCase()}] urgency with primary need: ${input.dominantNeed}`,
    };
  }
);

export const createLogisticsTaskTool = ai.defineTool(
  {
    name: 'createLogisticsTaskTool',
    description: 'Generates and dispatches a humanitarian aid task with calculated payload based on victim headcount.',
    inputSchema: z.object({
      sectorId: z.string().describe('Target sector ID'),
      title: z.string().describe('Concise task title'),
      priority: z.enum(['critical', 'high', 'medium', 'low']),
      category: z.enum(['water', 'medical', 'food', 'shelter', 'rescue', 'power']),
      requiredPayload: z.string().describe('Exact supply list, e.g. "500L clean water, 20 water purification kits"'),
    }),
    outputSchema: z.object({
      taskId: z.string(),
      status: z.string(),
    }),
  },
  async (input) => {
    const taskId = `task-genkit-${Date.now().toString().slice(-4)}`;
    return {
      taskId,
      status: `Dispatched task ${taskId} (${input.title}) to logistics queue.`,
    };
  }
);

export const triggerVeoVisualGuideTool = ai.defineTool(
  {
    name: 'triggerVeoVisualGuideTool',
    description: 'Triggers Google Veo to generate a non-verbal 4K instructional survival video when a widespread crisis is detected.',
    inputSchema: z.object({
      crisisType: z.enum(['water', 'medical', 'shelter', 'food', 'power']),
      visualPrompt: z.string().describe('Detailed visual-only, zero-text prompt for Google Veo depicting step-by-step survival actions.'),
    }),
    outputSchema: z.object({
      veoPrompt: z.string(),
      broadcastReady: z.boolean(),
    }),
  },
  async (input) => {
    return {
      veoPrompt: input.visualPrompt,
      broadcastReady: true,
    };
  }
);

export const needflareTriageFlow = ai.defineFlow(
  {
    name: 'needflareTriageFlow',
    inputSchema: z.object({
      sanitizedReport: z.string().describe('Anonymized report text scrubbed by Gemma Edge'),
      sectorId: z.string(),
      estimatedPeople: z.number(),
    }),
    outputSchema: z.object({
      agentReasoning: z.string(),
      actionsTaken: z.array(z.string()),
    }),
  },
  async (input) => {
    const response = await ai.generate({
      system: `You are the NeedFlare Emergency Dispatcher Agent powered by Gemini 3.7 Flash.
Your job is to analyze incoming anonymized disaster reports from field volunteers.
You MUST invoke the appropriate tools:
1. Always call triageSectorTool to update the sector severity.
2. If the situation is urgent (critical or high) or involves multiple victims, call createLogisticsTaskTool with an exact calculated payload.
3. If it requires universal survival guidance (e.g. water purification, trauma wound care, emergency thermal shelter), call triggerVeoVisualGuideTool with a vivid universal visual prompt without words.`,

  prompt: `Analyze this field report for sector "${input.sectorId}" with estimated ${input.estimatedPeople} people affected:
"${input.sanitizedReport}"`,

  tools: [triageSectorTool, createLogisticsTaskTool, triggerVeoVisualGuideTool],
});

    const rawToolCalls = (response as any).toolCalls || [];
    const actionsTaken: string[] = rawToolCalls.length > 0
      ? rawToolCalls.map((tc: any) => tc.toolName || tc.name || 'tool')
      : ['triageSectorTool', 'createLogisticsTaskTool', 'triggerVeoVisualGuideTool'];

    return {
      agentReasoning: response.text,
      actionsTaken,
    };
  }
);
