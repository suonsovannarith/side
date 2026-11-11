/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';

export interface IdeaBrainstormResult {
  title: string;
  hook: string;
  type: 'Short-form' | 'Long-form';
  priority: 'High' | 'Medium' | 'Low';
  tags: string[];
}

export interface StageScriptResult {
  conceptOutline: string;
  scriptHooks: string[];
  visualDirectives: string[];
  audioVoiceoverNotes: string;
  suggestedTags: string[];
}

export interface VideoMetadataResult {
  optimizedTitle: string;
  description: string;
  tags: string[];
  thumbnailPrompt: string;
  estimatedRetentionRate: string;
}

// Safely obtain Google Gen AI instance if key is available
const apiKey = process.env.GEMINI_API_KEY || '';
let genAIClient: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    genAIClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Could not initialize GoogleGenAI client:', err);
  }
}

/**
 * Brainstorm content ideas using Gemini AI with Persona tuning (Chill Homie vs Professional Director)
 */
export async function brainstormIdeasWithGemini(
  channelName: string,
  category: string,
  persona: 'chill' | 'professional' = 'chill'
): Promise<IdeaBrainstormResult[]> {
  const systemTone =
    persona === 'chill'
      ? 'You are a chill, Gen Z viral YouTube creator coach. Prioritize high-dopamine hooks, authentic pacing, and creative flow.'
      : 'You are an executive studio director and YouTube algorithm strategist. Prioritize maximum CTR, SEO optimization, and audience retention metrics.';

  const prompt = `As a YouTube growth strategist (${systemTone}), generate 3 viral video ideas for a channel named "${channelName}" in the "${category}" niche.
Return ONLY valid JSON matching this array structure:
[
  {
    "title": "Video Title",
    "hook": "First 3-5 second hook",
    "type": "Short-form" | "Long-form",
    "priority": "High" | "Medium" | "Low",
    "tags": ["tag1", "tag2", "tag3"]
  }
]`;

  if (genAIClient) {
    try {
      const response = await genAIClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '';
      if (text) {
        return JSON.parse(text) as IdeaBrainstormResult[];
      }
    } catch (err) {
      console.error('Gemini API generation error, falling back to dynamic presets:', err);
    }
  }

  // Dynamic Fallback Presets aligned with Channel Niche
  if (category.toLowerCase().includes('fitness') || channelName.toLowerCase().includes('fitness')) {
    return [
      {
        title: persona === 'chill' ? 'I Tried Arnold’s 1974 Workout Split For 7 Days (Cooked 😭)' : 'Biomechanics Audit: 5 Hypertrophy Mistakes Destroying Your Gains',
        hook: persona === 'chill' ? 'Day 3 my chest literally stopped working bro...' : '90% of lifters waste 40% of tension in the eccentric phase.',
        type: 'Long-form',
        priority: 'High',
        tags: ['fitness', 'hypertrophy', 'workout', 'gains'],
      },
      {
        title: 'The Only 3 Bicep Exercises You Actually Need (Science-Backed)',
        hook: 'Stop doing 6 curl variations. EMG data proves these 3 beat everything.',
        type: 'Short-form',
        priority: 'Medium',
        tags: ['biceps', 'arms', 'gymtips', 'science'],
      },
      {
        title: 'Pre-Workout vs Coffee: The 30-Day Blind Energy Test',
        hook: 'Does beta-alanine actually make you lift heavier or just itch your face off?',
        type: 'Long-form',
        priority: 'High',
        tags: ['supplements', 'preworkout', 'caffeine', 'experiment'],
      },
    ];
  } else if (category.toLowerCase().includes('hardware') || channelName.toLowerCase().includes('tech')) {
    return [
      {
        title: persona === 'chill' ? 'This $40 Gadget Replaced My Entire $3000 Desk Setup 🔥' : 'M4 Pro Max vs RTX 4090: The Thermal Throttling & Render Benchmark',
        hook: persona === 'chill' ? 'I thought this was a dropshipping scam until I plugged it in...' : 'Notice what happens to clock speeds after 14 minutes under load.',
        type: 'Long-form',
        priority: 'High',
        tags: ['tech', 'gadgets', 'desksetup', 'review'],
      },
      {
        title: 'Stop Buying Expensive USB-C Cables (The 240W Scam)',
        hook: 'Cut open a $60 braided cable and a $6 cable. The difference will shock you.',
        type: 'Short-form',
        priority: 'High',
        tags: ['usbc', 'hardware', 'techtips', 'scam'],
      },
      {
        title: 'The Cleanest Minimalist Desk Setup of 2026',
        hook: 'Zero visible cables. Even the monitor power is invisible.',
        type: 'Long-form',
        priority: 'Medium',
        tags: ['minimalist', 'workspace', 'productivity', 'desk'],
      },
    ];
  } else {
    return [
      {
        title: persona === 'chill' ? `Why Everyone is Quitting ${channelName} in 2026 💀` : `The Exponential Shift in ${category}: Strategic 2026 Breakdown`,
        hook: persona === 'chill' ? 'Bro the entire game just flipped in 48 hours...' : 'The data shows an irreversible migration happening right now.',
        type: 'Long-form',
        priority: 'High',
        tags: ['creator', 'trends', 'deepdive', '2026'],
      },
      {
        title: `The 60-Second Rule That Solved My Workflow Bottlenecks`,
        hook: 'If a task takes under 2 minutes, never put it in a queue.',
        type: 'Short-form',
        priority: 'Medium',
        tags: ['productivity', 'systems', 'growth', 'hacks'],
      },
      {
        title: `How We Scaled from Zero to 100K Views in 30 Days`,
        hook: 'We changed exactly two variables in our 7-stage production pipeline.',
        type: 'Long-form',
        priority: 'High',
        tags: ['youtube', 'algorithm', 'casestudy', 'analytics'],
      },
    ];
  }
}

/**
 * Generate 7-stage script and production directives for TaskDLL pipeline
 */
export async function generateStageScriptWithGemini(
  title: string,
  category: string,
  persona: 'chill' | 'professional' = 'chill'
): Promise<StageScriptResult> {
  const prompt = `Generate a 7-stage YouTube production breakdown for video: "${title}" in category "${category}".
Tone: ${persona === 'chill' ? 'Casual, engaging creator advice' : 'Structured, data-driven executive production spec'}.
Return ONLY JSON:
{
  "conceptOutline": "2-3 sentence concept synopsis",
  "scriptHooks": ["Hook 1", "Hook 2", "Retention bridge"],
  "visualDirectives": ["Visual scene 1", "B-roll 2", "Animation callout 3"],
  "audioVoiceoverNotes": "Inflection, pacing, and tone guidelines",
  "suggestedTags": ["tag1", "tag2", "tag3", "tag4"]
}`;

  if (genAIClient) {
    try {
      const response = await genAIClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '';
      if (text) {
        return JSON.parse(text) as StageScriptResult;
      }
    } catch (err) {
      console.error('Gemini API script generation error, falling back:', err);
    }
  }

  return {
    conceptOutline: `In-depth breakdown of "${title}" specifically targeted at ${category} enthusiasts, designed to maximize 30-second audience retention and shareability.`,
    scriptHooks: [
      `"You've been lied to about ${category.toLowerCase()} — and it's costing you hours."`,
      `"Before you spend another dollar, look at this benchmark."`,
      `"Here is the exact 3-step blueprint no one is showing you."`,
    ],
    visualDirectives: [
      'High-contrast macro close-ups on product details with subtle cinematic grain',
      'Dynamic text overlay tracking across key numerical statistics',
      'Split-screen A/B comparison with highlighted color accents (#D4A359)',
    ],
    audioVoiceoverNotes:
      persona === 'chill'
        ? 'High energy, punchy delivery in the first 15 seconds, followed by conversational, authentic storytelling.'
        : 'Authoritative, calm, and measured cadence with deliberate pauses preceding key statistical conclusions.',
    suggestedTags: [category.toLowerCase(), 'creator', 'review', 'guide', '2026'],
  };
}
