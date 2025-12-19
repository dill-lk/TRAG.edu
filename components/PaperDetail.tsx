import React, { useState, useEffect } from 'react';
import { GRADES, SUBJECTS } from '../constants';
import { Download, FileText, ChevronRight, ArrowLeft, Timer, Play, Pause, RotateCcw, Monitor, X, Book, Maximize2, Minimize2, Plus, Minus, RotateCw, Zap } from 'lucide-react';
import { Resource } from '../types';

interface StudyTimerProps {
  onStartFocus: () => void;
  minutes: number;
  setMinutes: (m: number) => void;
  seconds: number;
  setSeconds: (s: number) => void;
  isActive: boolean;
  setIsActive: (a: boolean) => void;
  preset: number;
  setPreset: (p: number) => void;
}

const StudyTimer = ({
  onStartFocus,
  minutes, setMinutes,
  seconds, setSeconds,
  isActive, setIsActive,
  preset, setPreset
}: StudyTimerProps) => {

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
    setMinutes(preset);
    setSeconds(0);
  };

  const setTime = (m: number) => {
    setIsActive(false);
    setMinutes(m);
    setPreset(m);
    setSeconds(0);
  }

  // Calculate Progress
  const totalSeconds = (preset || 120) * 60;
  const currentSecond = (minutes * 60) + seconds;
  const progress = totalSeconds > 0 ? ((totalSeconds - currentSecond) / totalSeconds) * 283 : 0;

  return (
    <div className="glass-card rounded-[2.5rem] p-10 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 shadow-2xl relative overflow-hidden">
      <div className={`absolute -right-20 -top-20 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 dark:bg-white/10 text-slate-400'}`}>
            <Timer size={20} className={isActive ? 'animate-pulse' : ''} />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Focus Timer</h3>
        </div>
        <button onClick={onStartFocus} className="p-2.5 glass-card rounded-xl text-blue-500 hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="Full Focus Mode">
          <Monitor size={18} />
        </button>
      </div>

      <div className="relative flex items-center justify-center mb-10 py-4">
        {/* Circular Progress */}
        <svg className="w-64 h-64 -rotate-90">
          <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-white/5" />
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={754} // 2 * pi * 120
            strokeDashoffset={754 - (754 * (currentSecond / totalSeconds))}
            strokeLinecap="round"
            className={`text-blue-600 transition-all duration-1000 ${isActive ? 'drop-shadow-[0_0_10px_rgba(37,99,235,0.5)]' : ''}`}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-6xl font-black tabular-nums tracking-tighter transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-white'}`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">{isActive ? 'Session Active' : 'Ready to Start'}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        {[120, 60, 25].map(t => (
          <button
            key={t}
            onClick={() => setTime(t)}
            className={`py-2 rounded-lg text-[10px] font-bold transition-all ${preset === t ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10'}`}
          >
            {t >= 60 ? `${t / 60}h` : `${t}m`}
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <button onClick={() => setIsActive(!isActive)} className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest transition-all shadow-lg hover:scale-[1.02] active:scale-95 ${isActive ? 'bg-amber-500 text-white shadow-amber-500/30' : 'bg-blue-600 text-white shadow-blue-500/30'}`}>
          {isActive ? <Pause size={18} /> : <Play size={18} />}
          {isActive ? 'Pause' : 'Start Focus'}
        </button>
        <button onClick={reset} className="w-14 h-14 glass-card rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><RotateCcw size={20} /></button>
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
  const [isPdfFullScreen, setIsPdfFullScreen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(100);

  // Timer State
  const [minutes, setMinutes] = useState(120);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [preset, setPreset] = useState(120);

  const timerProps = {
    minutes, setMinutes,
    seconds, setSeconds,
    isActive, setIsActive,
    preset, setPreset
  };

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
            <StudyTimer onStartFocus={() => { }} {...timerProps} />
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

            <div className="bg-slate-900 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl mb-12">
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

            {/* PDF Preview Section */}
            <div className="mb-12 rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-lg bg-slate-50 dark:bg-slate-900/50">
              <div className="p-6 bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Document Preview</h3>
                <div className="flex gap-4">
                  <button
                    onClick={() => setIsPdfFullScreen(true)}
                    className="p-2.5 glass-card rounded-xl text-slate-500 hover:text-blue-500 transition-all border-none"
                    title="Full Screen Preview"
                  >
                    <Maximize2 size={16} />
                  </button>
                  <div className="flex gap-2 items-center">
                    <div className="w-3 h-3 rounded-full bg-red-400/20 border border-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400/20 border border-amber-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400/20 border border-green-500/50"></div>
                  </div>
                </div>
              </div>
              <iframe
                src={`${paper.file_url}#toolbar=0&view=FitH`}
                className="w-full h-[600px] bg-slate-50 dark:bg-slate-900"
                title="PDF Preview"
              />
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
          <StudyTimer onStartFocus={() => setIsFocusMode(true)} {...timerProps} />
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
      {/* Advanced Full Screen PDF Overlay */}
      {isPdfFullScreen && (
        <div className="fixed inset-0 z-[100] bg-[#020617] flex flex-col animate-in fade-in zoom-in-95 duration-500">
          {/* Subtle Vignette */}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)] z-10"></div>

          {/* Premium Floating Header */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-5xl">
            <div className="glass-card bg-slate-900/40 backdrop-blur-2xl border-white/5 rounded-[2.5rem] p-4 flex items-center justify-between shadow-3xl">
              <div className="flex items-center gap-6 pl-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">{paper.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Premium Reader Active</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPdfFullScreen(false)}
                  className="p-4 bg-white/5 hover:bg-red-500/20 hover:text-red-500 text-slate-400 rounded-2xl transition-all group"
                  title="Close Reader"
                >
                  <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>

          {/* Document Container */}
          <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4 pt-28 pb-32">
            <div
              className="relative w-full h-full max-w-5xl bg-white shadow-3xl rounded-sm transition-all duration-500 ease-out"
              style={{
                transform: `rotate(${rotation}deg) scale(${zoom / 100})`,
                transformOrigin: 'center center'
              }}
            >
              <iframe
                src={`${paper.file_url}#toolbar=0&view=FitH`}
                className="w-full h-full border-none"
                title="Full Screen PDF"
              />
            </div>
          </div>

          {/* Premium Floating Control Dashboard (Bottom) */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40">
            <div className="glass-card bg-slate-900/60 backdrop-blur-3xl border-white/10 rounded-full p-3 flex items-center gap-2 shadow-3xl border-t border-white/20">
              <div className="flex items-center px-4 border-r border-white/10 gap-4">
                <button
                  onClick={() => setZoom(prev => Math.max(50, prev - 20))}
                  className="p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
                  title="Zoom Out"
                >
                  <Minus size={20} />
                </button>
                <div className="min-w-[60px] text-center">
                  <span className="text-xs font-black text-white">{zoom}%</span>
                </div>
                <button
                  onClick={() => setZoom(prev => Math.min(300, prev + 20))}
                  className="p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
                  title="Zoom In"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="flex items-center gap-2 px-2">
                <button
                  onClick={() => setRotation(prev => (prev + 90) % 360)}
                  className="p-4 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-full transition-all"
                  title="Rotate Document"
                >
                  <RotateCw size={22} />
                </button>

                <div className="h-8 w-px bg-white/10 mx-2"></div>

                <button
                  onClick={() => (document.querySelector('button[aria-label="Ask Trag AI"]') as HTMLElement)?.click()}
                  className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-full font-bold uppercase text-[10px] tracking-widest hover:bg-blue-500 hover:scale-105 transition-all shadow-lg shadow-blue-500/40"
                >
                  <Zap size={18} className="fill-current" />
                  Smart AI Context
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Focus Hub (Bottom Left) */}
          <div className="absolute bottom-10 left-10 z-50">
            <div className="group relative">
              <div className="absolute inset-0 bg-blue-600/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative scale-[0.65] origin-bottom-left hover:scale-[0.8] transition-transform duration-500">
                <StudyTimer {...timerProps} onStartFocus={() => { }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaperDetail;