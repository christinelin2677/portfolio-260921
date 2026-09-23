import React, { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
  const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  const activeTransition = useRef<{ skipTransition: () => void } | null>(null);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    activeTransition.current?.skipTransition();
    if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    document.documentElement.classList.remove('theme-fading');
  }, []);

  const toggleTheme = () => {
    // Let the wave finish before starting another snapshot transition.
    if (activeTransition.current) return;
    const next = theme === 'dark' ? 'light' : 'dark';
    const applyTheme = () => {
      document.documentElement.dataset.theme = next;
      flushSync(() => setTheme(next));
      try { localStorage.setItem('portfolio-theme', next); } catch { /* Switching still works without storage. */ }
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      applyTheme();
    } else if (document.startViewTransition) {
      // The radius reaches past the opposite corner, including the feathered edge.
      document.documentElement.style.setProperty('--theme-wave-end', `${Math.hypot(window.innerWidth, window.innerHeight) + 220}px`);
      const transition = document.startViewTransition(applyTheme);
      activeTransition.current = transition;
      const finish = () => {
        if (activeTransition.current === transition) activeTransition.current = null;
      };
      void transition.finished.then(finish, finish);
    } else {
      // Color-only fallback leaves image hover and transform timing untouched.
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
      document.documentElement.classList.add('theme-fading');
      applyTheme();
      fallbackTimer.current = setTimeout(() => {
        document.documentElement.classList.remove('theme-fading');
      }, 450);
    }
  };

  return (
    <button type="button" onClick={toggleTheme} aria-label={label} title={label}
      className="theme-toggle flex h-11 w-11 shrink-0 items-center justify-center">
      <svg aria-hidden="true" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {theme === 'dark' ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
          </>
        ) : <path d="M20.9 13.1A9 9 0 0 1 10.9 3.1a9 9 0 1 0 10 10Z" />}
      </svg>
    </button>
  );
};

export default ThemeToggle;
