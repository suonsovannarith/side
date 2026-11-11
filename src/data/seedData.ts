import { Channel, ContentItem, ProductionTask, PRODUCTION_STAGES } from '../types/index.ts';

export const INITIAL_CHANNELS: Channel[] = [
  // 3 Channels from Reference Design Screenshot
  {
    id: 'CH-01',
    name: 'Tech Reviews',
    category: 'Consumer Hardware & Gadgets',
    description: 'Deep-dive hardware benchmarks, flagship smartphone comparisons, and desk setup reviews.',
    lastUploadedDate: '5 March 2026',
    color: '#EA580C', // Warm Orange
    icon: 'tech',
    activeInRotation: true,
    totalSubscribers: '412K',
  },
  {
    id: 'CH-02',
    name: 'Fitness World',
    category: 'Strength & Hypertrophy',
    description: 'Science-based workout splits, supplement breakdowns, and biomechanics tutorials.',
    lastUploadedDate: '12 March 2026',
    color: '#16A34A', // Vibrant Green
    icon: 'fitness',
    activeInRotation: true,
    totalSubscribers: '285K',
  },
  {
    id: 'CH-03',
    name: 'Productivity Life',
    category: 'Systems & Time Management',
    description: 'Second-brain workflows, morning routines, calendar mastery, and minimalist habits.',
    lastUploadedDate: '3 March 2026',
    color: '#DB2777', // Rose Pink
    icon: 'productivity',
    activeInRotation: true,
    totalSubscribers: '530K',
  },
  // 4 Channels from C++ Project Specification Brief
  {
    id: 'CH-04',
    name: 'AI Emotional Stories',
    category: 'AI-Generated Emotional Stories',
    description: 'Heartfelt narrative shorts and moral parables powered by neural voiceovers and cinematic AI visuals.',
    lastUploadedDate: '14 March 2026',
    color: '#D97706', // Amber Gold
    icon: 'story',
    activeInRotation: true,
    totalSubscribers: '890K',
  },
  {
    id: 'CH-05',
    name: 'Podcast & Biz Clips',
    category: 'Podcast & Business Personalities',
    description: 'High-retention vertical shorts and executive takeaways from founder and investor interviews.',
    lastUploadedDate: '10 March 2026',
    color: '#2563EB', // Royal Blue
    icon: 'podcast',
    activeInRotation: true,
    totalSubscribers: '640K',
  },
  {
    id: 'CH-06',
    name: 'Internet Radar',
    category: 'Celebrity & Controversy Analysis',
    description: 'Investigative video essays unpacking viral internet drama, creator timelines, and media trends.',
    lastUploadedDate: '8 March 2026',
    color: '#7C3AED', // Violet
    icon: 'controversy',
    activeInRotation: true,
    totalSubscribers: '320K',
  },
  {
    id: 'CH-07',
    name: 'WonderTales Kids',
    category: 'AI Fictional Adventures for Children',
    description: 'Animated bedtime fables, talking animal quests, and educational storybooks for young minds.',
    lastUploadedDate: '15 March 2026',
    color: '#0D9488', // Teal
    icon: 'kids',
    activeInRotation: true,
    totalSubscribers: '750K',
  },
];

export const INITIAL_CONTENT_ITEMS: ContentItem[] = [
  // Week 1 / Previous Late Feb - Early March 2026 (Matching Calendar View)
  {
    id: 'CNT-101',
    title: 'Testing a $2,000 Minimalist Desk Setup',
    channelId: 'CH-01',
    type: 'Long-form',
    priority: 'High',
    status: 'Published',
    plannedPublishDate: '2026-02-23',
    assetFilePath: '/data/assets/CH-01/desk_setup_script.md',
    notes: 'Sponsor integration at 02:15 mark.',
    createdAt: '2026-02-15',
  },
  {
    id: 'CNT-102',
    title: 'How I Organize My Entire Life in One App',
    channelId: 'CH-03',
    type: 'Long-form',
    priority: 'High',
    status: 'Published',
    plannedPublishDate: '2026-02-23',
    assetFilePath: '/data/assets/CH-03/life_os_template.md',
    notes: 'Include downloadable template link in description.',
    createdAt: '2026-02-16',
  },
  {
    id: 'CNT-103',
    title: 'What to Eat Before & After Every Workout',
    channelId: 'CH-02',
    type: 'Long-form',
    priority: 'Medium',
    status: 'Published',
    plannedPublishDate: '2026-02-24',
    assetFilePath: '/data/assets/CH-02/peri_workout_nutrition.md',
    notes: 'Macro breakdown graphics verified.',
    createdAt: '2026-02-18',
  },
  {
    id: 'CNT-104',
    title: 'My Morning Routine for 12 Hours of Deep Focus',
    channelId: 'CH-03',
    type: 'Short-form',
    priority: 'Medium',
    status: 'Published',
    plannedPublishDate: '2026-02-25',
    assetFilePath: '/data/assets/CH-03/morning_focus_short.mp4',
    notes: '60-second vertical cut.',
    createdAt: '2026-02-19',
  },
  {
    id: 'CNT-105',
    title: 'Best Supplements for Natural Muscle Growth (Tier List)',
    channelId: 'CH-02',
    type: 'Long-form',
    priority: 'High',
    status: 'Published',
    plannedPublishDate: '2026-02-26',
    assetFilePath: '/data/assets/CH-02/supplement_tier_list.md',
    notes: 'Cite 5 peer-reviewed PubMed studies.',
    createdAt: '2026-02-20',
  },
  {
    id: 'CNT-106',
    title: 'Is This Laptop Worth Upgrading in 2026?',
    channelId: 'CH-01',
    type: 'Long-form',
    priority: 'High',
    status: 'Published',
    plannedPublishDate: '2026-02-26',
    assetFilePath: '/data/assets/CH-01/laptop_benchmark_2026.md',
    notes: 'Compare thermal throttling under 4K export.',
    createdAt: '2026-02-20',
  },
  {
    id: 'CNT-107',
    title: 'How to Stop Procrastinating in 3 Minutes',
    channelId: 'CH-03',
    type: 'Short-form',
    priority: 'Medium',
    status: 'Published',
    plannedPublishDate: '2026-02-27',
    assetFilePath: '/data/assets/CH-03/two_minute_rule.md',
    notes: 'Fast-paced kinetic typography.',
    createdAt: '2026-02-21',
  },
  {
    id: 'CNT-108',
    title: 'Push Pull Legs: The Ultimate Hypertrophy Split',
    channelId: 'CH-02',
    type: 'Long-form',
    priority: 'High',
    status: 'Published',
    plannedPublishDate: '2026-02-28',
    assetFilePath: '/data/assets/CH-02/ppl_hypertrophy.md',
    notes: 'Gym B-roll filmed in 4K 60fps.',
    createdAt: '2026-02-22',
  },
  {
    id: 'CNT-109',
    title: 'AirPods Pro 3 vs Sony WF-1000XM6 Honest Test',
    channelId: 'CH-01',
    type: 'Long-form',
    priority: 'High',
    status: 'Published',
    plannedPublishDate: '2026-03-01',
    assetFilePath: '/data/assets/CH-01/airpods_vs_sony.md',
    notes: 'Binaural microphone ANC test included.',
    createdAt: '2026-02-24',
  },
  {
    id: 'CNT-110',
    title: 'How to Build a Second Brain Without Overcomplicating It',
    channelId: 'CH-03',
    type: 'Long-form',
    priority: 'Medium',
    status: 'Published',
    plannedPublishDate: '2026-03-01',
    assetFilePath: '/data/assets/CH-03/second_brain_guide.md',
    notes: 'PARA method walkthrough.',
    createdAt: '2026-02-25',
  },
  // March Week 2
  {
    id: 'CNT-111',
    title: 'Best Headphones for Coding & Deep Work',
    channelId: 'CH-01',
    type: 'Short-form',
    priority: 'Low',
    status: 'Published',
    plannedPublishDate: '2026-03-02',
    assetFilePath: '/data/assets/CH-01/coding_headphones.md',
    notes: 'Comfort test over 8 hours.',
    createdAt: '2026-02-26',
  },
  {
    id: 'CNT-112',
    title: '5 Habits That Saved Me 15 Hours Every Week',
    channelId: 'CH-03',
    type: 'Long-form',
    priority: 'High',
    status: 'Published',
    plannedPublishDate: '2026-03-03',
    assetFilePath: '/data/assets/CH-03/five_habits_15hrs.md',
    notes: 'High retention hook in first 15 seconds.',
    createdAt: '2026-02-27',
  },
  {
    id: 'CNT-113',
    title: 'Complete Mobility Routine for Desk Workers',
    channelId: 'CH-02',
    type: 'Long-form',
    priority: 'Medium',
    status: 'Published',
    plannedPublishDate: '2026-03-03',
    assetFilePath: '/data/assets/CH-02/desk_mobility.md',
    notes: '10-minute follow-along timer.',
    createdAt: '2026-02-28',
  },
  {
    id: 'CNT-114',
    title: 'The Stray Dog Who Waited at the Train Station for 10 Years',
    channelId: 'CH-04',
    type: 'Short-form',
    priority: 'High',
    status: 'Ready to Publish',
    plannedPublishDate: '2026-03-04',
    assetFilePath: '/data/assets/CH-04/loyal_dog_ai_story.md',
    notes: 'Full 7-stage AI story pipeline: Midjourney v6 scenes + ElevenLabs emotional narration.',
    createdAt: '2026-03-01',
  },
  {
    id: 'CNT-115',
    title: 'Apps I Use Every Single Day on macOS & iOS',
    channelId: 'CH-03',
    type: 'Long-form',
    priority: 'Medium',
    status: 'Published',
    plannedPublishDate: '2026-03-05',
    assetFilePath: '/data/assets/CH-03/daily_apps_2026.md',
    notes: 'Raycast, Obsidian, Cron showcase.',
    createdAt: '2026-03-01',
  },
  {
    id: 'CNT-116',
    title: 'Top 5 Accessories Every MacBook User Needs',
    channelId: 'CH-01',
    type: 'Long-form',
    priority: 'High',
    status: 'Published',
    plannedPublishDate: '2026-03-05',
    assetFilePath: '/data/assets/CH-01/macbook_accessories.md',
    notes: 'Thunderbolt 5 dock review.',
    createdAt: '2026-03-02',
  },
  {
    id: 'CNT-117',
    title: 'Lat Pulldown Form Mistakes Destroying Your Back Gains',
    channelId: 'CH-02',
    type: 'Short-form',
    priority: 'High',
    status: 'Published',
    plannedPublishDate: '2026-03-05',
    assetFilePath: '/data/assets/CH-02/lat_pulldown_fix.mp4',
    notes: 'Anatomical overlay graphics.',
    createdAt: '2026-03-02',
  },
  {
    id: 'CNT-118',
    title: 'Why Billionaire Founders Wake Up at 4:30 AM (Naval & Hormozi Cut)',
    channelId: 'CH-05',
    type: 'Short-form',
    priority: 'High',
    status: 'In Production',
    plannedPublishDate: '2026-03-06',
    assetFilePath: '/data/assets/CH-05/founder_routines_clip.prproj',
    notes: 'Dynamic captions + B-roll pacing.',
    createdAt: '2026-03-03',
  },
  {
    id: 'CNT-119',
    title: 'Method of Time Blocking That Actually Works',
    channelId: 'CH-03',
    type: 'Long-form',
    priority: 'Medium',
    status: 'Ready to Publish',
    plannedPublishDate: '2026-03-07',
    assetFilePath: '/data/assets/CH-03/time_blocking_method.md',
    notes: 'Thumbnail A/B test ready.',
    createdAt: '2026-03-03',
  },
  {
    id: 'CNT-120',
    title: 'Full Day of Eating for Lean Bulking (3,200 Calories)',
    channelId: 'CH-02',
    type: 'Long-form',
    priority: 'Medium',
    status: 'Ready to Publish',
    plannedPublishDate: '2026-03-07',
    assetFilePath: '/data/assets/CH-02/full_day_eating_3200.md',
    notes: '4 easy meal prep recipes.',
    createdAt: '2026-03-04',
  },
  {
    id: 'CNT-121',
    title: '5 Productivity Gadgets That Are Actually Worth Your Money',
    channelId: 'CH-01',
    type: 'Long-form',
    priority: 'High',
    status: 'In Production',
    plannedPublishDate: '2026-03-08',
    assetFilePath: '/data/assets/CH-01/5_prod_gadgets.md',
    notes: 'E-ink tablet and Pomodoro timer footage.',
    createdAt: '2026-03-04',
  },
  // March Week 3
  {
    id: 'CNT-122',
    title: 'Calendar System for Managing 4 Projects Simultaneously',
    channelId: 'CH-03',
    type: 'Long-form',
    priority: 'High',
    status: 'In Production',
    plannedPublishDate: '2026-03-09',
    assetFilePath: '/data/assets/CH-03/calendar_system_4x.md',
    notes: 'Color-coded batching demonstration.',
    createdAt: '2026-03-05',
  },
  {
    id: 'CNT-123',
    title: 'iPhone 17 Pro Max 6 Months Later: The Brutal Truth',
    channelId: 'CH-01',
    type: 'Long-form',
    priority: 'High',
    status: 'In Production',
    plannedPublishDate: '2026-03-09',
    assetFilePath: '/data/assets/CH-01/iphone_6months.md',
    notes: 'Battery health and camera comparison.',
    createdAt: '2026-03-05',
  },
  {
    id: 'CNT-124',
    title: 'Common Gym Myths Everyone Still Believes in 2026',
    channelId: 'CH-02',
    type: 'Long-form',
    priority: 'Medium',
    status: 'In Production',
    plannedPublishDate: '2026-03-10',
    assetFilePath: '/data/assets/CH-02/gym_myths_2026.md',
    notes: 'Debunking anabolic window and fasted cardio.',
    createdAt: '2026-03-06',
  },
  {
    id: 'CNT-125',
    title: 'Night Routine for Restorative Sleep & Zero Burnout',
    channelId: 'CH-03',
    type: 'Short-form',
    priority: 'Low',
    status: 'Idea',
    plannedPublishDate: '2026-03-11',
    assetFilePath: '/data/assets/CH-03/night_routine_notes.md',
    notes: 'Blue light blocking + journaling angle.',
    createdAt: '2026-03-06',
  },
  {
    id: 'CNT-126',
    title: 'Bench Press Arch & Grip Width: Biomechanics Explained',
    channelId: 'CH-02',
    type: 'Long-form',
    priority: 'High',
    status: 'In Production',
    plannedPublishDate: '2026-03-12',
    assetFilePath: '/data/assets/CH-02/bench_press_biomechanics.md',
    notes: '3D muscle activation render.',
    createdAt: '2026-03-07',
  },
  {
    id: 'CNT-127',
    title: '60% Mechanical Keyboards: Custom Build vs Pre-Built',
    channelId: 'CH-01',
    type: 'Long-form',
    priority: 'Medium',
    status: 'In Production',
    plannedPublishDate: '2026-03-12',
    assetFilePath: '/data/assets/CH-01/60_percent_keyboards.md',
    notes: 'ASMR typing sound test.',
    createdAt: '2026-03-07',
  },
  {
    id: 'CNT-128',
    title: 'How to Read 50 Books a Year & Retain Everything',
    channelId: 'CH-03',
    type: 'Long-form',
    priority: 'Medium',
    status: 'Idea',
    plannedPublishDate: '2026-03-13',
    assetFilePath: '/data/assets/CH-03/syntopical_reading.md',
    notes: 'Zettelkasten book notes workflow.',
    createdAt: '2026-03-08',
  },
  {
    id: 'CNT-129',
    title: 'Supplement Timing: When to Take Creatine, Caffeine & Magnesium',
    channelId: 'CH-02',
    type: 'Short-form',
    priority: 'Medium',
    status: 'Idea',
    plannedPublishDate: '2026-03-14',
    assetFilePath: '/data/assets/CH-02/supplement_clock.md',
    notes: 'Timeline visual graphic.',
    createdAt: '2026-03-08',
  },
  {
    id: 'CNT-130',
    title: '3 Tricks to Instantly Double Your Reading Speed',
    channelId: 'CH-03',
    type: 'Short-form',
    priority: 'Low',
    status: 'Idea',
    plannedPublishDate: '2026-03-15',
    assetFilePath: '/data/assets/CH-03/reading_speed_tricks.md',
    notes: 'Visual pacer technique.',
    createdAt: '2026-03-08',
  },
  {
    id: 'CNT-131',
    title: 'Minimalist EDC Tech Pouch: Everything In My Bag',
    channelId: 'CH-01',
    type: 'Long-form',
    priority: 'Medium',
    status: 'Idea',
    plannedPublishDate: '2026-03-15',
    assetFilePath: '/data/assets/CH-01/edc_tech_pouch.md',
    notes: 'GaN charger, SSD enclosure, multi-tool.',
    createdAt: '2026-03-09',
  },
  // Additional C++ Spec Category Videos in March
  {
    id: 'CNT-132',
    title: 'The Rise and Fall of the Biggest Fake Tech Giveaway Scandal',
    channelId: 'CH-06',
    type: 'Long-form',
    priority: 'High',
    status: 'In Production',
    plannedPublishDate: '2026-03-17',
    assetFilePath: '/data/assets/CH-06/giveaway_controversy_doc.md',
    notes: 'Timeline evidence board + archived tweets.',
    createdAt: '2026-03-09',
  },
  {
    id: 'CNT-133',
    title: 'Barnaby the Brave Little Owl & The Whispering Starlight Forest',
    channelId: 'CH-07',
    type: 'Long-form',
    priority: 'High',
    status: 'In Production',
    plannedPublishDate: '2026-03-19',
    assetFilePath: '/data/assets/CH-07/barnaby_owl_adventure.md',
    notes: 'Children fictional AI adventure with soothing orchestral score.',
    createdAt: '2026-03-09',
  },
  {
    id: 'CNT-134',
    title: 'A Poor Baker Gave His Last Loaf to a Stranger—Years Later, He Returned',
    channelId: 'CH-04',
    type: 'Long-form',
    priority: 'High',
    status: 'In Production',
    plannedPublishDate: '2026-03-21',
    assetFilePath: '/data/assets/CH-04/baker_kindness_story.md',
    notes: 'Emotional AI story flagship episode.',
    createdAt: '2026-03-09',
  },
];

/**
 * Generates initial 7-stage production tasks for key content items
 * Producing one video requires:
 * 1. Research story concept
 * 2. Write script
 * 3. Generate voiceover
 * 4. Generate visuals
 * 5. Edit video
 * 6. Create thumbnail
 * 7. Review and publish
 */
export function buildInitialTasks(): ProductionTask[] {
  const tasks: ProductionTask[] = [];
  let counter = 501;

  // Create full 7-stage pipelines for primary active items so the user can step through all 7 stages
  const pipelineConfigs: { contentId: string; currentStage: number; baseDueDate: string }[] = [
    { contentId: 'CNT-114', currentStage: 7, baseDueDate: '2026-03-04' }, // AI Emotional Story (Ready to Publish)
    { contentId: 'CNT-134', currentStage: 4, baseDueDate: '2026-03-05' }, // AI Emotional Story (In Production - has overdue stage!)
    { contentId: 'CNT-118', currentStage: 5, baseDueDate: '2026-03-06' }, // Podcast Clip (In Production)
    { contentId: 'CNT-121', currentStage: 3, baseDueDate: '2026-03-07' }, // Tech Reviews (In Production)
    { contentId: 'CNT-132', currentStage: 2, baseDueDate: '2026-03-10' }, // Controversy Analysis (In Production)
    { contentId: 'CNT-133', currentStage: 4, baseDueDate: '2026-03-12' }, // Kids AI Adventure (In Production)
    { contentId: 'CNT-122', currentStage: 5, baseDueDate: '2026-03-08' }, // Productivity Life (In Production)
    { contentId: 'CNT-126', currentStage: 6, baseDueDate: '2026-03-11' }, // Fitness World (In Production)
  ];

  for (const cfg of pipelineConfigs) {
    for (const stage of PRODUCTION_STAGES) {
      let status: ProductionTask['status'] = 'Pending';
      if (stage.number < cfg.currentStage) {
        status = 'Completed';
      } else if (stage.number === cfg.currentStage) {
        status = cfg.currentStage === 7 ? 'Completed' : 'In Progress';
      }

      tasks.push({
        id: `TSK-${counter++}`,
        contentId: cfg.contentId,
        stageNumber: stage.number,
        stageName: stage.name,
        status,
        dueDate: cfg.baseDueDate,
        toolOrAssignee: stage.defaultTool,
        notes: stage.description,
      });
    }
  }

  return tasks;
}

export const INITIAL_TASKS: ProductionTask[] = buildInitialTasks();

/**
 * Plain-text serialization helpers for the 4 C++ data files:
 * channels.txt, content.txt, tasks.txt, schedule.txt
 */
export function serializeChannelsTxt(channels: Channel[]): string {
  const header = '# channels.txt | Format: ChannelID|Name|Category|LastUploadedDate|Color|Icon|ActiveInRotation|Subscribers|Description';
  const lines = channels.map(
    (c) =>
      `${c.id}|${c.name}|${c.category}|${c.lastUploadedDate}|${c.color}|${c.icon}|${c.activeInRotation ? '1' : '0'}|${c.totalSubscribers || '0'}|${c.description}`
  );
  return [header, ...lines].join('\n');
}

export function serializeContentTxt(items: ContentItem[]): string {
  const header = '# content.txt | Format: ContentID|Title|ChannelID|ContentType|Priority|ProductionStatus|PlannedPublishDate|AssetFilePath|Notes';
  const lines = items.map(
    (i) =>
      `${i.id}|${i.title}|${i.channelId}|${i.type}|${i.priority}|${i.status}|${i.plannedPublishDate}|${i.assetFilePath}|${(i.notes || '').replace(/\n/g, ' ')}`
  );
  return [header, ...lines].join('\n');
}

export function serializeTasksTxt(tasks: ProductionTask[]): string {
  const header = '# tasks.txt | Format: TaskID|ContentID|StageNumber|StageName|Status|DueDate|ToolOrAssignee|Notes';
  const lines = tasks.map(
    (t) =>
      `${t.id}|${t.contentId}|${t.stageNumber}|${t.stageName}|${t.status}|${t.dueDate}|${t.toolOrAssignee}|${(t.notes || '').replace(/\n/g, ' ')}`
  );
  return [header, ...lines].join('\n');
}

export function serializeScheduleTxt(channels: Channel[], currentChannelId: string): string {
  const active = channels.filter((c) => c.activeInRotation);
  const ring = active.map((c) => `${c.id} (${c.name})`).join(' -> ');
  return [
    '# schedule.txt | Circular Linked List (ScheduleCLL) Publishing Rotation State',
    `CURRENT_ROTATION_POINTER|${currentChannelId}`,
    `ACTIVE_RING_SIZE|${active.length}`,
    `CIRCULAR_TOPOLOGY|${ring} -> [HEAD: ${active[0]?.id || 'NONE'}]`,
    ...active.map((c, idx) => `NODE_${idx + 1}|${c.id}|${c.name}|NEXT->${active[(idx + 1) % active.length]?.id || c.id}`),
  ].join('\n');
}
