import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { COPY } from '../data/i18n';
import type { Language } from '../types/ebru';

interface KitreCatProps {
  lang: Language;
  onPet: () => void;
}

export function KitreCat({ lang, onPet }: KitreCatProps) {
  const [purring, setPurring] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const purrTimerRef = useRef<number | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const t = COPY[lang];

  // Spontaneous natural idle eye blinks every 4-7 seconds
  useEffect(() => {
    if (prefersReducedMotion) return;
    let blinkTimeout: number | undefined;
    let openTimeout: number | undefined;

    const scheduleBlink = () => {
      const delay = 3800 + Math.random() * 3200;
      blinkTimeout = window.setTimeout(() => {
        setBlinking(true);
        openTimeout = window.setTimeout(() => {
          setBlinking(false);
          scheduleBlink();
        }, 160);
      }, delay);
    };

    scheduleBlink();
    return () => {
      window.clearTimeout(blinkTimeout);
      window.clearTimeout(openTimeout);
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    return () => {
      if (purrTimerRef.current !== null) {
        window.clearTimeout(purrTimerRef.current);
      }
    };
  }, []);

  const handleClick = () => {
    onPet();
    setPurring(true);
    if (purrTimerRef.current !== null) {
      window.clearTimeout(purrTimerRef.current);
    }
    purrTimerRef.current = window.setTimeout(() => {
      setPurring(false);
      purrTimerRef.current = null;
    }, 1900);
  };

  return (
    <div className="pointer-events-auto fixed right-4 bottom-28 z-20 flex flex-col items-end sm:right-6 sm:bottom-24">
      <AnimatePresence>
        {purring && (
          <motion.span
            initial={{ opacity: 0, y: 6, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="font-display mb-1.5 rounded-lg border border-[var(--atelier-line)] bg-[var(--atelier-surface)] px-2.5 py-0.5 text-xs italic text-[var(--atelier-ink)] shadow-sm backdrop-blur-sm"
          >
            {t.story.kitrePurr}
          </motion.span>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={handleClick}
        aria-label={t.story.kitreLabel}
        title={t.story.kitreLabel}
        whileHover={prefersReducedMotion ? undefined : { y: -2 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
        animate={
          prefersReducedMotion
            ? undefined
            : purring
              ? {
                  y: [0, -1.2, 0, -1, 0],
                  x: [0, 0.5, -0.5, 0.3, 0],
                  transition: { duration: 0.36, repeat: Infinity, ease: 'easeInOut' },
                }
              : { y: 0, x: 0 }
        }
        className="group relative flex h-14 w-16 items-center justify-center rounded-2xl border border-[var(--atelier-line)] bg-[var(--atelier-surface)]/80 p-1.5 shadow-sm backdrop-blur-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--atelier-ink)]"
      >
        <svg
          viewBox="0 0 64 52"
          className="h-full w-full text-[var(--atelier-ink)]"
          fill="none"
          aria-hidden="true"
        >
          {/* Tail with gentle idle sway and high curl when purring */}
          <motion.path
            d={
              purring
                ? 'M45 40 C56 38, 60 25, 53 19'
                : 'M45 40 C54 41, 58 34, 55 27'
            }
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            style={{ transformOrigin: '45px 40px' }}
            animate={
              prefersReducedMotion
                ? undefined
                : purring
                  ? { rotate: [0, 7, -4, 6, 0], transition: { duration: 0.9, repeat: Infinity } }
                  : { rotate: [0, 4, 0, -2.5, 0], transition: { duration: 5.5, repeat: Infinity, ease: 'easeInOut' } }
            }
          />

          {/* Curled cat silhouette body with calm idle breathing */}
          <motion.path
            d="M17 41 C13 36, 15 24, 24 22 C31 20, 41 23, 45 31 C48 37, 45 42, 39 42 L20 42 Z"
            fill="currentColor"
            fillOpacity="0.14"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
            style={{ transformOrigin: '30px 42px' }}
            animate={
              prefersReducedMotion
                ? undefined
                : purring
                  ? { scaleY: [1, 1.045, 1], transition: { duration: 0.45, repeat: Infinity, ease: 'easeInOut' } }
                  : { scaleY: [1, 1.025, 1], transition: { duration: 4.2, repeat: Infinity, ease: 'easeInOut' } }
            }
          />

          {/* Head, ears, eyes, nose grouped for subtle affectionate tilt on pet */}
          <motion.g
            style={{ transformOrigin: '25px 28px' }}
            animate={
              prefersReducedMotion
                ? undefined
                : purring
                  ? { rotate: [-2.5, 2, -1.5, 0], transition: { duration: 0.85, ease: 'easeInOut' } }
                  : { rotate: 0 }
            }
          >
            <path
              d="M16 26 L15 15 L22 19 C24 18, 27 18, 29 19 L35 14 L35 25 C35 30, 30 33, 25 33 C19 33, 16 30, 16 26 Z"
              fill="var(--atelier-bg)"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />

            {/* Happy arched eyes on purr, horizontal blink line on idle blink, bright dots otherwise */}
            {purring ? (
              <>
                <path d="M20 24 Q22 21.8 24 24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M28 24 Q30 21.8 32 24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </>
            ) : blinking ? (
              <>
                <line x1="20" y1="24" x2="23.2" y2="24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="28.4" y1="24" x2="31.6" y2="24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </>
            ) : (
              <>
                <circle cx="21.5" cy="24" r="1.25" fill="currentColor" />
                <circle cx="30" cy="24" r="1.25" fill="currentColor" />
              </>
            )}

            {/* Tiny nose */}
            <path d="M25 27 L26.5 27 L25.75 28 Z" fill="var(--atelier-accent)" />
          </motion.g>
        </svg>
      </motion.button>
    </div>
  );
}

export function KitreQuietSvg() {
  return (
    <svg
      viewBox="0 0 64 46"
      className="h-9 w-12 shrink-0 text-[var(--atelier-ink)] opacity-75"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M45 36 C54 37, 58 30, 54 24"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M16 37 C12 32, 15 21, 24 19 C32 18, 42 21, 45 29 C48 35, 44 38, 38 38 L19 38 Z"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M16 23 L15 13 L21.5 17 C24 16, 27 16, 29 17 L35 12.5 L35 22.5 C35 27.5, 30 30, 25 30 C19.5 30, 16 27.5, 16 23 Z"
        fill="var(--atelier-bg)"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path d="M20 22 Q22 23.5 24 22" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M28 22 Q30 23.5 32 22" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
