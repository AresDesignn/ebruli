import { ArrowRight, Award, Check, Download, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { COPY } from '../data/i18n';
import type { ChallengeDef, Language, LetterChoice } from '../types/ebru';
import { KitreQuietSvg } from './KitreCat';

interface PaperTransferModalProps {
  lang: Language;
  imageDataUrl: string;
  mode: 'story' | 'challenge' | 'sandbox';
  challenge?: ChallengeDef;
  sealsEarned?: number;
  letterChoice?: LetterChoice;
  hasNextChallenge: boolean;
  onSaveToGallery: (title: string) => void;
  onNextChallenge: () => void;
  onCompleteStoryFinale?: () => void;
  onClose: () => void;
}

type RitualPhase = 'lowering' | 'absorbing' | 'revealed';

export function PaperTransferModal({
  lang,
  imageDataUrl,
  mode,
  challenge,
  sealsEarned = 0,
  letterChoice = 'pending',
  hasNextChallenge,
  onSaveToGallery,
  onNextChallenge,
  onCompleteStoryFinale,
  onClose,
}: PaperTransferModalProps) {
  const t = COPY[lang];
  const [phase, setPhase] = useState<RitualPhase>('lowering');
  const [saved, setSaved] = useState(false);

  const defaultTitle =
    mode === 'story'
      ? t.story.finale.title
      : mode === 'challenge' && challenge
        ? lang === 'tr'
          ? challenge.titleTr
          : challenge.titleEn
        : t.ritual.defaultSandboxTitle;

  const [title, setTitle] = useState(defaultTitle);

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase('absorbing'), 550);
    const t2 = window.setTimeout(() => setPhase('revealed'), 1250);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  const handleSave = () => {
    if (saved) return;
    onSaveToGallery(title.trim() || defaultTitle);
    setSaved(true);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageDataUrl;
    const slug = (title.trim() || 'ebru-print')
      .toLowerCase()
      .replace(/[^a-z0-9ğüşöçı]+/gi, '-')
      .replace(/^-|-$/g, '');
    link.download = `${slug || 'ebru'}.png`;
    link.click();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.ritual.completeTitle}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm"
    >
      <div className="relative my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--atelier-line)] bg-[var(--atelier-bg)] p-5 shadow-2xl sm:p-7">
        <button
          type="button"
          onClick={onClose}
          aria-label={t.ritual.returnToTray}
          className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-lg text-[var(--atelier-muted)] transition-colors hover:bg-black/5 hover:text-[var(--atelier-ink)] dark:hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </button>

        {phase !== 'revealed' ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: -32, scale: 0.96 }}
              animate={
                phase === 'lowering'
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 0.92, y: 8, scale: 0.985 }
              }
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-[16/10] w-full max-w-md overflow-hidden rounded-xl border border-[var(--atelier-line)] bg-[#f7f3ea] p-3 shadow-xl"
            >
              <motion.img
                src={imageDataUrl}
                alt="Marbled paper transfer preview"
                initial={{ opacity: 0.08 }}
                animate={{ opacity: phase === 'absorbing' ? 0.95 : 0.15 }}
                transition={{ duration: 0.6 }}
                className="h-full w-full rounded object-cover"
              />
            </motion.div>

            <p className="font-display mt-6 text-lg italic text-[var(--atelier-ink)]">
              {phase === 'lowering' ? t.ritual.lowering : t.ritual.absorbing}
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="pr-10">
              <h2 className="font-display text-2xl font-semibold text-[var(--atelier-ink)]">
                {mode === 'story'
                  ? t.story.finale.title
                  : mode === 'challenge'
                    ? t.ritual.challengeCompleteTitle
                    : t.ritual.completeTitle}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[var(--atelier-muted)]">
                {t.ritual.mirroredNote}
              </p>
            </div>

            {/* Framed Print */}
            <div className="relative mt-4 rounded-xl border border-[var(--atelier-line)] bg-[#f7f3ea] p-3 shadow-inner dark:bg-[#1a2029]">
              <img
                src={imageDataUrl}
                alt={title}
                className="aspect-[16/10] w-full rounded-lg object-cover shadow-sm"
              />
            </div>

            {/* Story Finale Narrative Resolution (Usta's fingertips + Nur's threshold + Kitre) */}
            {mode === 'story' && (
              <div className="mt-4 space-y-2.5 rounded-xl border border-[var(--atelier-line)] bg-[var(--atelier-surface)] p-4">
                <p className="font-display text-sm italic leading-relaxed text-[var(--atelier-ink)]">
                  {t.story.finale.ustaReads}
                </p>
                <p className="text-xs leading-relaxed text-[var(--atelier-muted)]">
                  {letterChoice === 'shown'
                    ? t.story.finale.nurArrives
                    : t.story.finale.nurQuiet}
                </p>
                <div className="flex items-center justify-between gap-3 border-t border-[var(--atelier-line)] pt-2.5">
                  <p className="text-xs italic text-[var(--atelier-muted)]">
                    {t.story.finale.apprenticeTruth}
                  </p>
                  <KitreQuietSvg />
                </div>
              </div>
            )}

            {/* Title Input & Seals */}
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex-1">
                <label
                  htmlFor="print-title"
                  className="block text-xs font-medium text-[var(--atelier-muted)]"
                >
                  {t.ritual.titleLabel}
                </label>
                <input
                  id="print-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={60}
                  className="mt-1 h-10 w-full rounded-lg border border-[var(--atelier-line)] bg-[var(--atelier-surface)] px-3 text-sm text-[var(--atelier-ink)] focus:border-[var(--atelier-ink)] focus:outline-none"
                />
              </div>

              {mode === 'challenge' && (
                <div className="flex items-center gap-2 pb-1">
                  <span className="text-xs font-medium text-[var(--atelier-muted)]">
                    {t.ritual.sealsEarned}:
                  </span>
                  <div className="flex items-center gap-1" aria-label={`${sealsEarned} / 3`}>
                    {[1, 2, 3].map((n) => (
                      <Award
                        key={n}
                        className={`h-5 w-5 ${
                          n <= sealsEarned
                            ? 'text-[var(--atelier-gold)]'
                            : 'text-[var(--atelier-line)]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--atelier-line)] pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saved}
                  className={`flex h-10 items-center gap-2 whitespace-nowrap rounded-lg px-4 text-xs font-semibold transition-colors sm:text-sm ${
                    saved
                      ? 'border border-emerald-600/40 bg-emerald-600/15 text-emerald-700 dark:text-emerald-300'
                      : 'bg-[var(--atelier-ink)] text-[var(--atelier-bg)] hover:opacity-90'
                  }`}
                >
                  {saved && <Check className="h-4 w-4" />}
                  <span>{saved ? t.ritual.savedBadge : t.ritual.saveToGallery}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex h-10 items-center gap-2 whitespace-nowrap rounded-lg border border-[var(--atelier-line)] px-4 text-xs font-medium text-[var(--atelier-ink)] transition-colors hover:bg-black/5 dark:hover:bg-white/10 sm:text-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>{t.ritual.downloadPng}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {mode !== 'story' && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="h-10 whitespace-nowrap rounded-lg px-3 text-xs font-medium text-[var(--atelier-muted)] hover:text-[var(--atelier-ink)] sm:text-sm"
                  >
                    {t.ritual.returnToTray}
                  </button>
                )}

                {mode === 'challenge' && hasNextChallenge && (
                  <button
                    type="button"
                    onClick={onNextChallenge}
                    className="flex h-10 items-center gap-1.5 whitespace-nowrap rounded-lg bg-[var(--atelier-accent)] px-4 text-xs font-semibold text-white transition-opacity hover:opacity-95 sm:text-sm"
                  >
                    <span>{t.ritual.nextChallenge}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}

                {mode === 'story' && onCompleteStoryFinale && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!saved) {
                        onSaveToGallery(title.trim() || defaultTitle);
                      }
                      onCompleteStoryFinale();
                    }}
                    className="flex h-10 items-center gap-1.5 whitespace-nowrap rounded-lg bg-[var(--atelier-accent)] px-4 text-xs font-semibold text-white transition-opacity hover:opacity-95 sm:text-sm"
                  >
                    <span>{t.story.finale.proceedEpilogue}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
