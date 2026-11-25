import { ArrowRight } from 'lucide-react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import type React from 'react';
import { COPY } from '../data/i18n';
import type { Language, StoryChapterDef } from '../types/ebru';

interface WaterMemoryOverlayProps {
  lang: Language;
  chapter: StoryChapterDef;
  onContinue: () => void;
}

function SilhouetteIllustration({
  memoryId,
  driftX,
  driftY,
  rippleX,
  rippleY,
  tilt,
  reducedMotion,
}: {
  memoryId: string;
  driftX: MotionValue<number>;
  driftY: MotionValue<number>;
  rippleX: MotionValue<number>;
  rippleY: MotionValue<number>;
  tilt: MotionValue<number>;
  reducedMotion: boolean;
}) {
  return (
    <motion.div
      animate={
        reducedMotion
          ? undefined
          : {
              y: [0, -3.5, 0],
              transition: { duration: 5.2, repeat: Infinity, ease: 'easeInOut' },
            }
      }
      className="relative mx-auto h-44 w-full max-w-xs"
    >
      <svg
        viewBox="0 0 320 180"
        className="h-full w-full text-[var(--atelier-ink)]"
        fill="none"
        aria-hidden="true"
      >
        {/* Ethereal surfacing water ripples — subtly counter-drifting and synced with glow */}
        <motion.g
          style={reducedMotion ? undefined : { x: rippleX, y: rippleY }}
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <g className={reducedMotion ? undefined : 'memory-ripple-sync'}>
            <ellipse
              cx="160"
              cy="142"
              rx="124"
              ry="17"
              stroke="currentColor"
              strokeOpacity="0.24"
              strokeWidth="1.2"
            />
            <ellipse
              cx="160"
              cy="142"
              rx="78"
              ry="10"
              stroke="var(--atelier-gold)"
              strokeOpacity="0.42"
              strokeWidth="1.2"
            />
          </g>
        </motion.g>

        {/* Main silhouette emerging softly through the water surface */}
        <motion.g
          style={
            reducedMotion
              ? undefined
              : {
                  x: driftX,
                  y: driftY,
                  rotate: tilt,
                  transformOrigin: '160px 100px',
                }
          }
          initial={
            reducedMotion
              ? { opacity: 0.85 }
              : { opacity: 0, y: 12, filter: 'blur(5px)' }
          }
          animate={{ opacity: 0.85, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1.25, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          <g className={reducedMotion ? undefined : 'memory-silhouette-glow'}>
          {memoryId === 'mem-prolog' && (
            <>
              {/* Young Usta's poised hands holding a single brush/drop */}
              <path
                d="M84 82 C108 76, 134 86, 148 96 C140 106, 114 106, 86 98 Z"
                fill="currentColor"
                fillOpacity="0.18"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M236 78 C210 74, 186 84, 170 96 C178 106, 206 105, 234 96 Z"
                fill="currentColor"
                fillOpacity="0.18"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <line
                x1="160"
                y1="54"
                x2="160"
                y2="104"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="160" cy="120" r="4" fill="var(--atelier-accent)" />
            </>
          )}

          {memoryId === 'mem-spring' && (
            <>
              {/* Two silhouettes side by side leaning toward the tray */}
              <circle
                cx="122"
                cy="58"
                r="16"
                fill="currentColor"
                fillOpacity="0.18"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M92 126 C92 92, 152 92, 152 126"
                fill="currentColor"
                fillOpacity="0.14"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <circle
                cx="196"
                cy="64"
                r="14"
                fill="currentColor"
                fillOpacity="0.18"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M168 126 C168 96, 224 96, 224 126"
                fill="currentColor"
                fillOpacity="0.14"
                stroke="currentColor"
                strokeWidth="1.6"
              />
            </>
          )}

          {memoryId === 'mem-summer' && (
            <>
              {/* Two figures turned slightly apart beside wavering comb lines */}
              <circle
                cx="104"
                cy="62"
                r="15"
                fill="currentColor"
                fillOpacity="0.16"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path d="M76 124 C78 92, 128 92, 132 124" stroke="currentColor" strokeWidth="1.6" />
              <circle
                cx="216"
                cy="62"
                r="15"
                fill="currentColor"
                fillOpacity="0.16"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path d="M188 124 C192 92, 242 92, 244 124" stroke="currentColor" strokeWidth="1.6" />
              <path
                d="M110 138 Q160 128 210 138"
                stroke="var(--atelier-accent)"
                strokeWidth="1.6"
                strokeDasharray="4 4"
              />
            </>
          )}

          {memoryId === 'mem-autumn' && (
            <>
              {/* Folded apron, pigment jars, and tall window light */}
              <rect
                x="194"
                y="28"
                width="56"
                height="82"
                rx="4"
                stroke="currentColor"
                strokeOpacity="0.35"
                strokeWidth="1.4"
              />
              <line
                x1="222"
                y1="28"
                x2="222"
                y2="110"
                stroke="currentColor"
                strokeOpacity="0.25"
                strokeWidth="1.2"
              />
              <rect
                x="86"
                y="96"
                width="20"
                height="28"
                rx="3"
                fill="currentColor"
                fillOpacity="0.18"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <rect
                x="114"
                y="102"
                width="18"
                height="22"
                rx="3"
                fill="currentColor"
                fillOpacity="0.14"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M142 124 L182 124 L176 108 L148 108 Z"
                fill="currentColor"
                fillOpacity="0.14"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </>
          )}
          </g>
        </motion.g>
      </svg>
    </motion.div>
  );
}

export function WaterMemoryOverlay({
  lang,
  chapter,
  onContinue,
}: WaterMemoryOverlayProps) {
  const t = COPY[lang];
  const prefersReducedMotion = Boolean(useReducedMotion());

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  // Viscous water-like spring inertia
  const springConfig = { stiffness: 60, damping: 20, mass: 1.2 };
  const smoothX = useSpring(pointerX, springConfig);
  const smoothY = useSpring(pointerY, springConfig);

  const driftX = useTransform(smoothX, [-1, 1], [-10, 10]);
  const driftY = useTransform(smoothY, [-1, 1], [-7, 7]);
  const rippleX = useTransform(smoothX, [-1, 1], [5, -5]);
  const rippleY = useTransform(smoothY, [-1, 1], [3, -3]);
  const tilt = useTransform(smoothX, [-1, 1], [-1.8, 1.8]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
    const ny = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;
    pointerX.set(Math.max(-1, Math.min(1, nx)));
    pointerY.set(Math.max(-1, Math.min(1, ny)));
  };

  const handlePointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.55 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="fixed inset-0 z-40 flex items-center justify-center bg-[var(--atelier-bg)]/70 p-4 backdrop-blur-md"
    >
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg rounded-2xl border border-[var(--atelier-line)] bg-[var(--atelier-surface)] p-6 text-center shadow-2xl sm:p-8"
      >
        <p className="text-xs font-medium tracking-wide text-[var(--atelier-muted)]">
          {t.story.memoryLabel} · {lang === 'tr' ? chapter.seasonTr : chapter.seasonEn}
        </p>

        <div className="my-5">
          <SilhouetteIllustration
            memoryId={chapter.memoryId}
            driftX={driftX}
            driftY={driftY}
            rippleX={rippleX}
            rippleY={rippleY}
            tilt={tilt}
            reducedMotion={prefersReducedMotion}
          />
        </div>

        <motion.p
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-lg italic leading-relaxed text-[var(--atelier-ink)]"
        >
          {lang === 'tr' ? chapter.memoryCaptionTr : chapter.memoryCaptionEn}
        </motion.p>

        <motion.button
          type="button"
          onClick={onContinue}
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.55 }}
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[var(--atelier-ink)] px-5 text-sm font-semibold text-[var(--atelier-bg)] transition-opacity hover:opacity-90"
        >
          <span>
            {chapter.letter ? t.story.readLetterBtn : t.story.continueChapterBtn}
          </span>
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
