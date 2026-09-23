import { useEffect } from 'react';

export default function LocalAnalytics({ projectId }: { projectId: string | null }) {
  useEffect(() => {
    // Development-only events: no third-party transmission or production collector.
    if (!(import.meta as any).env.DEV) return;
    const record = (event: string, project?: string) => {
      void fetch('/__events', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, project }), keepalive: true,
      }).catch(() => {});
    };
    // Cancel superseded mounts (including React StrictMode's development replay).
    const timer = window.setTimeout(() => {
      record(projectId ? 'project_open' : 'page_view', projectId || undefined);
    }, 0);
    const click = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest('a');
      const href = link?.getAttribute('href') || '';
      if (href.startsWith('mailto:')) record('contact_email');
      else if (href.startsWith('https://drive.google.com/file/')) record('contact_resume');
      else if (href.startsWith('https://www.linkedin.com/')) record('contact_linkedin');
    };
    document.addEventListener('click', click);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('click', click);
    };
  }, [projectId]);
  return null;
}
