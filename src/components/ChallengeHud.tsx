import { Check, Eye, EyeOff, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { CHALLENGES } from '../data/ebruData';
import { COPY } from '../data/i18n';
import type { ChallengeDef, Language, StrokeTelemetry } from '../types/ebru';

interface ChallengeHudProps {
  lang: Language;
  challenge: ChallengeDef;
  telemetry: StrokeTelemetry;
  showGuide: boolean;
  bestSealsByLevel: Record<string, number>;
  onSelectChallenge: (challengeId: string) => void;
  onToggleGuide: () => void;
  onResetChallenge: () => void;
}

export function ChallengeHud({
  lang,
  challenge,
  telemetry,
  showGuide,
  bestSealsByLevel,
  onSelectChallenge,
  onToggleGuide,
  onResetChallenge,
}: ChallengeHudProps) {
  const [collapsed, setCollapsed] = useState(false);
  const t = COPY[lang];

  const completedSteps = challenge.steps.filter((s) => s.isComplete(telemetry)).length;
  const allComplete = completedSteps === challenge.steps.length;

  return (
    <aside
      aria-label={t.navChallenges}
      className="pointer-events-auto fixed top-16 left-3 z-20 w-[calc(100vw-24px)] max-w-[340px] rounded-2xl border border-[var(--atelier-line)] bg-[var(--atelier-surface)] p-3.5 shadow-md backdrop-blur-md sm:top-20 sm:left-5"
    >
      {/* Level Selector Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {CHALLENGES.map((item) => {
            const active = item.id === challenge.id;
            const seals = bestSealsByLevel[item.id] ?? 0;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectChallenge(item.id)}
                aria-label={`${item.level}. ${lang === 'tr' ? item.titleTr : item.titleEn}`}
                className={`font-mono-tabular flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--atelier-ink)] ${
                  active
                    ? 'bg-[var(--atelier-ink)] text-[var(--atelier-bg)]'
                    : seals > 0
                      ? 'border border-[var(--atelier-gold)]/50 text-[var(--atelier-ink)] hover:bg-black/5 dark:hover:bg-white/10'
                      : 'border border-[var(--atelier-line)] text-[var(--atelier-muted)] hover:text-[var(--atelier-ink)]'
                }`}
              >
                {item.level}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? 'Expand steps' : 'Collapse steps'}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--atelier-muted)] hover:bg-black/5 hover:text-[var(--atelier-ink)] dark:hover:bg-white/10"
        >
          {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
      </div>

      {/* Title & Metadata Line (unboxed text) */}
      <div className="mt-2.5 flex items-baseline justify-between gap-2">
        <h2 className="font-display text-base font-semibold text-[var(--atelier-ink)]">
          {lang === 'tr' ? challenge.titleTr : challenge.titleEn}
        </h2>
        <span className="font-mono-tabular shrink-0 text-xs text-[var(--atelier-muted)]">
          {t.stepProgress} {completedSteps}/{challenge.steps.length}
        </span>
      </div>

      {!collapsed && (
        <>
          <p className="mt-1 text-xs leading-relaxed text-[var(--atelier-muted)]">
            {lang === 'tr' ? challenge.subtitleTr : challenge.subtitleEn}
          </p>

          {/* Step Checklist */}
          <ul className="mt-3 space-y-2 border-t border-[var(--atelier-line)] pt-2.5">
            {challenge.steps.map((step, idx) => {
              const done = step.isComplete(telemetry);
              return (
                <li key={step.id} className="flex items-start gap-2.5 text-xs leading-snug">
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                      done
                        ? 'border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500'
                        : 'border-[var(--atelier-line)] text-[var(--atelier-muted)]'
                    }`}
                  >
                    {done ? (
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    ) : (
                      <span className="font-mono-tabular text-[10px]">{idx + 1}</span>
                    )}
                  </span>
                  <span
                    className={
                      done
                        ? 'text-[var(--atelier-muted)] line-through decoration-[var(--atelier-muted)]/60'
                        : 'text-[var(--atelier-ink)]'
                    }
                  >
                    {lang === 'tr' ? step.textTr : step.textEn}
                  </span>
                </li>
              );
            })}
          </ul>

          {allComplete && (
            <p className="mt-2.5 rounded-lg bg-[var(--atelier-gold)]/15 px-2.5 py-1.5 text-xs font-medium text-[var(--atelier-ink)]">
              {t.readyToTransfer}
            </p>
          )}

          {/* Controls */}
          <div className="mt-3 flex items-center gap-2 border-t border-[var(--atelier-line)] pt-2.5">
            <button
              type="button"
              onClick={onToggleGuide}
              aria-pressed={showGuide}
              className="flex h-9 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-[var(--atelier-line)] px-2.5 text-xs font-medium text-[var(--atelier-ink)] transition-colors hover:bg-black/5 dark:hover:bg-white/10"
            >
              {showGuide ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              <span>{showGuide ? t.guideOn : t.guideOff}</span>
            </button>

            <button
              type="button"
              onClick={onResetChallenge}
              className="flex h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-[var(--atelier-line)] px-2.5 text-xs font-medium text-[var(--atelier-ink)] transition-colors hover:bg-black/5 dark:hover:bg-white/10"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>{t.resetChallenge}</span>
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
