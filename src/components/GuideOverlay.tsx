import type { GuideOverlayType } from '../types/ebru';

interface GuideOverlayProps {
  guideType: GuideOverlayType;
}

export function GuideOverlay({ guideType }: GuideOverlayProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1000 600"
      preserveAspectRatio="none"
      className="pointer-events-none fixed inset-0 z-10 h-full w-full opacity-35 dark:opacity-40"
    >
      <defs>
        <marker
          id="ebru-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 10 5 L 0 9 z" fill="currentColor" />
        </marker>
      </defs>

      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="6 6"
        className="text-[var(--atelier-ink)]"
      >
        {guideType === 'battal' && (
          <>
            <circle cx="380" cy="260" r="65" />
            <circle cx="580" cy="310" r="78" />
            <circle cx="490" cy="190" r="52" />
            <circle cx="460" cy="370" r="58" />
          </>
        )}

        {guideType === 'gelgit' && (
          <>
            <line x1="160" y1="180" x2="840" y2="180" markerEnd="url(#ebru-arrow)" />
            <line x1="840" y1="300" x2="160" y2="300" markerEnd="url(#ebru-arrow)" />
            <line x1="160" y1="420" x2="840" y2="420" markerEnd="url(#ebru-arrow)" />
          </>
        )}

        {guideType === 'tarama' && (
          <>
            <line x1="180" y1="220" x2="820" y2="220" markerEnd="url(#ebru-arrow)" />
            <line x1="820" y1="380" x2="180" y2="380" markerEnd="url(#ebru-arrow)" />
            <line x1="340" y1="110" x2="340" y2="490" markerEnd="url(#ebru-arrow)" />
            <line x1="660" y1="490" x2="660" y2="110" markerEnd="url(#ebru-arrow)" />
          </>
        )}

        {guideType === 'hatip' && (
          <>
            <circle cx="500" cy="300" r="36" />
            <circle cx="500" cy="300" r="78" />
            <circle cx="500" cy="300" r="120" />
            <line x1="500" y1="150" x2="500" y2="450" />
            <line x1="350" y1="300" x2="650" y2="300" />
            <line x1="395" y1="195" x2="605" y2="405" />
            <line x1="605" y1="195" x2="395" y2="405" />
          </>
        )}

        {guideType === 'bulbul' && (
          <>
            <line x1="180" y1="300" x2="820" y2="300" markerEnd="url(#ebru-arrow)" />
            <path d="M 350 240 m 0 0 a 14 14 0 1 1 28 0 a 24 24 0 1 1 -48 0 a 34 34 0 1 1 68 0" />
            <path d="M 650 340 m 0 0 a 14 14 0 1 1 28 0 a 24 24 0 1 1 -48 0 a 34 34 0 1 1 68 0" />
          </>
        )}
      </g>
    </svg>
  );
}
