import { Moon, Sun, Volume2, VolumeX } from 'lucide-react';
import { COPY } from '../data/i18n';
import type { AppView, Language, ThemeMode } from '../types/ebru';

interface TopBarProps {
  lang: Language;
  theme: ThemeMode;
  view: AppView;
  muted: boolean;
  galleryCount: number;
  onChangeView: (view: AppView) => void;
  onToggleLang: () => void;
  onToggleTheme: () => void;
  onToggleMute: () => void;
  onTransferToPaper: () => void;
}

export function TopBar({
  lang,
  theme,
  view,
  muted,
  galleryCount,
  onChangeView,
  onToggleLang,
  onToggleTheme,
  onToggleMute,
  onTransferToPaper,
}: TopBarProps) {
  const t = COPY[lang];

  return (
    <header className="fixed top-0 left-0 right-0 z-30 border-b border-[var(--atelier-line)] bg-[var(--atelier-surface)] backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-2.5 sm:gap-8 sm:px-6">
        {/* Zone 1: Single-element Brand Wordmark */}
        <button
          type="button"
          onClick={() => onChangeView('story')}
          className="font-display shrink-0 whitespace-nowrap text-left text-lg font-semibold italic tracking-tight text-[var(--atelier-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--atelier-ink)] sm:text-xl"
        >
          {t.brand}
        </button>

        {/* Zone 2: Clean Typography Navigation Links (4 concise links) */}
        <nav
          aria-label="Primary"
          className="flex items-center gap-4 overflow-x-auto text-sm font-medium sm:gap-7"
        >
          {(
            [
              { id: 'story', label: t.navStory },
              { id: 'challenges', label: t.navChallenges },
              { id: 'studio', label: t.navStudio },
            ] as Array<{ id: AppView; label: string }>
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeView(item.id)}
              className={`shrink-0 whitespace-nowrap border-b-2 py-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--atelier-ink)] ${
                view === item.id
                  ? 'border-[var(--atelier-accent)] text-[var(--atelier-ink)]'
                  : 'border-transparent text-[var(--atelier-muted)] hover:text-[var(--atelier-ink)]'
              }`}
            >
              {item.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => onChangeView('gallery')}
            className={`shrink-0 whitespace-nowrap border-b-2 py-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--atelier-ink)] ${
              view === 'gallery'
                ? 'border-[var(--atelier-accent)] text-[var(--atelier-ink)]'
                : 'border-transparent text-[var(--atelier-muted)] hover:text-[var(--atelier-ink)]'
            }`}
          >
            <span>{t.navGallery}</span>
            {galleryCount > 0 && (
              <span className="font-mono-tabular ml-1.5 text-xs text-[var(--atelier-muted)]">
                ({galleryCount})
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: Utility toggles + 1 Primary Action */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? t.audioUnmute : t.audioMute}
            title={muted ? t.audioUnmute : t.audioMute}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--atelier-line)] text-[var(--atelier-ink)] transition-colors hover:bg-black/5 dark:hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--atelier-ink)]"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={onToggleLang}
            aria-label={lang === 'tr' ? 'Switch to English' : 'Türkçeye geç'}
            className="font-mono-tabular flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-[var(--atelier-line)] px-2.5 text-xs font-medium text-[var(--atelier-ink)] transition-colors hover:bg-black/5 dark:hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--atelier-ink)]"
          >
            {lang === 'tr' ? 'TR / EN' : 'EN / TR'}
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'light' ? 'Dark mode' : 'Light mode'}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--atelier-line)] text-[var(--atelier-ink)] transition-colors hover:bg-black/5 dark:hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--atelier-ink)]"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          {view !== 'gallery' ? (
            <button
              type="button"
              onClick={onTransferToPaper}
              className="h-10 shrink-0 whitespace-nowrap rounded-lg bg-[var(--atelier-accent)] px-3.5 text-xs font-semibold text-white transition-transform duration-150 hover:opacity-95 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--atelier-ink)] sm:px-4 sm:text-sm"
            >
              {t.transferBtn}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onChangeView('studio')}
              className="h-10 shrink-0 whitespace-nowrap rounded-lg bg-[var(--atelier-ink)] px-3.5 text-xs font-semibold text-[var(--atelier-bg)] transition-transform duration-150 hover:opacity-95 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--atelier-ink)] sm:px-4 sm:text-sm"
            >
              {t.gallery.goToStudio}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
