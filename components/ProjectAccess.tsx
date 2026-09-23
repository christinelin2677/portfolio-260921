import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { motion } from 'framer-motion';
import { Project } from '../types';
import ProjectPage from './ProjectPage';
import ThemeToggle from './ThemeToggle';
import { previewPasswords } from '../projectPasswords';

interface Props {
  project: Project;
  onBack: () => void;
  onNext: () => void;
}

const ProjectAccess: React.FC<Props> = ({ project, onBack, onNext }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  if (unlocked) return <ProjectPage project={project} onBack={onBack} onNext={onNext} />;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (password === previewPasswords[project.id] && password.length > 0) {
      setUnlocked(true);
      setPassword('');
    } else {
      setError('That password doesn’t match. Please try again.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-canvas text-ink">
      <nav className="site-header fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-6 md:px-12">
        <button onClick={onBack} className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-neutral-400 hover:text-ink">
          <ArrowLeft size={18} aria-hidden="true" /> Back to Work
        </button>
        <ThemeToggle />
      </nav>
      <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-32">
        <LockKeyhole size={26} strokeWidth={1.25} className="mb-8 text-neutral-500" aria-hidden="true" />
        <p className="mb-5 text-[10px] uppercase tracking-[0.35em] text-neutral-500">Private case study</p>
        <h1 className="mb-6 font-serif text-5xl italic tracking-tight md:text-6xl">{project.title}</h1>
        <p className="mb-10 text-sm leading-relaxed text-neutral-400">A closer look, by invitation. Enter this project’s password to explore the case study.</p>
        <form onSubmit={submit}>
          <label htmlFor="project-password" className="mb-3 block text-[10px] uppercase tracking-[0.2em] text-neutral-400">Project password</label>
          <div className="flex items-center border-b border-neutral-600 focus-within:border-ink">
            <input id="project-password" type={showPassword ? 'text' : 'password'} value={password}
              onChange={(event) => { setPassword(event.target.value); setError(''); }}
              autoComplete="current-password" required aria-invalid={!!error} aria-describedby={error ? 'password-error' : undefined}
              placeholder="Enter password" className="min-w-0 flex-1 bg-transparent py-4 text-base text-ink outline-none placeholder:text-neutral-600" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="flex h-11 w-11 items-center justify-center text-neutral-400 hover:text-ink">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p id="password-error" role="alert" className="min-h-10 py-3 text-xs text-red-500">{error}</p>
          <button type="submit" className="flex w-full items-center justify-between rounded-full bg-ink px-6 py-4 text-xs font-medium uppercase tracking-[0.15em] text-canvas transition-opacity hover:opacity-80">
            View case study <ArrowRight size={18} aria-hidden="true" />
          </button>
        </form>
        <a href="mailto:christinelin2677@gmail.com" className="mt-8 text-center text-xs text-neutral-500 underline underline-offset-4 hover:text-ink">Need access? Get in touch</a>
      </main>
    </motion.div>
  );
};

export default ProjectAccess;
