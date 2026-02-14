// Emotional levels
export const EMOTIONAL_LEVELS = {
  RED: 'red',
  ORANGE: 'orange',
  YELLOW: 'yellow',
  GREEN: 'green',
} as const;

// Energy levels
export const ENERGY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

// Stress levels
export const STRESS_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

// Interest categories
export const INTEREST_CATEGORIES = [
  'coding',
  'art',
  'business',
  'language',
  'wellness',
  'creative',
  'music',
  'sports',
  'reading',
  'writing',
] as const;

// Skill difficulties
export const SKILL_DIFFICULTIES = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const;

// Color mappings for emotional levels
export const LEVEL_COLORS = {
  red: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    accent: 'bg-red-500',
  },
  orange: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    accent: 'bg-orange-500',
  },
  yellow: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    accent: 'bg-yellow-500',
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    accent: 'bg-green-500',
  },
} as const;

// Mood emojis for slider
export const MOOD_EMOJIS = [
  '😢', // 1
  '😞', // 2
  '😔', // 3
  '😕', // 4
  '😐', // 5
  '🙂', // 6
  '😊', // 7
  '😄', // 8
  '😁', // 9
  '🤩', // 10
];

export type EmotionalLevel = typeof EMOTIONAL_LEVELS[keyof typeof EMOTIONAL_LEVELS];
export type EnergyLevel = typeof ENERGY_LEVELS[keyof typeof ENERGY_LEVELS];
export type StressLevel = typeof STRESS_LEVELS[keyof typeof STRESS_LEVELS];
export type InterestCategory = typeof INTEREST_CATEGORIES[number];
export type SkillDifficulty = typeof SKILL_DIFFICULTIES[keyof typeof SKILL_DIFFICULTIES];
