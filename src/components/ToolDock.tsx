import {
  AlignJustify,
  Droplet,
  Eraser,
  Lock,
  PenTool,
  RotateCcw,
  Sparkles,
  Waves,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { PIGMENTS } from '../data/ebruData';
import { COPY } from '../data/i18n';
import type { DropSize, Language, ToolType } from '../types/ebru';

interface ToolDockProps {
  lang: Language;
  activeTool: ToolType;
  dropSize: DropSize;
  activeColor: string;
  canUndo: boolean;
  allowedTools?: ToolType[];
  recommendedPaletteIds?: string[];
  onSelectTool: (tool: ToolType) => void;
  onSelectDropSize: (size: DropSize) => void;
  onSelectColor: (hex: string) => void;
  onUndo: () => void;
  onClear: () => void;
}

const TOOL_ORDER: Array<{ id: ToolType; icon: typeof Droplet }> = [
  { id: 'damla', icon: Droplet },
  { id: 'serpme', icon: Sparkles },
  { id: 'biz', icon: PenTool },
  { id: 'gelgit', icon: Waves },
  { id: 'tarak', icon: AlignJustify },
];

const SIZES: DropSize[] = ['small', 'medium', 'large'];

export function ToolDock({
  lang,
  activeTool,
  dropSize,
  activeColor,
  canUndo,
  allowedTools,
  recommendedPaletteIds,
  onSelectTool,
  onSelectDropSize,
  onSelectColor,
  onUndo,
  onClear,
}: ToolDockProps) {
  const [hoveredTool, setHoveredTool] = useState<ToolType | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const t = COPY[lang];
  const showSizeControls = activeTool === 'damla' || activeTool === 'serpme';

  const orderedPigments = recommendedPaletteIds
    ? [
        ...PIGMENTS.filter((p) => recommendedPaletteIds.includes(p.id)),
        ...PIGMENTS.filter((p) => !recommendedPaletteIds.includes(p.id)),
      ]
    : PIGMENTS;

  const hoveredLocked =
    hoveredTool && allowedTools ? !allowedTools.includes(hoveredTool) : false;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-20 flex flex-col items-center gap-2 px-3 pb-[env(safe-area-inset-bottom,0px)]">
      {/* Context-Aware Historical & Functional Tooltip (or active tool hint when idle) */}
      <AnimatePresence mode="wait">
        {hoveredTool ? (
          <motion.div
            key={`tooltip-${hoveredTool}`}
            role="tooltip"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-sm rounded-xl border border-[var(--atelier-line)] bg-[var(--atelier-surface)] px-3.5 py-2.5 text-center shadow-md backdrop-blur-md"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="font-display text-xs font-semibold text-[var(--atelier-ink)]">
                {t.tools[hoveredTool].label}
              </span>
              {hoveredLocked && (
                <span className="text-[11px] text-[var(--atelier-muted)]">
                  · {t.story.lockedToolHint}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-[var(--atelier-ink)]">
              {t.tools[hoveredTool].lore}
            </p>
          </motion.div>
        ) : (
          <motion.p
            key="active-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="hidden rounded-md bg-[var(--atelier-surface)] px-3 py-1 text-xs text-[var(--atelier-muted)] backdrop-blur-sm sm:block"
          >
            {t.tools[activeTool].hint}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-2.5 rounded-2xl border border-[var(--atelier-line)] bg-[var(--atelier-surface)] p-2 shadow-lg backdrop-blur-md sm:gap-3 sm:px-3.5 sm:py-2.5">
        {/* Tools Segmented Group */}
        <div role="group" aria-label="Tools" className="flex items-center gap-1">
          {TOOL_ORDER.map(({ id, icon: Icon }) => {
            const active = activeTool === id;
            const locked = allowedTools ? !allowedTools.includes(id) : false;
            return (
              <button
                key={id}
                type="button"
                aria-disabled={locked}
                aria-pressed={active}
                onMouseEnter={() => setHoveredTool(id)}
                onMouseLeave={() => setHoveredTool((curr) => (curr === id ? null : curr))}
                onFocus={() => setHoveredTool(id)}
                onBlur={() => setHoveredTool((curr) => (curr === id ? null : curr))}
                onClick={() => {
                  if (!locked) onSelectTool(id);
                }}
                className={`flex h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3 text-xs font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--atelier-ink)] ${
                  locked
                    ? 'cursor-not-allowed text-[var(--atelier-muted)] opacity-35'
                    : active
                      ? 'bg-[var(--atelier-ink)] text-[var(--atelier-bg)] shadow-sm'
                      : 'text-[var(--atelier-ink)] hover:bg-black/5 dark:hover:bg-white/10'
                }`}
              >
                {locked ? (
                  <Lock className="h-3 w-3 shrink-0" />
                ) : (
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                )}
                <span>{t.tools[id].label}</span>
              </button>
            );
          })}
        </div>

        {/* Drop Size Selector (shown for Damla & Serpme) */}
        {showSizeControls && (
          <>
            <div className="hidden h-6 w-px bg-[var(--atelier-line)] sm:block" aria-hidden="true" />
            <div
              role="group"
              aria-label="Drop size"
              className="flex items-center gap-1 rounded-xl border border-[var(--atelier-line)] p-0.5"
            >
              {SIZES.map((size) => {
                const active = dropSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onSelectDropSize(size)}
                    className={`h-9 shrink-0 whitespace-nowrap rounded-lg px-2.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--atelier-ink)] ${
                      active
                        ? 'bg-[var(--atelier-ink)] text-[var(--atelier-bg)]'
                        : 'text-[var(--atelier-muted)] hover:text-[var(--atelier-ink)]'
                    }`}
                  >
                    {t.dropSizes[size]}
                  </button>
                );
              })}
            </div>
          </>
        )}

        <div className="hidden h-6 w-px bg-[var(--atelier-line)] sm:block" aria-hidden="true" />

        {/* Pigment Swatches */}
        <div role="group" aria-label="Pigments" className="flex items-center gap-1.5">
          {orderedPigments.map((pigment) => {
            const active = activeColor.toLowerCase() === pigment.hex.toLowerCase();
            const name = lang === 'tr' ? pigment.nameTr : pigment.nameEn;
            const flowTag =
              pigment.viscosity < 0.4
                ? lang === 'tr'
                  ? 'Akışkan'
                  : 'Fluid'
                : pigment.viscosity > 0.72
                  ? lang === 'tr'
                    ? 'Yoğun'
                    : 'Dense'
                  : lang === 'tr'
                    ? 'Dengeli'
                    : 'Balanced';
            const label = `${name} · ${flowTag}`;
            const isRecommended = recommendedPaletteIds?.includes(pigment.id);
            return (
              <button
                key={pigment.id}
                type="button"
                aria-label={label}
                title={label}
                aria-pressed={active}
                onClick={() => onSelectColor(pigment.hex)}
                className={`relative h-9 w-9 shrink-0 rounded-full border border-black/20 transition-transform duration-150 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--atelier-ink)] dark:border-white/25 sm:h-8 sm:w-8 ${
                  active
                    ? 'scale-110 ring-2 ring-[var(--atelier-ink)] ring-offset-2 ring-offset-[var(--atelier-bg)]'
                    : ''
                } ${recommendedPaletteIds && !isRecommended ? 'opacity-55 hover:opacity-100' : ''}`}
                style={{ backgroundColor: pigment.hex }}
              />
            );
          })}
        </div>

        <div className="hidden h-6 w-px bg-[var(--atelier-line)] sm:block" aria-hidden="true" />

        {/* Undo & Clear Actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title={`${t.undo} (Ctrl+Z)`}
            className="flex h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-[var(--atelier-line)] px-3 text-xs font-medium text-[var(--atelier-ink)] transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--atelier-ink)]"
          >
            <RotateCcw className="h-3.5 w-3.5 shrink-0" />
            <span>{t.undo}</span>
          </button>

          <button
            type="button"
            onClick={onClear}
            className="flex h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-[var(--atelier-line)] px-3 text-xs font-medium text-[var(--atelier-ink)] transition-colors hover:bg-black/5 dark:hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--atelier-ink)]"
          >
            <Eraser className="h-3.5 w-3.5 shrink-0" />
            <span>{t.clear}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
