import { motion } from 'motion/react';
import { Mail, X } from 'lucide-react';
import { COPY } from '../data/i18n';
import type { Language, LetterChoice, StoryLetter } from '../types/ebru';

interface NurLetterModalProps {
  lang: Language;
  letter: StoryLetter;
  currentChoice: LetterChoice;
  onAcknowledge: () => void;
  onChoose?: (choice: 'shown' | 'hidden') => void;
  onClose: () => void;
}

export function NurLetterModal({
  lang,
  letter,
  currentChoice,
  onAcknowledge,
  onChoose,
  onClose,
}: NurLetterModalProps) {
  const t = COPY[lang];
  const paragraphs = lang === 'tr' ? letter.paragraphsTr : letter.paragraphsEn;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={lang === 'tr' ? letter.senderTr : letter.senderEn}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-lg rounded-2xl border border-[var(--atelier-line)] bg-[#faf5ea] p-6 text-[#1a2436] shadow-2xl dark:bg-[#1f242d] dark:text-[#ece6da] sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t.gallery.close}
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-lg opacity-70 hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 text-xs font-medium opacity-70">
          <Mail className="h-3.5 w-3.5" />
          <span>{lang === 'tr' ? letter.senderTr : letter.senderEn}</span>
        </div>

        <div className="font-display mt-5 space-y-3.5 text-base italic leading-relaxed">
          {paragraphs.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>

        <div className="mt-7 flex flex-col gap-2.5 border-t border-current/15 pt-5 sm:flex-row sm:justify-end">
          {letter.hasChoice && onChoose ? (
            <>
              <button
                type="button"
                onClick={() => onChoose('hidden')}
                className={`h-11 rounded-xl border px-4 text-xs font-semibold transition-colors sm:text-sm ${
                  currentChoice === 'hidden'
                    ? 'border-[var(--atelier-ink)] bg-black/10 dark:bg-white/10'
                    : 'border-current/25 hover:bg-black/5 dark:hover:bg-white/10'
                }`}
              >
                {t.story.letterKeepChoice}
              </button>
              <button
                type="button"
                onClick={() => onChoose('shown')}
                className="h-11 rounded-xl bg-[var(--atelier-accent)] px-4 text-xs font-semibold text-white transition-opacity hover:opacity-95 sm:text-sm"
              >
                {t.story.letterShowChoice}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onAcknowledge}
              className="h-11 rounded-xl bg-[#162238] px-5 text-xs font-semibold text-[#faf5ea] transition-opacity hover:opacity-90 dark:bg-[#ede8de] dark:text-[#162238] sm:text-sm"
            >
              {t.story.letterAcknowledge}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
