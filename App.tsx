import { FileUser, Mail } from 'lucide-react';
import LinkedinIcon from './components/LinkedinIcon';
import React, { useState, useEffect } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity
} from 'framer-motion';

import Navbar from './components/Navbar';
import LocalAnalytics from './components/LocalAnalytics';
import Hero from './components/Hero';
import ProjectCard from './components/ProjectCard';
import Gallery from './components/Gallery';
import ProjectAccess from './components/ProjectAccess';
// import AIAssistant from './components/AIAssistant';
import CustomCursor from './components/CustomCursor';
import SectionReveal from './components/SectionReveal';

import { PROJECTS, CHRISTINE_BIO } from './constants';
import { Project } from './types';

// Keep archived project content available while hiding it from the portfolio navigation.
const hiddenProjectIds = new Set(['5', '6', '7', '8', '9']);
const visibleProjects = PROJECTS.filter(project => !hiddenProjectIds.has(project.id));

const App: React.FC = () => {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Simple state-based router for seamless experience
  const activeProject = PROJECTS.find(p => p.id === activeProjectId);

  // ====== URL <-> State sync helpers ======
  const getProjectIdFromHash = () => {
    const m = window.location.hash.match(/^#project-(.+)$/);
    return m ? m[1] : null;
  };

  const syncFromUrl = () => {
    const id = getProjectIdFromHash();
    setActiveProjectId(PROJECTS.some(project => project.id === id) ? id : null);
  };

  const handleProjectSelect = (id: string) => {
    setActiveProjectId(id);
    window.history.pushState({ id }, '', `#project-${id}`);
  };

  const handleBack = () => {
    setActiveProjectId(null);
    // Clear hash without forcing a full route change
    window.history.pushState({}, '', '#');
  };

  const handleNext = () => {
    const currentIndex = visibleProjects.findIndex(p => p.id === activeProjectId);
    const nextIndex = (currentIndex + 1) % visibleProjects.length;
    const nextId = visibleProjects[nextIndex].id;

    setActiveProjectId(nextId);
    window.history.pushState({ id: nextId }, '', `#project-${nextId}`);
  };

  // ✅ Robust routing: works for refresh, direct links, back/forward
  useEffect(() => {
    // On first load / refresh
    syncFromUrl();

    const onPopState = (event: PopStateEvent) => {
      // Prefer history state when available
      const stateId = (event.state && (event.state as any).id) as string | undefined;
      if (stateId && PROJECTS.some(project => project.id === stateId)) {
        setActiveProjectId(stateId);
      } else {
        // Fallback to hash (refresh/direct link)
        syncFromUrl();
      }
    };

    const onHashChange = () => {
      syncFromUrl();
    };

    window.addEventListener('popstate', onPopState);
    window.addEventListener('hashchange', onHashChange);

    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('hashchange', onHashChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ====== From 2nd code: Global Page Momentum (for home only) ======
  const scrollVelocity = useVelocity(scrollYProgress);
  const smoothVelocity = useSpring(scrollVelocity, { stiffness: 50, damping: 20 });
  const skewVelocity = useTransform(smoothVelocity, [-0.5, 0.5], [-2, 2]);
  const pageRotateX = useTransform(smoothVelocity, [-1, 1], [5, -5]);
  const pageScale = useTransform(smoothVelocity, [-1, 1], [0.98, 1.02]);

  // Marquee translate (hook must be declared here, not inside JSX)
  const marqueeX = useTransform(scrollYProgress, [0.4, 1.4], ['20%', '-20%']);
  const contactBgY = useTransform(scrollYProgress, [0.8, 1], ['0%', '50%']);

  // ====== From 2nd code: About section mouse tilt ======
  const aboutX = useMotionValue(0);
  const aboutY = useMotionValue(0);
  const aboutXSpring = useSpring(aboutX, { stiffness: 80, damping: 20 });
  const aboutYSpring = useSpring(aboutY, { stiffness: 80, damping: 20 });
  const aboutRotateX = useTransform(aboutYSpring, [-0.5, 0.5], ['15deg', '-15deg']);
  const aboutRotateY = useTransform(aboutXSpring, [-0.5, 0.5], ['-15deg', '15deg']);

  const handleAboutMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    aboutX.set(xPct);
    aboutY.set(yPct);
  };

  const handleAboutMouseLeave = () => {
    aboutX.set(0);
    aboutY.set(0);
  };

  // ====== Navbar scroll navigation (Home sections) ======
  const navigateToSection = (hash: string) => {
    // if you're on a project page, go back to home first
    if (activeProjectId) {
      setActiveProjectId(null);
      window.history.pushState({}, '', '#');
    }

    // wait for home to render, then scroll
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.querySelector(hash);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  };

  return (
    <div className="relative selection:bg-ink selection:text-canvas bg-canvas">
      <CustomCursor />
      <LocalAnalytics projectId={activeProjectId} />

      {/* Scroll Progress Bar - Only on home (keeps your original behavior) */}
      {!activeProjectId && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-0.5 bg-ink z-[60] origin-left"
          style={{ scaleX }}
        />
      )}

      <AnimatePresence mode="wait">
        {!activeProjectId ? (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
          >
            <Navbar
              onWork={() => navigateToSection('#work-artifacts')}
              onGallery={() => navigateToSection('#gallery')}
              onAbout={() => navigateToSection('#about')}
              onContact={() => navigateToSection('#contact-finale')}
            />

            {/* Global Wrapper with Scroll Physics (from 2nd code, applied to home main) */}
            <motion.main
              style={{
                skewY: skewVelocity,
                rotateX: pageRotateX,
                scale: pageScale,
                transformStyle: 'preserve-3d'
              }}
              className="relative z-10 origin-center"
            >
              <Hero />

              {/* 2nd code: Work Section (kept) */}
              <section id="work-artifacts" className="py-24 md:py-40 bg-canvas">
                <div className="container mx-auto px-6 max-w-5xl">
                  <SectionReveal>
                    <div className="mb-32 flex flex-col items-center text-center">
                      <motion.span
                        initial={{ letterSpacing: '0.2em' }}
                        whileInView={{ letterSpacing: '1.2em' }}
                        transition={{ duration: 2 }}
                        className="text-neutral-600 text-[10px] font-black uppercase mb-10"
                      >
                        The Artifacts
                      </motion.span>
                      <h2 className="text-6xl md:text-[10vw] font-serif leading-[0.85] italic text-ink/90 tracking-tighter">
                        Selected <br /> <span className="not-italic opacity-50">Work</span>
                      </h2>
                    </div>
                  </SectionReveal>

                  <div className="flex flex-col gap-y-40 md:gap-y-60">
                    {visibleProjects.map((project, index) => (
                      <motion.div
                        key={project.id}
                        className="project-trigger w-full cursor-pointer"
                        onClick={() => handleProjectSelect(project.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') handleProjectSelect(project.id);
                        }}
                      >
                        <ProjectCard project={project} index={index} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              <Gallery />

              {/* 2nd code: Dynamic Kinetic Marquee (kept) */}
              <section className="py-40 md:py-60 bg-ink text-canvas overflow-hidden relative">
                <motion.div style={{ x: marqueeX }} className="whitespace-nowrap flex gap-24">
                  <span className="text-[8vw] font-serif italic tracking-tighter opacity-10 uppercase font-black">
                    Relentless —
                  </span>
                  <span className="text-[8vw] font-serif italic tracking-tighter opacity-10 uppercase font-black">
                    Relentless —
                  </span>
                </motion.div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                  <SectionReveal>
                    <h3 className="text-4xl md:text-7xl font-serif max-w-5xl mx-auto leading-[0.9] tracking-tighter italic">
                      "Clarity in complexity <span className="not-italic"></span>{' '}
                      <span className="not-italic"></span> <span className="not-italic"></span>."
                    </h3>
                  </SectionReveal>
                </div>
              </section>

              {/* 2nd code: About Section (kept + interactive tilt) */}
              <section
                id="about"
                className="py-24 md:py-60 bg-canvas overflow-visible relative"
                onMouseMove={handleAboutMouseMove}
                onMouseLeave={handleAboutMouseLeave}
              >
                <div className="container mx-auto px-6">
                  <div className="about-layout grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:grid-cols-2 gap-[clamp(1rem,6vw,10rem)] items-start lg:items-center [&>*]:min-w-0">
                    <SectionReveal>
                      <motion.div
                        className="portrait-hover relative group perspective-container"
                        style={{
                          rotateX: aboutRotateX,
                          rotateY: aboutRotateY,
                          transformStyle: 'preserve-3d'
                        }}
                      >
                        <div className="aspect-[3/4] bg-neutral-900 overflow-hidden transform-gpu shadow-[0_100px_200px_-50px_rgba(0,0,0,1)] group-hover:shadow-[0_120px_240px_-60px_rgba(255,255,255,0.05)] transition-shadow duration-1000">
                          <img
                            src="assets/portrait.jpg"
                            alt="Christine - Portrait"
                            className="portrait-image w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1544717297-fa95b3697628?q=80&w=1200&h=1600&auto=format&fit=crop';
                            }}
                          />
                        </div>

                        {/* Floating Depth Pane */}
                        <motion.div
                          style={{ transform: 'translateZ(150px)' }}
                          className="absolute -bottom-16 -right-8 glass p-10 hidden xl:block border border-ink/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] backdrop-blur-3xl"
                        >
                          <p className="text-7xl font-serif mb-4 tracking-tighter text-ink/20 group-hover:text-ink transition-colors duration-1000">
                            EST
                          </p>
                          <p className="text-[10px] uppercase tracking-[1em] text-neutral-500 font-black">
                            NewYork 2026
                          </p>
                        </motion.div>

                        <motion.div
                          style={{ transform: 'translateZ(-100px)' }}
                          className="absolute -top-16 -left-16 w-48 h-48 hidden xl:block border border-ink/5 bg-ink/[0.02] backdrop-blur-sm -z-10 rounded-full"
                        />
                      </motion.div>
                    </SectionReveal>

                    <div className="lg:pt-10">
                      <SectionReveal>
                        <span className="text-neutral-700 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.15em] lg:tracking-[0.8em] mb-4 md:mb-8 lg:mb-12 block">
                          The Soul of Work
                        </span>
                        <h2 className="text-[clamp(1.5rem,5.5vw,6rem)] font-serif mb-5 md:mb-10 lg:mb-16 tracking-tighter text-ink leading-[0.95]">
                          Christine <br />
                          <span className="italic">Lin</span>
                        </h2>
                        <div className="space-y-5 md:space-y-8 lg:space-y-12 text-[clamp(0.75rem,1.6vw,1.5rem)] text-neutral-500 leading-relaxed font-light max-w-2xl transition-colors hover:text-neutral-300">
                          <p>{CHRISTINE_BIO}</p>
                          <p className="border-l-2 lg:border-l-4 border-ink/10 pl-3 md:pl-6 lg:pl-10 italic text-neutral-600 text-[clamp(0.75rem,1.4vw,1.25rem)] font-serif">
                            "I design the invisible layers of trust in digital experiences."
                          </p>
                        </div>
                      </SectionReveal>
                    </div>
                  </div>
                </div>
              </section>

              {/* 2nd code: Contact Finale (kept) */}
              <section
                id="contact-finale"
                className="min-h-[80vh] flex items-center justify-center bg-canvas text-ink relative overflow-hidden"
              >
                <div className="container mx-auto px-6 text-center z-10">
                  <SectionReveal>
                    <span className="text-neutral-800 text-[10px] font-black uppercase tracking-[1.5em] mb-24 block">
                      Get In Touch
                    </span>
                    <a
                      href="mailto:christinelin2677@gmail.com"
                      data-cursor-label="book a meeting to talk!"
                      className="text-7xl md:text-[15vw] font-serif leading-none tracking-tighter hover:italic hover:text-neutral-400 transition-all duration-1000 block mb-32"
                    >
                      LET&apos;S <br /> TALK
                    </a>

                    <div className="flex justify-center items-center gap-6 md:gap-10 text-neutral-400">
                      <a href="https://drive.google.com/file/d/1wLGX65t87aJsiHmJ2AGJGNyngliOkSAW/view?usp=sharing" target="_blank" rel="noopener noreferrer" aria-label="Resume (opens in a new tab)" className="contact-icon relative flex h-12 w-12 items-center justify-center rounded-full hover:text-ink hover:bg-neutral-900 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current">
                        <FileUser aria-hidden="true" size={24} strokeWidth={1.5} />
                        <span aria-hidden="true" className="contact-tooltip">Resume</span>
                      </a>
                      <a href="mailto:christinelin2677@gmail.com" aria-label="Email me" className="contact-icon relative flex h-12 w-12 items-center justify-center rounded-full hover:text-ink hover:bg-neutral-900 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current">
                        <Mail aria-hidden="true" size={24} strokeWidth={1.5} />
                        <span aria-hidden="true" className="contact-tooltip">Email me</span>
                      </a>
                      <a href="https://www.linkedin.com/in/qinyulin/" aria-label="LinkedIn" className="contact-icon relative flex h-12 w-12 items-center justify-center rounded-full hover:text-ink hover:bg-neutral-900 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current">
                        <LinkedinIcon aria-hidden="true" size={24} strokeWidth={1.5} />
                        <span aria-hidden="true" className="contact-tooltip">LinkedIn</span>
                      </a>
                    </div>
                  </SectionReveal>
                </div>

                <motion.div
                  style={{ y: contactBgY }}
                  className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none flex justify-center items-center"
                >
                  <span className="text-[40vw] font-black tracking-tighter opacity-10">C.</span>
                </motion.div>
              </section>
            </motion.main>
          </motion.div>
        ) : (
          <ProjectAccess key={activeProjectId} project={activeProject!} onBack={handleBack} onNext={handleNext} />
        )}
      </AnimatePresence>

      {/* Keep your original footer (unchanged) */}
      <footer className="py-24 bg-canvas border-t border-ink/5 relative z-20">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="text-neutral-700 text-[9px] tracking-[0.5em] font-black uppercase">
            &copy; ALL RIGHTS OBSERVED
          </div>
          <div className="flex items-center gap-6">
            <div className="w-20 h-px bg-neutral-900" />
            <span className="text-ink text-lg font-serif italic">Christine.</span>
            <div className="w-20 h-px bg-neutral-900" />
          </div>
        
          <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-neutral-500 hover:text-ink transition-colors text-[9px] tracking-[0.5em] font-black uppercase flex items-center gap-2"
            >
           BACK TO TOP
          </button>

        </div>
      </footer>

      {/* <AIAssistant /> */}
    </div>
  );
};

export default App;
