import { useCallback, useEffect, useRef, useState } from 'react';
import { EbruAudioEngine } from './audio/ebruAudio';
import {
  AtmosphereOverlay,
  type AtmosphereOverlayHandle,
} from './components/AtmosphereOverlay';
import { ChallengeHud } from './components/ChallengeHud';
import { GalleryView } from './components/GalleryView';
import { GuideOverlay } from './components/GuideOverlay';
import { KitreCat } from './components/KitreCat';
import { NurLetterModal } from './components/NurLetterModal';
import { PaperTransferModal } from './components/PaperTransferModal';
import { StoryHud } from './components/StoryHud';
import { ToolDock } from './components/ToolDock';
import { TopBar } from './components/TopBar';
import { WaterCausticsOverlay } from './components/WaterCausticsOverlay';
import { WaterMemoryOverlay } from './components/WaterMemoryOverlay';
import { CHALLENGES, PIGMENTS, evaluateChallengeSeals } from './data/ebruData';
import { COPY } from './data/i18n';
import { STORY_CHAPTERS, getChapterPalette } from './data/storyData';
import { EbruEngine } from './engine/ebruEngine';
import type {
  AppView,
  DropSize,
  Language,
  LetterChoice,
  SavedPrint,
  StoryPlayStyle,
  StoryProgress,
  StrokeTelemetry,
  ThemeMode,
  ToolType,
} from './types/ebru';

const WATER_HEX: Record<ThemeMode, string> = {
  light: '#d7dfdc',
  dark: '#1b232e',
};

const EMPTY_TELEMETRY: StrokeTelemetry = {
  drops: 0,
  centerDrops: 0,
  speckles: 0,
  bizDistance: 0,
  gelgitPasses: 0,
  tarakPasses: 0,
  distinctColors: [],
};

const DEFAULT_STORY_PROGRESS: StoryProgress = {
  chapterIndex: 0,
  playStyle: 'sakin',
  letterChoice: 'pending',
  unlockedMemories: [],
  ustaNotebookChapters: [],
  completedStory: false,
};

const STORAGE_KEYS = {
  lang: 'ebru_lang_v1',
  theme: 'ebru_theme_v1',
  prints: 'ebru_prints_v1',
  seals: 'ebru_seals_v1',
  story: 'ebru_story_v1',
  muted: 'ebru_muted_v1',
};

function loadInitialLang(): Language {
  const saved = localStorage.getItem(STORAGE_KEYS.lang);
  return saved === 'en' || saved === 'tr' ? saved : 'tr';
}

function loadInitialTheme(): ThemeMode {
  const saved = localStorage.getItem(STORAGE_KEYS.theme);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function loadSavedPrints(): SavedPrint[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.prints);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadBestSeals(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.seals);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function loadStoryProgress(): StoryProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.story);
    if (!raw) return DEFAULT_STORY_PROGRESS;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return DEFAULT_STORY_PROGRESS;
    return {
      ...DEFAULT_STORY_PROGRESS,
      ...parsed,
      chapterIndex: Math.min(
        STORY_CHAPTERS.length - 1,
        Math.max(0, Number(parsed.chapterIndex) || 0)
      ),
    };
  } catch {
    return DEFAULT_STORY_PROGRESS;
  }
}

interface PointerState {
  x: number;
  y: number;
  lastSpeckleX: number;
  lastSpeckleY: number;
  strokeDist: number;
}

export default function App() {
  const [lang, setLang] = useState<Language>(loadInitialLang);
  const [theme, setTheme] = useState<ThemeMode>(loadInitialTheme);
  const [muted, setMuted] = useState<boolean>(
    () => localStorage.getItem(STORAGE_KEYS.muted) === 'true'
  );
  const [view, setView] = useState<AppView>('story');

  const [storyProgress, setStoryProgress] = useState<StoryProgress>(loadStoryProgress);
  const [storyOverlay, setStoryOverlay] = useState<'none' | 'memory' | 'letter'>('none');
  const [blindStrokeFixed, setBlindStrokeFixed] = useState<boolean>(false);

  const [activeTool, setActiveTool] = useState<ToolType>('damla');
  const [dropSize, setDropSize] = useState<DropSize>('medium');
  const [activeColor, setActiveColor] = useState<string>(PIGMENTS[0].hex);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [showIntroHint, setShowIntroHint] = useState<boolean>(false);
  const [webglError, setWebglError] = useState<boolean>(false);

  // Guided challenge state
  const [activeChallengeId, setActiveChallengeId] = useState<string>(CHALLENGES[0].id);
  const [telemetry, setTelemetry] = useState<StrokeTelemetry>(EMPTY_TELEMETRY);
  const [showGuide, setShowGuide] = useState<boolean>(true);
  const [bestSealsByLevel, setBestSealsByLevel] = useState<Record<string, number>>(loadBestSeals);

  // Gallery & Paper Transfer ritual state
  const [prints, setPrints] = useState<SavedPrint[]>(loadSavedPrints);
  const [transferCapture, setTransferCapture] = useState<{
    dataUrl: string;
    mode: 'story' | 'challenge' | 'sandbox';
    challengeId?: string;
    chapterId?: string;
    sealsEarned?: number;
    letterChoice?: LetterChoice;
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<EbruEngine | null>(null);
  const audioRef = useRef<EbruAudioEngine | null>(null);
  const atmosphereRef = useRef<AtmosphereOverlayHandle | null>(null);
  const pointersRef = useRef<Map<number, PointerState>>(new Map());

  const activeChapter =
    STORY_CHAPTERS[storyProgress.chapterIndex] ?? STORY_CHAPTERS[0];
  const activeChallenge =
    CHALLENGES.find((c) => c.id === activeChallengeId) ?? CHALLENGES[0];
  const activeChallengeIdx = CHALLENGES.findIndex((c) => c.id === activeChallenge.id);
  const hasNextChallenge = activeChallengeIdx >= 0 && activeChallengeIdx < CHALLENGES.length - 1;

  // Initialize audio engine once
  useEffect(() => {
    const audio = new EbruAudioEngine();
    audio.setMuted(muted);
    audioRef.current = audio;
    return () => {
      audio.destroy();
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.muted, String(muted));
    audioRef.current?.setMuted(muted);
  }, [muted]);

  // Apply theme class & water color
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(STORAGE_KEYS.theme, theme);

    const waterHex =
      view === 'story'
        ? theme === 'dark'
          ? activeChapter.waterDarkHex
          : activeChapter.waterLightHex
        : WATER_HEX[theme];
    engineRef.current?.setWaterColor(waterHex);
  }, [theme, view, activeChapter]);

  // Sync audio season and workshop air-current breeze intensity
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (view === 'story') {
      audioRef.current?.setSeason(activeChapter.season);
      const seasonWind: Record<typeof activeChapter.season, number> = {
        winter_late: 0.45,
        spring: 1.0,
        summer: 1.2,
        autumn: 0.95,
        winter: 0.4,
        epilogue: 0.9,
      };
      engineRef.current?.setWindIntensity(
        prefersReducedMotion ? 0 : seasonWind[activeChapter.season]
      );
    } else {
      audioRef.current?.setSeason('spring');
      engineRef.current?.setWindIntensity(prefersReducedMotion ? 0 : 0.9);
    }
  }, [view, activeChapter]);

  // Apply language attribute & persist
  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem(STORAGE_KEYS.lang, lang);
  }, [lang]);

  // Persist story progress
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.story, JSON.stringify(storyProgress));
    } catch {
      // Ignore storage quota errors
    }
  }, [storyProgress]);

  // Persist gallery & challenge seals safely
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.prints, JSON.stringify(prints));
    } catch {
      if (prints.length > 1) {
        try {
          const trimmed = prints.slice(0, prints.length - 1);
          localStorage.setItem(STORAGE_KEYS.prints, JSON.stringify(trimmed));
        } catch {
          // Ignore if browser blocks localStorage
        }
      }
    }
  }, [prints]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.seals, JSON.stringify(bestSealsByLevel));
    } catch {
      // Ignore storage error
    }
  }, [bestSealsByLevel]);

  const prepareChapterTray = useCallback(
    (chapterIndex: number, letterChoice: LetterChoice, themeOverride?: ThemeMode) => {
      const ch = STORY_CHAPTERS[chapterIndex] ?? STORY_CHAPTERS[0];
      const activeTheme = themeOverride ?? theme;
      const waterHex = activeTheme === 'dark' ? ch.waterDarkHex : ch.waterLightHex;

      setTelemetry(EMPTY_TELEMETRY);
      setBlindStrokeFixed(false);
      setActiveTool(ch.defaultTool);

      const paletteIds = getChapterPalette(ch, letterChoice);
      const firstPigment = PIGMENTS.find((p) => p.id === paletteIds[0]);
      if (firstPigment) setActiveColor(firstPigment.hex);

      const engine = engineRef.current;
      if (engine) {
        engine.setWaterColor(waterHex);
        if (ch.seedBlindStroke) {
          engine.seedUstaBlindStroke();
        } else {
          engine.clearTray(true);
        }
        setCanUndo(false);
      }
    },
    [theme]
  );

  // Initialize WebGL2 engine once, opening directly on Story Mode (Prolog: Empty Tray by default)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const initialCh = STORY_CHAPTERS[storyProgress.chapterIndex] ?? STORY_CHAPTERS[0];
      const initialWater =
        theme === 'dark' ? initialCh.waterDarkHex : initialCh.waterLightHex;
      const engine = new EbruEngine(canvas, initialWater);
      engineRef.current = engine;

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      const initialSeasonWind: Record<typeof initialCh.season, number> = {
        winter_late: 0.45,
        spring: 1.0,
        summer: 1.2,
        autumn: 0.95,
        winter: 0.4,
        epilogue: 0.9,
      };
      engine.setWindIntensity(
        prefersReducedMotion ? 0 : initialSeasonWind[initialCh.season]
      );

      // Setup initial chapter state cleanly (empty tray for Prolog & Epilog, blind stroke for Ch.2)
      if (initialCh.seedBlindStroke) {
        engine.seedUstaBlindStroke();
      } else {
        engine.clearTray(true);
      }
      setActiveTool(initialCh.defaultTool);
      const initialPalette = getChapterPalette(initialCh, storyProgress.letterChoice);
      const firstPigment = PIGMENTS.find((p) => p.id === initialPalette[0]);
      if (firstPigment) setActiveColor(firstPigment.hex);

      engine.start();

      let resizeTimer: number | undefined;
      const onResize = () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
          engine.handleResize();
          setCanUndo(engine.canUndo());
        }, 180);
      };

      window.addEventListener('resize', onResize);
      return () => {
        window.clearTimeout(resizeTimer);
        window.removeEventListener('resize', onResize);
        engine.destroy();
        engineRef.current = null;
      };
    } catch {
      setWebglError(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pause simulation loop when browsing gallery
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (view === 'gallery') {
      engine.stop();
    } else {
      engine.start();
    }
  }, [view]);

  const recordColor = useCallback((hex: string) => {
    setTelemetry((prev) =>
      prev.distinctColors.includes(hex)
        ? prev
        : { ...prev, distinctColors: [...prev.distinctColors, hex] }
    );
  }, []);

  const resetTrayForChallenge = useCallback((challengeId: string) => {
    const target = CHALLENGES.find((c) => c.id === challengeId) ?? CHALLENGES[0];
    setActiveChallengeId(target.id);
    setTelemetry(EMPTY_TELEMETRY);
    setActiveTool(target.recommendedTool);
    const firstPigment = PIGMENTS.find((p) => p.id === target.paletteIds[0]);
    if (firstPigment) setActiveColor(firstPigment.hex);
    setShowGuide(true);
    setShowIntroHint(false);

    const engine = engineRef.current;
    if (engine) {
      engine.setWaterColor(WATER_HEX[theme]);
      engine.clearTray(true);
      setCanUndo(false);
    }
  }, [theme]);

  const handleViewChange = (nextView: AppView) => {
    setStoryOverlay('none');
    if (nextView === 'story' && view !== 'story') {
      prepareChapterTray(storyProgress.chapterIndex, storyProgress.letterChoice);
    } else if (nextView === 'challenges' && view !== 'challenges') {
      resetTrayForChallenge(activeChallengeId);
    } else if (nextView === 'studio' && view !== 'studio') {
      const engine = engineRef.current;
      if (engine) {
        engine.setWaterColor(WATER_HEX[theme]);
        if (view === 'story' && storyProgress.chapterIndex === 0 && telemetry.drops === 0) {
          engine.clearTray(true);
          engine.seedInitial();
        }
      }
    }
    setView(nextView);
  };

  const handleUndo = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.undo()) {
      setCanUndo(engine.canUndo());
    }
  }, []);

  const handleClear = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.pushUndoSnapshot();
    if (view === 'story' && activeChapter.seedBlindStroke) {
      engine.seedUstaBlindStroke();
    } else {
      engine.clearTray(false);
    }
    setCanUndo(engine.canUndo());
    if (view === 'challenges' || view === 'story') {
      setTelemetry(EMPTY_TELEMETRY);
      setBlindStrokeFixed(false);
    }
  }, [view, activeChapter]);

  // Keyboard shortcuts: Ctrl/Cmd+Z for Undo, 1-5 for tools
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
        return;
      }

      if (view === 'gallery' || transferCapture || storyOverlay !== 'none') return;
      const toolMap: Record<string, ToolType> = {
        '1': 'damla',
        '2': 'serpme',
        '3': 'biz',
        '4': 'gelgit',
        '5': 'tarak',
      };
      const next = toolMap[e.key];
      if (next) {
        if (view === 'story' && !activeChapter.unlockedTools.includes(next)) return;
        setActiveTool(next);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleUndo, view, transferCapture, storyOverlay, activeChapter]);

  const getNormalizedPos = (e: React.PointerEvent<HTMLCanvasElement>): [number, number] => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / Math.max(1, rect.width);
    const y = 1 - (e.clientY - rect.top) / Math.max(1, rect.height);
    return [Math.min(0.995, Math.max(0.005, x)), Math.min(0.995, Math.max(0.005, y))];
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const engine = engineRef.current;
    if (!engine) return;

    audioRef.current?.unlock();
    e.currentTarget.setPointerCapture(e.pointerId);
    const [x, y] = getNormalizedPos(e);
    setShowIntroHint(false);

    engine.pushUndoSnapshot();
    setCanUndo(engine.canUndo());

    pointersRef.current.set(e.pointerId, {
      x,
      y,
      lastSpeckleX: x,
      lastSpeckleY: y,
      strokeDist: 0,
    });

    if (activeTool === 'damla') {
      engine.drop(x, y, activeColor, dropSize);
      audioRef.current?.playDrop(dropSize);
      atmosphereRef.current?.spawnRipple(
        e.clientX,
        e.clientY,
        dropSize === 'large' ? 1.35 : dropSize === 'small' ? 0.75 : 1
      );
      const nearCenter = Math.hypot(x - 0.5, y - 0.5) < 0.25;
      recordColor(activeColor);
      setTelemetry((prev) => ({
        ...prev,
        drops: prev.drops + 1,
        centerDrops: prev.centerDrops + (nearCenter ? 1 : 0),
      }));
    } else if (activeTool === 'serpme') {
      const added = engine.speckle(x, y, activeColor, dropSize);
      audioRef.current?.playSpeckle();
      atmosphereRef.current?.spawnRipple(e.clientX, e.clientY, 0.85);
      recordColor(activeColor);
      setTelemetry((prev) => ({ ...prev, speckles: prev.speckles + added }));
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const engine = engineRef.current;
    const state = pointersRef.current.get(e.pointerId);
    if (!engine || !state) return;

    const [x, y] = getNormalizedPos(e);
    const dx = x - state.x;
    const dy = y - state.y;
    const stepDist = Math.hypot(dx, dy);

    if (activeTool === 'serpme') {
      const sinceSpeckle = Math.hypot(x - state.lastSpeckleX, y - state.lastSpeckleY);
      if (sinceSpeckle >= 0.04) {
        const added = engine.speckle(x, y, activeColor, dropSize);
        audioRef.current?.playSpeckle();
        recordColor(activeColor);
        setTelemetry((prev) => ({ ...prev, speckles: prev.speckles + added }));
        state.lastSpeckleX = x;
        state.lastSpeckleY = y;
      }
    } else if (activeTool !== 'damla') {
      engine.dragTool(activeTool, state.x, state.y, x, y);
      if (stepDist > 0.004) {
        audioRef.current?.playCombDrag(stepDist, activeTool === 'tarak' || activeTool === 'biz');
      }
      state.strokeDist += stepDist;
    }

    state.x = x;
    state.y = y;
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const state = pointersRef.current.get(e.pointerId);
    pointersRef.current.delete(e.pointerId);
    if (!state) return;

    if (activeTool === 'biz' && state.strokeDist > 0.02) {
      setTelemetry((prev) => ({ ...prev, bizDistance: prev.bizDistance + state.strokeDist }));
    } else if (activeTool === 'gelgit' && state.strokeDist >= 0.16) {
      const passes = Math.max(1, Math.round(state.strokeDist / 0.45));
      setTelemetry((prev) => ({ ...prev, gelgitPasses: prev.gelgitPasses + passes }));
      if (view === 'story' && activeChapter.seedBlindStroke) {
        setBlindStrokeFixed(true);
      }
    } else if (activeTool === 'tarak' && state.strokeDist >= 0.16) {
      const passes = Math.max(1, Math.round(state.strokeDist / 0.45));
      setTelemetry((prev) => ({ ...prev, tarakPasses: prev.tarakPasses + passes }));
    }
  };

  const handleTransferToPaper = () => {
    const engine = engineRef.current;
    if (!engine) return;
    audioRef.current?.unlock();
    const dataUrl = engine.captureMirroredPrint();

    if (view === 'story') {
      if (activeChapter.isFinalPrintChapter && storyProgress.letterChoice === 'shown') {
        window.setTimeout(() => audioRef.current?.playDoorKnock(), 1350);
      }
      setTransferCapture({
        dataUrl,
        mode: 'story',
        chapterId: activeChapter.id,
        letterChoice: storyProgress.letterChoice,
      });
    } else if (view === 'challenges') {
      const seals = evaluateChallengeSeals(activeChallenge, telemetry);
      setBestSealsByLevel((prev) => ({
        ...prev,
        [activeChallenge.id]: Math.max(prev[activeChallenge.id] ?? 0, seals),
      }));
      setTransferCapture({
        dataUrl,
        mode: 'challenge',
        challengeId: activeChallenge.id,
        sealsEarned: seals,
      });
    } else {
      setTransferCapture({
        dataUrl,
        mode: 'sandbox',
      });
    }
  };

  const handleSavePrintToGallery = (title: string) => {
    if (!transferCapture) return;
    const newPrint: SavedPrint = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      mode: transferCapture.mode,
      challengeId: transferCapture.challengeId,
      chapterId: transferCapture.chapterId,
      seals: transferCapture.sealsEarned,
      letterChoice: transferCapture.letterChoice,
      dataUrl: transferCapture.dataUrl,
      createdAt: Date.now(),
    };
    setPrints((prev) => [newPrint, ...prev]);
  };

  const handleSelectColor = (hex: string) => {
    setActiveColor(hex);
    if (activeTool !== 'damla' && activeTool !== 'serpme') {
      setActiveTool('damla');
    }
  };

  // Story progression handlers
  const handleRevealMemory = () => {
    audioRef.current?.playMemoryChord();
    setStoryProgress((prev) => {
      const memories = prev.unlockedMemories.includes(activeChapter.memoryId)
        ? prev.unlockedMemories
        : [...prev.unlockedMemories, activeChapter.memoryId];
      const notebook =
        prev.playStyle === 'usta' &&
        activeChapter.ustaComplete(telemetry) &&
        !prev.ustaNotebookChapters.includes(activeChapter.id)
          ? [...prev.ustaNotebookChapters, activeChapter.id]
          : prev.ustaNotebookChapters;
      return {
        ...prev,
        unlockedMemories: memories,
        ustaNotebookChapters: notebook,
      };
    });
    setStoryOverlay('memory');
  };

  const advanceToStoryChapter = (nextIdx: number, nextChoice?: LetterChoice) => {
    const clampedIdx = Math.min(STORY_CHAPTERS.length - 1, Math.max(0, nextIdx));
    const choiceToUse = nextChoice ?? storyProgress.letterChoice;
    setStoryOverlay('none');
    setStoryProgress((prev) => ({
      ...prev,
      chapterIndex: clampedIdx,
      letterChoice: choiceToUse,
    }));
    prepareChapterTray(clampedIdx, choiceToUse);
  };

  const handleMemoryContinue = () => {
    if (activeChapter.letter) {
      setStoryOverlay('letter');
    } else {
      advanceToStoryChapter(activeChapter.index + 1);
    }
  };

  const handleCompleteStoryFinale = () => {
    setTransferCapture(null);
    const epilogIdx = STORY_CHAPTERS.length - 1;
    setStoryProgress((prev) => ({
      ...prev,
      chapterIndex: epilogIdx,
      completedStory: true,
      unlockedMemories: prev.unlockedMemories.includes('mem-winter')
        ? prev.unlockedMemories
        : [...prev.unlockedMemories, 'mem-winter'],
      ustaNotebookChapters:
        prev.playStyle === 'usta' && !prev.ustaNotebookChapters.includes('bolum-4-kis')
          ? [...prev.ustaNotebookChapters, 'bolum-4-kis']
          : prev.ustaNotebookChapters,
    }));
    prepareChapterTray(epilogIdx, storyProgress.letterChoice);
  };

  const handleRestartStory = () => {
    setStoryOverlay('none');
    setStoryProgress({
      ...DEFAULT_STORY_PROGRESS,
      playStyle: storyProgress.playStyle,
    });
    prepareChapterTray(0, 'pending');
  };

  const t = COPY[lang];

  const storyPaletteIds =
    view === 'story' ? getChapterPalette(activeChapter, storyProgress.letterChoice) : undefined;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[var(--atelier-bg)] text-[var(--atelier-ink)] select-none">
      <TopBar
        lang={lang}
        theme={theme}
        view={view}
        muted={muted}
        galleryCount={prints.length}
        onChangeView={handleViewChange}
        onToggleLang={() => setLang((prev) => (prev === 'tr' ? 'en' : 'tr'))}
        onToggleTheme={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
        onToggleMute={() => setMuted((m) => !m)}
        onTransferToPaper={handleTransferToPaper}
      />

      {/* Persistent Full-Bleed Marbling Tray Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        className={`fixed inset-0 h-full w-full touch-none transition-opacity duration-200 ${
          view === 'gallery' ? 'pointer-events-none opacity-0' : 'opacity-100'
        } ${activeTool === 'damla' || activeTool === 'serpme' ? 'cursor-crosshair' : 'cursor-pointer'}`}
      />

      {/* WebGL2 Unsupported Fallback */}
      {webglError && view !== 'gallery' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[var(--atelier-bg)] p-6">
          <div className="max-w-md rounded-2xl border border-[var(--atelier-line)] bg-[var(--atelier-surface)] p-6 text-center shadow-lg">
            <h1 className="font-display text-xl font-semibold text-[var(--atelier-ink)]">
              {t.webglErrorTitle}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[var(--atelier-muted)]">
              {t.webglErrorBody}
            </p>
          </div>
        </div>
      )}

      {/* Subtle CSS Post-Processing Light Caustics Layer over WebGL2 Water */}
      <WaterCausticsOverlay active={view !== 'gallery' && !webglError} />

      {/* Subtle Floating Kitre Dust & Light Water Ripples in Story & Studio */}
      <AtmosphereOverlay
        ref={atmosphereRef}
        theme={theme}
        season={view === 'story' ? activeChapter.season : undefined}
        active={(view === 'story' || view === 'studio') && !webglError}
      />

      {/* Optional Non-Blocking SVG Guide Overlay for Challenges */}
      {view === 'challenges' && showGuide && !webglError && (
        <GuideOverlay guideType={activeChallenge.guideType} />
      )}

      {/* Gentle Dismissible Intro Banner in Free Studio */}
      {view === 'studio' && showIntroHint && !webglError && (
        <div className="fixed top-18 left-4 z-20 max-w-sm rounded-2xl border border-[var(--atelier-line)] bg-[var(--atelier-surface)] p-4 shadow-md backdrop-blur-md sm:top-20 sm:left-6">
          <p className="text-xs leading-relaxed text-[var(--atelier-ink)]">{t.introPrompt}</p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleViewChange('challenges')}
              className="h-9 rounded-lg bg-[var(--atelier-ink)] px-3 text-xs font-semibold text-[var(--atelier-bg)] transition-opacity hover:opacity-90"
            >
              {t.introCtaChallenge}
            </button>
            <button
              type="button"
              onClick={() => setShowIntroHint(false)}
              className="h-9 rounded-lg px-2.5 text-xs font-medium text-[var(--atelier-muted)] hover:text-[var(--atelier-ink)]"
            >
              {t.introDismiss}
            </button>
          </div>
        </div>
      )}

      {/* Story Mode HUD */}
      {view === 'story' && !webglError && (
        <StoryHud
          lang={lang}
          chapter={activeChapter}
          progress={storyProgress}
          telemetry={telemetry}
          blindStrokeFixed={blindStrokeFixed}
          onSelectPlayStyle={(style: StoryPlayStyle) =>
            setStoryProgress((prev) => ({ ...prev, playStyle: style }))
          }
          onSelectChapter={(idx) => advanceToStoryChapter(idx)}
          onRevealMemory={handleRevealMemory}
          onOpenLetter={() => setStoryOverlay('letter')}
          onRestartStory={handleRestartStory}
          onFinishToStudio={() => handleViewChange('studio')}
        />
      )}

      {/* Guided Challenge Tracker */}
      {view === 'challenges' && !webglError && (
        <ChallengeHud
          lang={lang}
          challenge={activeChallenge}
          telemetry={telemetry}
          showGuide={showGuide}
          bestSealsByLevel={bestSealsByLevel}
          onSelectChallenge={resetTrayForChallenge}
          onToggleGuide={() => setShowGuide((g) => !g)}
          onResetChallenge={() => resetTrayForChallenge(activeChallenge.id)}
        />
      )}

      {/* Workshop Cat Kitre in Story & Studio views */}
      {(view === 'story' || view === 'studio') && !webglError && (
        <KitreCat lang={lang} onPet={() => audioRef.current?.playPurr()} />
      )}

      {/* Bottom Floating Atelier Dock */}
      {view !== 'gallery' && !webglError && (
        <ToolDock
          lang={lang}
          activeTool={activeTool}
          dropSize={dropSize}
          activeColor={activeColor}
          canUndo={canUndo}
          allowedTools={view === 'story' ? activeChapter.unlockedTools : undefined}
          recommendedPaletteIds={
            view === 'story'
              ? storyPaletteIds
              : view === 'challenges'
                ? activeChallenge.paletteIds
                : undefined
          }
          onSelectTool={setActiveTool}
          onSelectDropSize={setDropSize}
          onSelectColor={handleSelectColor}
          onUndo={handleUndo}
          onClear={handleClear}
        />
      )}

      {/* Atelier Gallery View */}
      {view === 'gallery' && (
        <GalleryView
          lang={lang}
          prints={prints}
          onDeletePrint={(id) => setPrints((prev) => prev.filter((p) => p.id !== id))}
          onGoToStudio={() => setView('studio')}
        />
      )}

      {/* Water Surface Memory Overlay */}
      {view === 'story' && storyOverlay === 'memory' && (
        <WaterMemoryOverlay
          lang={lang}
          chapter={activeChapter}
          onContinue={handleMemoryContinue}
        />
      )}

      {/* Nur's Letter Modal */}
      {view === 'story' && storyOverlay === 'letter' && activeChapter.letter && (
        <NurLetterModal
          lang={lang}
          letter={activeChapter.letter}
          currentChoice={storyProgress.letterChoice}
          onAcknowledge={() => advanceToStoryChapter(activeChapter.index + 1)}
          onChoose={(choice) => advanceToStoryChapter(activeChapter.index + 1, choice)}
          onClose={() => setStoryOverlay('none')}
        />
      )}

      {/* Ceremonial Paper Transfer Modal */}
      {transferCapture && (
        <PaperTransferModal
          lang={lang}
          imageDataUrl={transferCapture.dataUrl}
          mode={transferCapture.mode}
          challenge={
            transferCapture.challengeId
              ? CHALLENGES.find((c) => c.id === transferCapture.challengeId)
              : undefined
          }
          sealsEarned={transferCapture.sealsEarned}
          letterChoice={transferCapture.letterChoice}
          hasNextChallenge={hasNextChallenge}
          onSaveToGallery={handleSavePrintToGallery}
          onNextChallenge={() => {
            setTransferCapture(null);
            if (hasNextChallenge) {
              resetTrayForChallenge(CHALLENGES[activeChallengeIdx + 1].id);
            }
          }}
          onCompleteStoryFinale={
            transferCapture.mode === 'story' ? handleCompleteStoryFinale : undefined
          }
          onClose={() => setTransferCapture(null)}
        />
      )}
    </div>
  );
}
