import { Download, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { COPY } from '../data/i18n';
import type { Language, SavedPrint } from '../types/ebru';

interface GalleryViewProps {
  lang: Language;
  prints: SavedPrint[];
  onDeletePrint: (id: string) => void;
  onGoToStudio: () => void;
}

type GalleryFilter = 'all' | 'story' | 'challenge' | 'sandbox';

export function GalleryView({
  lang,
  prints,
  onDeletePrint,
  onGoToStudio,
}: GalleryViewProps) {
  const t = COPY[lang];
  const [filter, setFilter] = useState<GalleryFilter>('all');
  const [selected, setSelected] = useState<SavedPrint | null>(null);

  const filtered = prints.filter((p) => (filter === 'all' ? true : p.mode === filter));

  const formatDate = (ts: number) =>
    new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(ts));

  const downloadPrint = (print: SavedPrint) => {
    const link = document.createElement('a');
    link.href = print.dataUrl;
    link.download = `${print.title.toLowerCase().replace(/[^a-z0-9ğüşöçı]+/gi, '-') || 'ebru'}.png`;
    link.click();
  };

  return (
    <main className="min-h-screen bg-[var(--atelier-bg)] px-4 pt-22 pb-14 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-4 border-b border-[var(--atelier-line)] pb-6 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--atelier-ink)]">
              {t.gallery.heading}
            </h1>
            <p className="mt-1.5 text-sm text-[var(--atelier-muted)]">{t.gallery.subheading}</p>
          </div>

          <div
            role="group"
            aria-label="Filter prints"
            className="flex flex-wrap shrink-0 items-center gap-1 self-start rounded-xl border border-[var(--atelier-line)] p-1"
          >
            {(['all', 'story', 'challenge', 'sandbox'] as GalleryFilter[]).map((key) => {
              const active = filter === key;
              const label =
                key === 'all'
                  ? t.gallery.filterAll
                  : key === 'story'
                    ? t.gallery.filterStory
                    : key === 'challenge'
                      ? t.gallery.filterChallenges
                      : t.gallery.filterSandbox;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(key)}
                  className={`h-9 whitespace-nowrap rounded-lg px-3 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-[var(--atelier-ink)] text-[var(--atelier-bg)]'
                      : 'text-[var(--atelier-muted)] hover:text-[var(--atelier-ink)]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="mx-auto mt-16 max-w-md text-center">
            <h2 className="font-display text-xl font-medium text-[var(--atelier-ink)]">
              {t.gallery.emptyTitle}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--atelier-muted)]">
              {t.gallery.emptyBody}
            </p>
            <button
              type="button"
              onClick={onGoToStudio}
              className="mt-6 h-11 rounded-lg bg-[var(--atelier-accent)] px-5 text-sm font-semibold text-white transition-opacity hover:opacity-95"
            >
              {t.gallery.goToStudio}
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((print) => (
              <article
                key={print.id}
                className="group overflow-hidden rounded-2xl border border-[var(--atelier-line)] bg-[var(--atelier-surface)] transition-shadow hover:shadow-lg"
              >
                <button
                  type="button"
                  onClick={() => setSelected(print)}
                  className="block w-full overflow-hidden bg-[#f7f3ea] p-2.5 text-left dark:bg-[#1a2029]"
                >
                  <img
                    src={print.dataUrl}
                    alt={print.title}
                    className="aspect-[16/10] w-full rounded-lg object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </button>

                <div className="p-4">
                  <h3 className="font-display truncate text-lg font-medium text-[var(--atelier-ink)]">
                    {print.title}
                  </h3>

                  <div className="mt-1 flex items-center gap-2 text-xs text-[var(--atelier-muted)]">
                    <span>
                      {print.mode === 'story'
                        ? t.gallery.storyTag
                        : print.mode === 'challenge'
                          ? t.gallery.challengeTag
                          : t.gallery.sandboxTag}
                    </span>
                    {print.mode === 'challenge' && print.seals && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-tabular">
                          {print.seals}/3 {t.gallery.sealCount}
                        </span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <span>{formatDate(print.createdAt)}</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[var(--atelier-line)] pt-3">
                    <button
                      type="button"
                      onClick={() => downloadPrint(print)}
                      className="flex h-9 items-center gap-1.5 text-xs font-medium text-[var(--atelier-ink)] hover:text-[var(--atelier-accent)]"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>{t.gallery.download}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeletePrint(print.id)}
                      className="flex h-9 items-center gap-1.5 text-xs font-medium text-[var(--atelier-muted)] hover:text-[var(--atelier-accent)]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>{t.gallery.deletePrint}</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selected.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative w-full max-w-4xl rounded-2xl border border-[var(--atelier-line)] bg-[var(--atelier-bg)] p-4 shadow-2xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-4">
              <h2 className="font-display text-xl font-semibold text-[var(--atelier-ink)]">
                {selected.title}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadPrint(selected)}
                  className="flex h-9 items-center gap-1.5 rounded-lg border border-[var(--atelier-line)] px-3 text-xs font-medium text-[var(--atelier-ink)] hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{t.gallery.download}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  aria-label={t.gallery.close}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--atelier-muted)] hover:bg-black/5 hover:text-[var(--atelier-ink)] dark:hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-[#f7f3ea] p-3 dark:bg-[#1a2029]">
              <img
                src={selected.dataUrl}
                alt={selected.title}
                className="max-h-[72vh] w-full rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
