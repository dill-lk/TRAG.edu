import React, { useState, useEffect } from 'react';
import { Search, Menu, X, Sun, Moon, Command } from 'lucide-react';
import { NAV_LINKS } from '../constants';

interface HeaderProps {
  activeRoute: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenSearch: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeRoute, theme, onToggleTheme, onOpenSearch }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl transition-all duration-700 ease-out ${isScrolled ? 'top-2' : 'top-6'}`}>
        <div className={`
          flex items-center justify-between px-8 py-3 rounded-[3rem]
          glass-card border-white/40 dark:border-white/10 shadow-3xl
          ${isScrolled ? 'py-2.5 scale-[0.98]' : 'py-4'}
        `}>
          
          <a href="#/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
              <span className="font-black text-2xl">T</span>
            </div>
            <span className="font-black text-2xl text-slate-900 dark:text-white hidden sm:block tracking-tighter">
              Trag<span className="text-blue-500 font-medium">.edu</span>
            </span>
          </a>

          <nav className="hidden lg:flex items-center gap-2 bg-slate-900/5 dark:bg-white/5 p-1.5 rounded-full">
            {NAV_LINKS.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                className={`
                  px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all
                  ${(link.href === '#/' && activeRoute === 'home') || (link.href !== '#/' && activeRoute.includes(link.href.split('/')[2]))
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xl' 
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}
                `}
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
             <button 
                onClick={onOpenSearch}
                className="hidden md:flex items-center gap-4 px-6 py-3 glass-card bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-500 hover:text-blue-500 transition-all border-none group"
             >
                <Search size={18} className="group-hover:scale-110 transition-transform" />
                <div className="flex items-center gap-1.5">
                   <Command size={12} className="opacity-50" />
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-50">K</span>
                </div>
             </button>

             <button 
                onClick={onToggleTheme}
                className="p-3.5 glass-card bg-slate-100 dark:bg-white/5 hover:bg-blue-600 hover:text-white rounded-2xl text-slate-600 dark:text-slate-300 transition-all border-none shadow-sm"
                aria-label="Toggle Theme"
             >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
             </button>

             <button 
                className="lg:hidden p-3.5 glass-card bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-600 dark:text-slate-300 border-none"
                onClick={() => setIsMenuOpen(true)}
             >
                <Menu size={20} />
             </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-[1000] glass-card dark:bg-slate-950/98 transition-all duration-700 ${isMenuOpen ? 'opacity-100 backdrop-blur-3xl' : 'opacity-0 pointer-events-none translate-x-full'}`}>
        <button onClick={() => setIsMenuOpen(false)} className="absolute top-10 right-10 p-5 glass-card dark:text-white rounded-full">
            <X size={32} />
        </button>
        <div className="flex flex-col items-center justify-center h-full gap-12 p-8 text-center">
            {NAV_LINKS.map((link, idx) => (
                <a 
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-5xl font-black text-slate-900 dark:text-white hover:text-blue-500 transition-all tracking-tighter animate-in slide-in-from-right-20"
                    style={{ animationDelay: `${idx * 100}ms` }}
                >
                    {link.name}
                </a>
            ))}
            <button 
              onClick={() => { onOpenSearch(); setIsMenuOpen(false); }} 
              className="mt-12 px-16 py-8 bg-blue-600 text-white rounded-[2rem] font-black text-xl uppercase tracking-widest shadow-3xl"
            >
              Global Search
            </button>
        </div>
      </div>
    </>
  );
};

export default Header;