import React, { useState, useEffect } from 'react';
import { GRADES, SUBJECTS } from '../constants';
import { Download, FileText, ChevronRight, ArrowLeft, Timer, Play, Pause, RotateCcw, Monitor, X, Book } from 'lucide-react';
import { Resource } from '../types';

const StudyTimer = ({ onStartFocus }: { onStartFocus: () => void }) => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          setIsActive(false);
          alert('Study session complete!');
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  const reset = () => {
    setIsActive(false);
    setMinutes(25);
    setSeconds(0);
  };

  return (
    <div className="glass-card rounded-[2.5rem] p-10 text-slate-800 dark:text-white border-none shadow-lg">
      <div className="flex items-center justify-between mb-8 border-b border-slate-100 dark:border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <Timer size={24} className="text-blue-500" />
          <h3 className="text-sm font-bold uppercase tracking-widest">Study Timer</h3>
        </div>
        <button onClick={onStartFocus} className="p-2.5 glass-card rounded-xl text-blue-500" title="Full Focus Mode">
          <Monitor size={18} />
        </button>
      </div>
      <div className="text-center mb-10">
        <div className="text-8xl font-black tabular-nums tracking-tighter text-blue-600">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>
      <div className="flex gap-4">
        <button onClick={() => setIsActive(!isActive)} className={`flex-1 py-5 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs uppercase transition-all ${isActive ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'}`}>
          {isActive ? <Pause size={18} /> : <Play size={18} />}
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button onClick={reset} className="w-16 h-16 glass-card rounded-2xl flex items-center justify-center text-slate-400"><RotateCcw size={20} /></button>
      </div>
    </div>
  );
};

interface PaperDetailProps {
  paperId: string;
  onNavigate: (path: string) => void;
  resources: Resource[];
}

const PaperDetail: React.FC<PaperDetailProps> = ({ paperId, onNavigate, resources }) => {
  const [isFocusMode, setIsFocusMode] = useState(false);

  const paper = resources.find(p => p.id === paperId);
  const grade = paper ? GRADES.find(g => g.id === paper.gradeId) : null;
  const subject = paper ? SUBJECTS.find(s => s.id === paper.subjectId) : null;

  if (!paper || !grade || !subject) return <div className="p-32 text-center text-slate-400 font-bold uppercase tracking-widest">Loading Paper Details...</div>;

  if (isFocusMode) {
    return (
      <div className="focus-overlay">
        <button onClick={() => setIsFocusMode(false)} className="absolute top-10 right-10 p-4 bg-white/10 hover:bg-red-500 text-white rounded-full transition-all">
          <X size={28} />
        </button>
        <div className="max-w-4xl w-full p-8 text-center space-y-16">
          <div className="space-y-4">
            <span className="text-blue-500 font-bold uppercase tracking-widest text-xs">Study Mode Active</span>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">{paper.title}</h2>
          </div>
          <div className="scale-110">
            <StudyTimer onStartFocus={() => { }} />
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={() => window.open(paper.file_url, '_blank')} className="px-12 py-6 bg-white text-slate-900 rounded-[2rem] font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-3">
              <FileText size={20} /> Open PDF
            </button>
            <button onClick={() => (document.querySelector('button[aria-label="Ask Trag AI"]') as HTMLElement)?.click()} className="px-12 py-6 bg-blue-600 text-white rounded-[2rem] font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-3">
              <Book size={20} /> Ask AI Helper
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-32 pt-10 animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-12 px-4">
        <button onClick={() => onNavigate(`#/subject/${grade.id}/${subject.id}`)} className="flex items-center gap-3 text-slate-400 hover:text-blue-500 font-bold text-[10px] uppercase tracking-widest transition-all">
          <ArrowLeft size={16} /> Back to List
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 px-4">
        <div className="lg:col-span-8 space-y-12">
          <div className="glass-card rounded-[3rem] p-12 md:p-16 relative overflow-hidden shadow-xl border-white/10">
            <div className="flex items-center gap-3 mb-10">
              <span className="px-6 py-2 bg-blue-600 text-white rounded-full text-[10px] font-bold uppercase tracking-widest">{paper.type}</span>
              <span className="px-6 py-2 glass-card rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-400 border-none">Public Resource</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-12 tracking-tighter leading-tight">{paper.title}</h1>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-10 mb-16 border-y border-slate-100 dark:border-white/5 py-12">
              <div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Medium</span><p className="text-2xl font-black text-slate-800 dark:text-white">{paper.medium}</p></div>
              <div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Year</span><p className="text-2xl font-black text-slate-800 dark:text-white">{paper.year || 'N/A'}</p></div>
              <div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Grade</span><p className="text-2xl font-black text-slate-800 dark:text-white">{grade.name}</p></div>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center text-white border border-white/10"><FileText size={32} /></div>
                <div>
                  <h3 className="text-3xl font-black text-white leading-none">Ready to Download</h3>
                  <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mt-2">Verified PDF Asset</p>
                </div>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <button onClick={() => alert('Issue reported to admin team. Thank you!')} className="w-12 h-16 md:w-16 md:h-auto glass-card rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all" title="Report Issue">
                  <span className="sr-only">Report Issue</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" x2="4" y1="22" y2="15" /></svg>
                </button>
                <button onClick={() => window.open(paper.file_url, '_blank')} className="flex-1 px-8 py-6 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-blue-500/30 hover:scale-105 transition-all"><Download size={20} /> Download PDF</button>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-[3rem] p-12 flex flex-col sm:flex-row items-center gap-10 border-none shadow-md">
            <div className="w-24 h-24 bg-blue-500/10 rounded-[2rem] flex items-center justify-center text-blue-500 shrink-0">
              <Book size={40} />
            </div>
            <div>
              <h3 className="text-3xl font-black mb-3 tracking-tight">Need Help?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-lg">Use the AI Helper to get step-by-step solutions or explanations for any part of this paper.</p>
              <button onClick={() => (document.querySelector('button[aria-label="Ask Trag AI"]') as HTMLElement)?.click()} className="mt-6 px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all">Ask Assistant</button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <StudyTimer onStartFocus={() => setIsFocusMode(true)} />
          <div className="glass-card rounded-[2.5rem] p-10 space-y-8 border-none shadow-sm">
            <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white pb-4 border-b border-slate-100 dark:border-white/5">More Resources</h3>
            <div className="space-y-6">
              {resources.filter(r => r.subjectId === subject.id && r.id !== paper.id).slice(0, 4).map(r => (
                <div key={r.id} className="cursor-pointer flex items-center gap-5 group" onClick={() => onNavigate(`#/paper/${r.id}`)}>
                  <div className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all"><ChevronRight size={16} /></div>
                  <div><h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 line-clamp-1 group-hover:text-blue-500 transition-colors">{r.title}</h4><span className="text-[9px] font-bold text-slate-400">{r.year}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperDetail;