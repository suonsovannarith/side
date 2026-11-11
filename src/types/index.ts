/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ContentType = 'Short-form' | 'Long-form';
export type PriorityLevel = 'High' | 'Medium' | 'Low';
export type ProductionStatus = 'Idea' | 'In Production' | 'Ready to Publish' | 'Published';

export interface Channel {
  id: string;
  name: string;
  category: string;
  description: string;
  lastUploadedDate: string;
  color: string;
  icon: string; // icon identifier: 'tech' | 'fitness' | 'productivity' | 'story' | 'podcast' | 'controversy' | 'kids' | 'custom'
  activeInRotation: boolean;
  totalSubscribers?: string;
}

export interface ContentItem {
  id: string;
  title: string;
  channelId: string;
  type: ContentType;
  priority: PriorityLevel;
  status: ProductionStatus;
  plannedPublishDate: string; // YYYY-MM-DD
  assetFilePath: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
}

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Blocked';

export interface ProductionTask {
  id: string;
  contentId: string;
  stageNumber: number; // 1 to 7
  stageName: string;
  status: TaskStatus;
  dueDate: string; // YYYY-MM-DD
  toolOrAssignee: string;
  notes: string;
}

export interface ProductionStageTemplate {
  number: number;
  name: string;
  defaultTool: string;
  description: string;
}

export const PRODUCTION_STAGES: ProductionStageTemplate[] = [
  { number: 1, name: 'Research story concept', defaultTool: 'Perplexity / Trends', description: 'Validate concept, outline hooks, identify audience angle' },
  { number: 2, name: 'Write script', defaultTool: 'Writer / Notion', description: 'Craft compelling narrative, dialogue, and call-to-actions' },
  { number: 3, name: 'Generate voiceover', defaultTool: 'ElevenLabs / Mic', description: 'Record studio audio or render neural voiceover with inflection' },
  { number: 4, name: 'Generate visuals', defaultTool: 'Midjourney / Runway', description: 'Render high-resolution visual scenes, animations, and B-roll' },
  { number: 5, name: 'Edit video', defaultTool: 'Premiere Pro / CapCut', description: 'Assemble audio, pacing, color grading, sound effects, subtitles' },
  { number: 6, name: 'Create thumbnail', defaultTool: 'Photoshop / Figma', description: 'Design high-CTR click-worthy thumbnail and 3 A/B variations' },
  { number: 7, name: 'Review and publish', defaultTool: 'YouTube Studio', description: 'SEO metadata, descriptions, tags, cards, end-screens, scheduling' },
];

export interface DashboardStats {
  totalContentIdeas: number;
  inProductionCount: number;
  readyToPublishCount: number;
  publishedCount: number;
  overdueTasksCount: number;
  channelCounts: { channelId: string; channelName: string; count: number; color: string }[];
}

export type ActiveTab = 'calendar' | 'ideas' | 'pipeline' | 'rotation' | 'terminal' | 'code' | 'report' | 'settings';
