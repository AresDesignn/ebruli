export type Language = 'tr' | 'en';

export type ThemeMode = 'light' | 'dark';

export type AppView = 'story' | 'challenges' | 'studio' | 'gallery';

export type ToolType = 'damla' | 'serpme' | 'biz' | 'gelgit' | 'tarak';

export type DropSize = 'small' | 'medium' | 'large';

export type StoryPlayStyle = 'sakin' | 'usta';

export type StorySeason =
  | 'winter_late'
  | 'spring'
  | 'summer'
  | 'autumn'
  | 'winter'
  | 'epilogue';

export type LetterChoice = 'pending' | 'shown' | 'hidden';

export type StoryChapterStage = 'painting' | 'memory' | 'letter';

export interface Pigment {
  id: string;
  nameTr: string;
  nameEn: string;
  hex: string;
  /** 0.25 = fluid ox-gall rich pigment, 0.92 = dense mineral pigment */
  viscosity: number;
}

export interface StrokeTelemetry {
  drops: number;
  centerDrops: number;
  speckles: number;
  bizDistance: number;
  gelgitPasses: number;
  tarakPasses: number;
  distinctColors: string[];
}

export interface ChallengeStep {
  id: string;
  textTr: string;
  textEn: string;
  isComplete: (t: StrokeTelemetry) => boolean;
}

export type GuideOverlayType = 'battal' | 'gelgit' | 'tarama' | 'hatip' | 'bulbul';

export interface ChallengeDef {
  id: string;
  level: number;
  titleTr: string;
  titleEn: string;
  subtitleTr: string;
  subtitleEn: string;
  paletteIds: string[];
  recommendedTool: ToolType;
  guideType: GuideOverlayType;
  steps: ChallengeStep[];
}

export interface StoryLetter {
  id: string;
  senderTr: string;
  senderEn: string;
  paragraphsTr: string[];
  paragraphsEn: string[];
  hasChoice: boolean;
}

export interface StoryChapterDef {
  id: string;
  index: number;
  season: StorySeason;
  seasonTr: string;
  seasonEn: string;
  titleTr: string;
  titleEn: string;
  ustaLineTr: string;
  ustaLineEn: string;
  sakinGoalTr: string;
  sakinGoalEn: string;
  ustaGoalTr: string;
  ustaGoalEn: string;
  waterLightHex: string;
  waterDarkHex: string;
  unlockedTools: ToolType[];
  defaultTool: ToolType;
  paletteIds: string[];
  seedBlindStroke?: boolean;
  isFinalPrintChapter?: boolean;
  isEpilogue?: boolean;
  sakinComplete: (t: StrokeTelemetry) => boolean;
  ustaComplete: (t: StrokeTelemetry) => boolean;
  memoryId: string;
  memoryCaptionTr: string;
  memoryCaptionEn: string;
  letter?: StoryLetter;
}

export interface StoryProgress {
  chapterIndex: number;
  playStyle: StoryPlayStyle;
  letterChoice: LetterChoice;
  unlockedMemories: string[];
  ustaNotebookChapters: string[];
  completedStory: boolean;
}

export interface SavedPrint {
  id: string;
  title: string;
  mode: 'story' | 'challenge' | 'sandbox';
  challengeId?: string;
  chapterId?: string;
  seals?: number;
  letterChoice?: LetterChoice;
  dataUrl: string;
  createdAt: number;
}
