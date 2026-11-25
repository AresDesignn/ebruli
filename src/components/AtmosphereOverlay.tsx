import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { StorySeason, ThemeMode } from '../types/ebru';

export interface AtmosphereOverlayHandle {
  spawnRipple: (clientX: number, clientY: number, scale?: number) => void;
}

interface AtmosphereOverlayProps {
  theme: ThemeMode;
  season?: StorySeason;
  active: boolean;
}

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  phase: number;
  speed: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
}

function getSeasonPalette(theme: ThemeMode, season?: StorySeason) {
  if (theme === 'dark') {
    switch (season) {
      case 'winter_late':
      case 'winter':
        return { mote: '214, 228, 240', ripple: '210, 224, 238' };
      case 'autumn':
        return { mote: '238, 206, 158', ripple: '232, 204, 168' };
      case 'summer':
        return { mote: '236, 228, 198', ripple: '214, 236, 235' };
      default:
        return { mote: '232, 226, 214', ripple: '216, 228, 226' };
    }
  }

  switch (season) {
    case 'winter_late':
    case 'winter':
      return { mote: '255, 255, 255', ripple: '22, 34, 56' };
    case 'autumn':
      return { mote: '245, 214, 158', ripple: '92, 68, 46' };
    case 'summer':
      return { mote: '255, 246, 214', ripple: '22, 62, 74' };
    default:
      return { mote: '255, 251, 240', ripple: '28, 48, 66' };
  }
}

export const AtmosphereOverlay = forwardRef<AtmosphereOverlayHandle, AtmosphereOverlayProps>(
  function AtmosphereOverlay({ theme, season, active }, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const ripplesRef = useRef<Ripple[]>([]);
    const paletteRef = useRef(getSeasonPalette(theme, season));

    useEffect(() => {
      paletteRef.current = getSeasonPalette(theme, season);
    }, [theme, season]);

    useImperativeHandle(ref, () => ({
      spawnRipple(clientX: number, clientY: number, scale = 1) {
        if (!active) return;
        const list = ripplesRef.current;
        if (list.length > 18) list.shift();
        list.push({
          x: clientX,
          y: clientY,
          radius: 10 * scale,
          maxRadius: (62 + Math.random() * 28) * scale,
          alpha: 0.16,
          speed: 38 + Math.random() * 14,
        });
      },
    }), [active]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !active) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      let width = window.innerWidth;
      let height = window.innerHeight;
      let dpr = Math.min(window.devicePixelRatio || 1, 2);

      const resize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, Math.round(width * dpr));
        canvas.height = Math.max(1, Math.round(height * dpr));
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      resize();
      window.addEventListener('resize', resize);

      const moteCount = width < 640 ? 22 : 34;
      const motes: Mote[] = Array.from({ length: moteCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 7,
        vy: -3 - Math.random() * 6,
        radius: 0.9 + Math.random() * 1.7,
        alpha: 0.08 + Math.random() * 0.16,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 0.9,
      }));

      // Ambient gentle water ripple timer
      let nextAmbientRipple = 1.8;
      let last = performance.now();
      let rafId = 0;

      const drawFrame = (dt: number, elapsed: number) => {
        ctx.clearRect(0, 0, width, height);
        const { mote: moteRgb, ripple: rippleRgb } = paletteRef.current;

        // 1. Floating kitre dust motes
        for (const m of motes) {
          if (!reducedMotion) {
            m.x += (m.vx + Math.sin(elapsed * m.speed + m.phase) * 4.5) * dt;
            m.y += m.vy * dt;

            if (m.y < -10) {
              m.y = height + 10;
              m.x = Math.random() * width;
            }
            if (m.x < -10) m.x = width + 10;
            if (m.x > width + 10) m.x = -10;
          }

          const twinkle = reducedMotion
            ? m.alpha
            : m.alpha * (0.65 + 0.35 * Math.sin(elapsed * m.speed * 1.4 + m.phase));

          ctx.beginPath();
          ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${moteRgb}, ${twinkle.toFixed(3)})`;
          ctx.fill();
        }

        if (reducedMotion) return;

        // 2. Ambient occasional light water ripples
        nextAmbientRipple -= dt;
        if (nextAmbientRipple <= 0) {
          nextAmbientRipple = 2.8 + Math.random() * 3.4;
          if (ripplesRef.current.length < 12) {
            ripplesRef.current.push({
              x: width * (0.15 + Math.random() * 0.7),
              y: height * (0.18 + Math.random() * 0.64),
              radius: 8,
              maxRadius: 56 + Math.random() * 44,
              alpha: 0.1,
              speed: 22 + Math.random() * 10,
            });
          }
        }

        // 3. Render & advance expanding ripples
        const activeRipples: Ripple[] = [];
        for (const r of ripplesRef.current) {
          r.radius += r.speed * dt;
          const progress = r.radius / r.maxRadius;
          if (progress >= 1) continue;

          const currentAlpha = r.alpha * (1 - progress) * (1 - progress);
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${rippleRgb}, ${currentAlpha.toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          if (r.radius > 20) {
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.radius * 0.68, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${rippleRgb}, ${(currentAlpha * 0.55).toFixed(3)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }

          activeRipples.push(r);
        }
        ripplesRef.current = activeRipples;
      };

      if (reducedMotion) {
        drawFrame(0, 0);
        return () => {
          window.removeEventListener('resize', resize);
        };
      }

      const start = performance.now();
      const tick = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        drawFrame(dt, (now - start) / 1000);
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);

      return () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener('resize', resize);
      };
    }, [active]);

    if (!active) return null;

    return (
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-10 h-full w-full"
      />
    );
  }
);
