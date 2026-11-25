import { BookOpen, Check, ChevronDown, ChevronUp, RotateCcw, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { COPY } from '../data/i18n';
import { STORY_CHAPTERS } from '../data/storyData';
import type {
  Language,
  StoryChapterDef,
  StoryPlayStyle,
  StoryProgress,
  StrokeTelemetry,
} from '../types/ebru';

interface StoryHudProps {
  lang: Language;
  chapter: StoryChapterDef;
  progress: StoryProgress;
  telemetry: StrokeTelemetry;
  blindStrokeFixed: boolean;
  onSelectPlayStyle: (style: StoryPlayStyle) => void;
  onSelectChapter: (index: number) => void;
  onRevealMemory: () => void;
  onOpenLetter: () => void;
  onRestartStory: () => void;
  onFinishToStudio: () => void;
}

export function StoryHud({
  lang,
  chapter,
  progress,
  telemetry,
  blindStrokeFixed,
  onSelectPlayStyle,
  onSelectChapter,
  onRevealMemory,
  onOpenLetter,
  onRestartStory,
  onFinishToStudio,
}: StoryHudProps) {
  const [collapsed, setCollapsed] = useState(false);
  const t = COPY[lang];

  const isUsta = progress.playStyle === 'usta';
  const chapterReady = isUsta
    ? chapter.ustaComplete(telemetry)
    : chapter.sakinComplete(telemetry);

  const highestReachable = Math.max(
    progress.chapterIndex,
    progress.completedStory ? STORY_CHAPTERS.length - 1 : progress.unlockedMemories.length
  );

  return (
    <aside
      aria-label={t.navStory}
      className="pointer-events-auto fixed top-16 left-3 z-20 w-[calc(100vw-24px)] max-w-[360px] rounded-2xl border border-[var(--atelier-line)] bg-[var(--atelier-surface)] p-3.5 shadow-md backdrop-blur-md sm:top-20 sm:left-5"
    >
      {/* Chapter Dots & Play Style Switcher */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1" role="group" aria-label="Chapters">
          {STORY_CHAPTERS.map((ch) => {
            const active = ch.index === chapter.index;
            const unlocked = ch.index <= highestReachable || progress.completedStory;
            const hasUstaSeal = progress.ustaNotebookChapters.includes(ch.id);
            return (
              <button
                key={ch.id}
                type="button"
                disabled={!unlocked}
                onClick={() => onSelectChapter(ch.index)}
                title={lang === 'tr' ? `${ch.seasonTr}: ${ch.titleTr}` : `${ch.seasonEn}: ${ch.titleEn}`}
                className={`font-mono-tabular flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--atelier-ink)] ${
                  active
                    ? 'bg-[var(--atelier-ink)] text-[var(--atelier-bg)]'
                    : hasUstaSeal
                      ? 'border border-[var(--atelier-gold)]/60 text-[var(--atelier-ink)] hover:bg-black/5 dark:hover:bg-white/10'
                      : unlocked
                        ? 'border border-[var(--atelier-line)] text-[var(--atelier-muted)] hover:text-[var(--atelier-ink)]'
                        : 'cursor-not-allowed border border-[var(--atelier-line)]/50 text-[var(--atelier-muted)]/35'
                }`}
              >
                {ch.index === 0 ? 'P' : ch.index === 5 ? 'E' : ch.index}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? 'Expand story panel' : 'Collapse story panel'}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--atelier-muted)] hover:bg-black/5 hover:text-[var(--atelier-ink)] dark:hover:bg-white/10"
        >
          {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
      </div>

      {/* Season + Chapter Title */}
      <div className="mt-2.5">
        <div className="flex items-center justify-between gap-2 text-xs text-[var(--atelier-muted)]">
          <span>{lang === 'tr' ? chapter.seasonTr : chapter.seasonEn}</span>
          {progress.ustaNotebookChapters.length > 0 && (
            <span className="font-mono-tabular">
              {t.story.ustaNotebookCount} {progress.ustaNotebookChapters.length}/5
            </span>
          )}
        </div>
        <h2 className="font-display mt-0.5 text-lg font-semibold text-[var(--atelier-ink)]">
          {lang === 'tr' ? chapter.titleTr : chapter.titleEn}
        </h2>
      </div>

      {!collapsed && (
        <>
          {/* Usta Emin Efendi's Whispered Line */}
          <p className="font-display mt-2 text-sm italic leading-relaxed text-[var(--atelier-ink)]">
            {lang === 'tr' ? chapter.ustaLineTr : chapter.ustaLineEn}
          </p>

          {/* Sakin Mod / Usta Modu Segmented Toggle */}
          <div
            role="group"
            aria-label="Play style"
            className="mt-3 grid grid-cols-2 gap-1 rounded-xl border border-[var(--atelier-line)] p-1"
          >
            {(['sakin', 'usta'] as StoryPlayStyle[]).map((style) => {
              const active = progress.playStyle === style;
              return (
                <button
                  key={style}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSelectPlayStyle(style)}
                  className={`h-8 whitespace-nowrap rounded-lg px-2 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-[var(--atelier-ink)] text-[var(--atelier-bg)]'
                      : 'text-[var(--atelier-muted)] hover:text-[var(--atelier-ink)]'
                  }`}
                >
                  {style === 'sakin' ? t.story.modeSakin : t.story.modeUsta}
                </button>
              );
            })}
          </div>

          {/* Current Objective / Narrative Cue */}
          <div className="mt-3 border-t border-[var(--atelier-line)] pt-2.5 text-xs leading-relaxed text-[var(--atelier-muted)]">
            {chapter.seedBlindStroke && !blindStrokeFixed && (
              <p className="mb-1.5 font-medium text-[var(--atelier-ink)]">
                {t.story.blindMomentNote}
              </p>
            )}
            {chapter.seedBlindStroke && blindStrokeFixed && (
              <p className="mb-1.5 font-medium text-[var(--atelier-gold)]">
                {t.story.blindMomentUnlocked}
              </p>
            )}
            <p>
              {isUsta
                ? lang === 'tr'
                  ? chapter.ustaGoalTr
                  : chapter.ustaGoalEn
                : lang === 'tr'
                  ? chapter.sakinGoalTr
                  : chapter.sakinGoalEn}
            </p>
          </div>

          {/* Action Triggers */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {chapter.letter && (
              <button
                type="button"
                onClick={onOpenLetter}
                className="flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-[var(--atelier-line)] px-3 text-xs font-medium text-[var(--atelier-ink)] transition-colors hover:bg-black/5 dark:hover:bg-white/10"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>{t.story.readLetterBtn}</span>
              </button>
            )}

            {chapterReady && !chapter.isFinalPrintChapter && !chapter.isEpilogue && (
              <button
                type="button"
                onClick={onRevealMemory}
                className="flex h-9 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-[var(--atelier-accent)] px-3 text-xs font-semibold text-white transition-opacity hover:opacity-95"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{t.story.revealMemoryBtn}</span>
              </button>
            )}

            {chapter.isFinalPrintChapter && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-[var(--atelier-gold)]">
                <Check className="h-3.5 w-3.5 shrink-0" />
                <span>{t.story.finalPrintPrompt}</span>
              </p>
            )}

            {chapter.isEpilogue && (
              <div className="flex w-full items-center gap-2">
                <button
                  type="button"
                  onClick={onFinishToStudio}
                  className="h-9 flex-1 whitespace-nowrap rounded-lg bg-[var(--atelier-ink)] px-3 text-xs font-semibold text-[var(--atelier-bg)] transition-opacity hover:opacity-90"
                >
                  {t.story.epilogueFinishBtn}
                </button>
                <button
                  type="button"
                  onClick={onRestartStory}
                  title={t.story.restartStory}
                  className="flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-[var(--atelier-line)] px-2.5 text-xs font-medium text-[var(--atelier-ink)] hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>{t.story.restartStory}</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </aside>
  );
}
