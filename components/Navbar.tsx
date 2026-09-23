import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

type NavbarProps = {
  onWork?: () => void;
  onGallery?: () => void;
  onAbout?: () => void;
  onContact?: () => void;
};

const Navbar: React.FC<NavbarProps> = ({ onWork, onGallery, onAbout, onContact }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Work', href: '#work-artifacts', onClick: onWork },
    { label: 'Gallery', href: '#gallery', onClick: onGallery },
    { label: 'About', href: '#about', onClick: onAbout },
  ];

  const handleNavClick = (href: string, cb?: () => void) => (e: React.MouseEvent) => {
    // 用我们自己的逻辑：阻止默认 hash 跳转（否则在 project page 时会失效/不稳定）
    e.preventDefault();
    cb?.();
    setIsOpen(false);
  };

  return (
    <nav
      className={`site-header fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'py-4' : 'py-8'
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <motion.a
          href="#"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-serif italic tracking-tight font-bold"
          onClick={(e) => {
            e.preventDefault();
            // 点 logo 回到顶部（可选）
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setIsOpen(false);
          }}
        >
          Christine<span className="text-neutral-500">.</span>
        </motion.a>

        <div className="flex items-center gap-3 md:gap-6">
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 lg:gap-12">
          {navItems.map((item, idx) => (
            <motion.a
              key={item.label}
              href={item.href}
              onClick={handleNavClick(item.href, item.onClick)}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="text-sm font-medium tracking-widest uppercase text-neutral-400 hover:text-ink transition-colors"
            >
              {item.label}
            </motion.a>
          ))}

          <motion.a
            href="#contact-finale"
            onClick={handleNavClick('#contact-finale', onContact)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-6 py-2 bg-ink text-canvas text-xs font-bold tracking-widest uppercase rounded-full hover:bg-neutral-200 transition-all"
          >
            CONTACT
          </motion.a>
        </div>

        <ThemeToggle />
        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-ink" aria-label={isOpen ? 'Close menu' : 'Open menu'} aria-expanded={isOpen} onClick={() => setIsOpen(!isOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            )}
          </svg>
        </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-canvas border-b border-neutral-800 p-8 flex flex-col items-center space-y-6 md:hidden"
          >
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-xl font-medium"
                onClick={handleNavClick(item.href, item.onClick)}
              >
                {item.label}
              </a>
            ))}

            <a
              href="#contact-finale"
              className="px-6 py-2 bg-ink text-canvas text-sm font-bold uppercase tracking-widest rounded-full"
              onClick={handleNavClick('#contact-finale', onContact)}
            >
              CONTACT
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
