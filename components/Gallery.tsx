import React from 'react';
import { GALLERY_PROJECTS } from '../galleryProjects';
import SectionReveal from './SectionReveal';

const Gallery: React.FC = () => (
  <section id="gallery" aria-labelledby="gallery-title" className="scroll-mt-24 border-t border-neutral-900 bg-canvas py-24 md:py-40">
    <div className="container mx-auto max-w-5xl px-6">
      <SectionReveal>
        <div className="mb-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-6 text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500">Motion & visual experiments</p>
            <h2 id="gallery-title" className="font-serif text-6xl italic tracking-tighter text-ink/90 md:text-8xl">Gallery<span className="text-neutral-600">.</span></h2>
          </div>
          <p className="max-w-xs text-sm font-light leading-relaxed text-neutral-400">A playground for motion, playful interactions, and visual ideas made with AI.</p>
        </div>
      </SectionReveal>

      {GALLERY_PROJECTS.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {GALLERY_PROJECTS.map((project) => (
            <a key={project.id} href={project.url} target="_blank" rel="noopener noreferrer" className="group block rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-ink">
              <div data-theme="dark" className="relative mb-6 aspect-[4/3] overflow-hidden rounded-xl bg-neutral-900">
                <img src={project.image} alt={project.title} loading="lazy" className="h-full w-full object-cover brightness-75 transition duration-300 group-hover:scale-105 group-hover:brightness-100 group-focus-visible:brightness-100" />
                <span aria-hidden="true" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-canvas/60 text-lg text-ink">↗</span>
              </div>
              <div className="mb-3 flex flex-wrap gap-2">
                {project.tags.map((tag) => <span key={tag} className="rounded-full border border-neutral-800 px-2.5 py-1 text-[9px] uppercase tracking-widest text-neutral-400">{tag}</span>)}
              </div>
              <h3 className="mb-2 font-serif text-2xl text-neutral-100">{project.title}</h3>
              <p className="text-sm font-light leading-relaxed text-neutral-500">{project.description}</p>
              <span className="sr-only">Opens in a new tab</span>
            </a>
          ))}
        </div>
      ) : (
        <div>
          <div aria-hidden="true" className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[1, 2, 3].map((number) => (
              <div key={number} className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-neutral-800/70 bg-gradient-to-br from-neutral-900/70 to-canvas">
                <span className="absolute left-5 top-5 font-mono text-[10px] text-neutral-600">0{number}</span>
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-neutral-700/60">
                  <span className="text-3xl font-extralight text-neutral-600">+</span>
                </div>
                <span className="absolute bottom-5 text-[9px] uppercase tracking-[0.3em] text-neutral-500">Coming soon</span>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-xs tracking-wide text-neutral-500">AI experiments are on their way. Stay curious.</p>
        </div>
      )}
    </div>
  </section>
);

export default Gallery;
