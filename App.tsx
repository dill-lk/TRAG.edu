import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import GradePage from './components/GradePage';
import SubjectPage from './components/SubjectPage';
import PaperDetail from './components/PaperDetail';
import AdminPanel from './components/AdminPanel';
import NotesMarketplace from './components/NotesMarketplace';
import TragAIWidget from './components/TragAIWidget';
import GameZone from './components/GameZone';
import VideoLibrary from './components/VideoLibrary';
import { supabase } from './supabase';
import { Resource } from './types';
import { RESOURCES as LOCAL_RESOURCES } from './constants';
import { Search } from 'lucide-react';

const useHashLocation = () => {
  const [loc, setLoc] = useState(window.location.hash);
  useEffect(() => {
    const handler = () => setLoc(window.location.hash);
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);
  return loc;
};

const CommandPalette = ({ isOpen, onClose, resources, onNavigate }: any) => {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return resources.filter((r: any) =>
      r.title.toLowerCase().includes(q) ||
      r.year?.toString().includes(q)
    ).slice(0, 8);
  }, [query, resources]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[15vh] px-4 animate-in fade-in">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-xl glass-card rounded-[2.5rem] overflow-hidden shadow-2xl border-white/20">
        <div className="flex items-center p-6 border-b border-white/5">
          <Search className="text-blue-500 mr-4" size={24} />
          <input
            autoFocus
            placeholder="Search for papers..."
            className="bg-transparent border-none w-full text-lg font-bold focus:ring-0 outline-none text-white placeholder:text-slate-500"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <div className="px-3 py-1 glass-card rounded-lg text-[9px] font-bold text-slate-500 uppercase">ESC</div>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2 space-y-1">
          {results.map((r: any) => (
            <div
              key={r.id}
              onClick={() => { onNavigate(`#/paper/${r.id}`); onClose(); }}
              className="flex items-center justify-between p-4 hover:bg-blue-600 rounded-xl cursor-pointer group transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-white"><Search size={20} /></div>
                <div className="text-left">
                  <h4 className="text-white font-bold text-sm group-hover:text-white">{r.title}</h4>
                  <span className="text-[10px] font-bold text-slate-500 uppercase group-hover:text-blue-200">{r.year} • {r.type}</span>
                </div>
              </div>
            </div>
          ))}
          {query && results.length === 0 && (
            <div className="p-10 text-center text-slate-500 font-bold uppercase text-[10px] tracking-widest">No matching papers</div>
          )}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const hash = useHashLocation();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'dark';
  });

  const [dbResources, setDbResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isMaintenance, setIsMaintenance] = useState(false);

  useEffect(() => {
    const checkSystem = async () => {
      const { data } = await supabase.from('system_settings').select('value').eq('key', 'MAINTENANCE_MODE').single();
      if (data?.value === 'true') setIsMaintenance(true);
    };
    checkSystem();

    const fetchResources = async () => {
      try {
        const { data, error } = await supabase.from('resources').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        const mapped: Resource[] = data.map((r: any) => ({
          id: r.id, title: r.title, type: r.type, gradeId: r.grade_id,
          subjectId: r.subject_id, year: r.year, medium: r.medium,
          file_url: r.file_url, term: r.term
        }));
        setDbResources([...mapped, ...LOCAL_RESOURCES]);
      } catch (err) {
        setDbResources(LOCAL_RESOURCES);
        // Dont throw in prod, just fallback
      } finally {
        setTimeout(() => setIsLoading(false), 800);
      }
    };
    fetchResources();
  }, []);

  // ... (Key handlers & Theme effects) ...

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.altKey && e.key === 'k') || (e.metaKey && e.key === 'k')) {
        e.preventDefault();
        setIsPaletteOpen(true);
      }
      if (e.key === 'Escape') setIsPaletteOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  const getRouteInfo = () => {
    const parts = hash.replace('#/', '').split('/');
    const main = parts[0] || 'home';
    return { main, parts };
  };

  const { main, parts } = getRouteInfo();

  const navigate = (path: string) => {
    window.location.hash = path;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getContext = () => {
    if (main === 'paper') return `Helping student with paper: ${parts[1]}.`;
    if (main === 'subject') return `Helping with subject module: ${parts[2]} for Grade: ${parts[1]}.`;
    if (main === 'grade') return `Viewing papers for ${parts[1]}.`;
    if (main === 'notes') return 'Browsing student-shared notes in the marketplace.';
    if (main === 'videos') return 'Watching educational videos in the library.';
    if (main === 'games') return 'Playing educational games to sharpen skills.';
    return 'TRAG.edu Library Hub.';
  };

  // Maintenance Lockdown View
  if (isMaintenance && main !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center p-6 text-center animate-in fade-in">
        <div className="max-w-md">
          <div className="w-24 h-24 bg-amber-500/10 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Search size={48} className="animate-pulse" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">System Offline</h1>
          <p className="text-slate-500 text-lg mb-8">TRAG.edu is currently undergoing scheduled maintenance to upgrade our neural archives. Please check back shortly.</p>
          <div className="inline-block px-6 py-2 bg-slate-200 dark:bg-white/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-8">
            Error Code: 503 SERVICE_UNAVAILABLE
          </div>

          <div>
            <button
              onClick={() => window.location.hash = '#/admin'}
              className="text-slate-400 hover:text-blue-500 text-[10px] font-bold uppercase tracking-widest transition-colors"
            >
              Wait, are you an Admin? Click here to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300 bg-[#fdfcf0] dark:bg-[#020617]">
      <Helmet>
        <title>TRAG.edu | Digital Paper Library</title>
        <meta name="description" content="TRAG.edu: The ultimate digital library for Sri Lankan G.C.E. A/L, O/L, and Grade 6-11 past papers. Features AI-powered study assistance, marketplace for notes, and structured archives." />
      </Helmet>
      <Header activeRoute={main} theme={theme} onToggleTheme={toggleTheme} onOpenSearch={() => setIsPaletteOpen(true)} />

      <main className="flex-grow pt-24 md:pt-28 pb-16 px-0 md:px-6 max-w-full lg:max-w-[75%] mx-auto w-full relative z-10 transition-all">
        {isLoading && (
          <div className="fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-[#fdfcf0] dark:bg-[#020617] transition-opacity duration-700">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500 animate-pulse">Loading Library...</p>
          </div>
        )}

        {main === 'home' && <Home onNavigate={navigate} resources={dbResources} />}
        {main === 'grade' && <GradePage gradeId={parts[1]} onNavigate={navigate} resources={dbResources} />}
        {main === 'subject' && <SubjectPage gradeId={parts[1]} subjectId={parts[2]} onNavigate={navigate} resources={dbResources} />}
        {main === 'paper' && <PaperDetail paperId={parts[1]} onNavigate={navigate} resources={dbResources} />}
        {main === 'notes' && <NotesMarketplace />}
        {main === 'videos' && <VideoLibrary />}
        {main === 'admin' && <AdminPanel />}
        {main === 'games' && <GameZone />}
      </main>

      <TragAIWidget currentContext={getContext()} />
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        resources={dbResources}
        onNavigate={navigate}
      />
      <Footer />
    </div>
  );
};

export default App;