import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GRADES, SUBJECTS } from '../constants';
import { Download, FileText, ChevronRight, ArrowLeft, Timer, Play, Pause, RotateCcw, Monitor, X, Book, Maximize2, Minimize2, Plus, Minus, RotateCw, Zap, Pencil } from 'lucide-react';
import { Resource } from '../types';
import CommentSection from './CommentSection';

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

  const currentSecond = (minutes * 60) + seconds;
  const totalSeconds = (preset || 120) * 60;

  return (
    <div className="glass-card rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-10 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 shadow-2xl relative overflow-hidden">
      <div className={`absolute -right-20 -top-20 w-48 md:w-64 h-48 md:h-64 bg-blue-500/20 rounded-full blur-[60px] md:blur-[80px] transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>

      <div className="flex items-center justify-between mb-6 md:mb-8 relative z-10">
        <div className="flex items-center gap-2 md:gap-3">
          <div className={`p-1.5 md:p-2 rounded-lg md:rounded-xl transition-colors ${isActive ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 dark:bg-white/10 text-slate-400'}`}>
            <Timer size={16} className={isActive ? 'animate-pulse' : ''} />
          </div>
          <h3 className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Focus Timer</h3>
        </div>
        <button onClick={onStartFocus} className="p-2 md:p-2.5 glass-card rounded-lg md:rounded-xl text-blue-500 hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="Full Focus Mode">
          <Monitor size={16} />
        </button>
      </div>

      <div className="relative flex items-center justify-center mb-6 md:mb-10 py-2 md:py-4">
        <svg className="w-32 h-32 md:w-64 md:h-64 -rotate-90">
          <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100 dark:text-white/5 md:hidden" />
          <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-white/5 hidden md:block" />
          <circle
            cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="4" fill="transparent"
            strokeDasharray={364}
            strokeDashoffset={364 - (364 * (currentSecond / totalSeconds))}
            strokeLinecap="round"
            className={`text-blue-600 transition-all duration-1000 md:hidden ${isActive ? 'drop-shadow-[0_0_8px_rgba(37,99,235,0.4)]' : ''}`}
          />
          <circle
            cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="8" fill="transparent"
            strokeDasharray={754}
            strokeDashoffset={754 - (754 * (currentSecond / totalSeconds))}
            strokeLinecap="round"
            className={`text-blue-600 transition-all duration-1000 hidden md:block ${isActive ? 'drop-shadow-[0_0_10px_rgba(37,99,235,0.5)]' : ''}`}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl md:text-6xl font-black tabular-nums tracking-tighter transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-white'}`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{isActive ? 'Focusing' : 'Ready'}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4 md:mb-6">
        {[120, 60, 25].map(t => (
          <button
            key={t}
            onClick={() => setTime(t)}
            className={`py-1.5 md:py-2 rounded-lg text-[9px] md:text-[10px] font-bold transition-all ${preset === t ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10'}`}
          >
            {t >= 60 ? `${t / 60}h` : `${t}m`}
          </button>
        ))}
      </div>

      <div className="flex gap-2 md:gap-4">
        <button onClick={() => setIsActive(!isActive)} className={`flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] md:text-xs uppercase tracking-widest transition-all shadow-lg hover:scale-[1.02] active:scale-95 ${isActive ? 'bg-amber-500 text-white shadow-amber-500/30' : 'bg-blue-600 text-white shadow-blue-500/30'}`}>
          {isActive ? <Pause size={14} /> : <Play size={14} />}
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button onClick={reset} className="w-10 h-10 md:w-14 md:h-14 glass-card rounded-xl md:rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><RotateCcw size={16} /></button>
      </div>
    </div>
  );
};

const Calculator = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [display, setDisplay] = useState('0');
  if (!isOpen) return null;

  const buttons = ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', 'C', '=', '+'];

  const handleBtn = (b: string) => {
    if (b === 'C') setDisplay('0');
    else if (b === '=') {
      try { setDisplay(Function('"use strict";return (' + display + ')')().toString()); } catch { setDisplay('Error'); }
    } else {
      setDisplay(prev => prev === '0' || prev === 'Error' ? b : prev + b);
    }
  };

  return (
    <div className="fixed top-24 right-10 z-[60] w-64 glass-card p-6 rounded-[2rem] shadow-3xl border-white/20 animate-in slide-in-from-right-4">
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Calculator</span>
        <button onClick={onClose} className="p-1 hover:text-red-500 transition-colors"><X size={16} /></button>
      </div>
      <div className="bg-slate-900 text-white p-4 rounded-xl text-right text-2xl font-mono mb-4 shadow-inner overflow-hidden truncate">{display}</div>
      <div className="grid grid-cols-4 gap-2">
        {buttons.map(b => (
          <button key={b} onClick={() => handleBtn(b)} className={`p-3 rounded-lg font-bold text-sm transition-all hover:scale-110 active:scale-90 ${['/', '*', '-', '+', '='].includes(b) ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white'}`}>{b}</button>
        ))}
      </div>
    </div>
  );
};

const Whiteboard = ({ isActive, tool }: { isActive: boolean, tool: 'pen' | 'eraser' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (canvasRef.current && isActive) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = canvas.parentElement?.clientWidth || 0;
        canvas.height = canvas.parentElement?.clientHeight || 0;
        ctx.lineCap = 'round';
        ctx.lineWidth = tool === 'pen' ? 3 : 20;
        ctx.strokeStyle = tool === 'pen' ? '#2563eb' : 'rgba(255,255,255,1)';
      }
    }
  }, [isActive, tool]);

  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isActive) return;
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      const { x, y } = getCoords(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !isActive) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      const { x, y } = getCoords(e);
      ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.lineWidth = tool === 'eraser' ? 30 : 3;
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={() => setIsDrawing(false)} onMouseLeave={() => setIsDrawing(false)}
      onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={() => setIsDrawing(false)}
      className={`absolute inset-0 z-20 touch-none ${isActive ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'}`}
    />
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

  const [showCalculator, setShowCalculator] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [activeTool, setActiveTool] = useState<'pen' | 'eraser'>('pen');

  const [minutes, setMinutes] = useState(120);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [preset, setPreset] = useState(120);

  const timerProps = { minutes, setMinutes, seconds, setSeconds, isActive, setIsActive, preset, setPreset };

  const paper = resources.find(p => p.id === paperId);
  const grade = paper ? GRADES.find(g => g.id === paper.gradeId) : null;
  const subject = paper ? SUBJECTS.find(s => s.id === paper.subjectId) : null;

  if (!paper || !grade || !subject) return <div className="p-32 text-center text-slate-400 font-bold uppercase tracking-widest">Loading Paper Details...</div>;

  if (isFocusMode) {
    return (
      <div className="focus-overlay">
        <button onClick={() => setIsFocusMode(false)} className="absolute top-6 right-6 p-4 bg-white/10 hover:bg-red-500 text-white rounded-full transition-all"><X size={28} /></button>
        <div className="w-full p-4 md:p-8 text-center space-y-12 md:space-y-16">
          <div className="space-y-4">
            <span className="text-blue-500 font-bold uppercase tracking-widest text-[10px]">Study Mode Active</span>
            <h2 className="text-2xl md:text-7xl font-black text-white tracking-tighter leading-tight">{paper.title}</h2>
          </div>
          <div className="scale-100 md:scale-110"><StudyTimer onStartFocus={() => { }} {...timerProps} /></div>
          <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
            <button onClick={() => window.open(paper.file_url, '_blank')} className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3"><FileText size={18} /> Open PDF</button>
            <button onClick={() => (document.querySelector('button[aria-label="Ask AI Helper"]') as HTMLElement)?.click()} className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3"><Book size={18} /> Ask Helper</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto pb-20 md:pb-32 pt-4 md:pt-10 animate-in fade-in duration-700 overflow-x-hidden">
      <div className="flex items-center justify-between mb-8 md:mb-12 px-4">
        <button onClick={() => onNavigate(`#/subject/${grade.id}/${subject.id}`)} className="flex items-center gap-2 text-slate-400 hover:text-blue-500 font-bold text-[10px] uppercase tracking-widest transition-all"><ArrowLeft size={14} /> <span className="hidden md:inline">Back to List</span><span className="md:hidden">Back</span></button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 md:gap-12 px-0 md:px-6">
        <div className="lg:col-span-8 space-y-4 md:space-y-12">
          <div className="glass-card rounded-none md:rounded-[3rem] p-6 md:p-16 relative overflow-hidden shadow-xl border-none md:border-white/10">
            <div className="flex items-center gap-2 mb-6 md:mb-10">
              <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[8px] md:text-[10px] font-bold uppercase tracking-widest">{paper.type}</span>
              <span className="px-3 py-1 glass-card rounded-lg text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 border-none">Verified</span>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-slate-900 dark:text-white mb-6 md:mb-12 tracking-tighter leading-tight">{paper.title}</h1>
            <div className="grid grid-cols-3 gap-2 md:gap-10 mb-8 md:mb-16 border-y border-slate-100 dark:border-white/5 py-4 md:py-12">
              <div><span className="text-[7px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Medium</span><p className="text-[11px] md:text-2xl font-black text-slate-800 dark:text-white">{paper.medium}</p></div>
              <div><span className="text-[7px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Year</span><p className="text-[11px] md:text-2xl font-black text-slate-800 dark:text-white">{paper.year || 'N/A'}</p></div>
              <div><span className="text-[7px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Grade</span><p className="text-[11px] md:text-2xl font-black text-slate-800 dark:text-white">{grade.name}</p></div>
            </div>

            <div className="bg-slate-900 rounded-none md:rounded-[2.5rem] -mx-6 md:mx-0 p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 shadow-xl mb-8 md:mb-12">
              <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                <div className="w-12 h-12 md:w-20 md:h-20 bg-white/5 rounded-xl md:rounded-2xl flex items-center justify-center text-white border border-white/10 shrink-0"><FileText size={20} className="md:w-8 h-8" /></div>
                <div className="text-left"><h3 className="text-lg md:text-3xl font-black text-white leading-none">Ready to Download</h3><p className="text-blue-400 text-[8px] md:text-[10px] font-bold uppercase tracking-widest mt-1 md:mt-2">Official Verified Asset</p></div>
              </div>
              <button onClick={() => window.open(paper.file_url, '_blank')} className="flex-1 px-8 md:px-10 py-5 md:py-6 bg-blue-600 text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-2 md:gap-3 shadow-lg shadow-blue-500/30 hover:scale-[1.02] transition-all"><Download size={18} /> Download PDF</button>
            </div>

            <div className="mb-0 rounded-none md:rounded-[2.5rem] -mx-6 md:mx-0 overflow-hidden border-y md:border border-slate-200 dark:border-white/10 shadow-lg bg-slate-50 dark:bg-slate-900/50 relative">
              <div className="p-3 md:p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30">
                <div className="flex items-center gap-1.5 md:gap-3">
                  <button onClick={() => { setShowWhiteboard(true); setActiveTool('pen'); }} className={`p-2 rounded-xl transition-all ${showWhiteboard && activeTool === 'pen' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}><Pencil size={18} /></button>
                  <button onClick={() => { setShowWhiteboard(true); setActiveTool('eraser'); }} className={`p-2 rounded-xl transition-all ${showWhiteboard && activeTool === 'eraser' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}><RotateCcw size={18} /></button>
                  <button onClick={() => setShowWhiteboard(!showWhiteboard)} className={`p-2 rounded-xl transition-all ${showWhiteboard ? 'text-blue-500' : 'text-slate-400'}`}><Monitor size={18} /></button>
                  <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1"></div>
                  <button onClick={() => setShowCalculator(!showCalculator)} className={`p-2 rounded-xl transition-all ${showCalculator ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}><Plus size={18} /></button>
                </div>
                <div className="flex items-center gap-1.5 md:gap-3">
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-full"><Timer size={14} className="text-blue-500" /><span className="text-[10px] font-black tabular-nums">{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span></div>
                  <div className="relative group">
                    <button className="px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Related Lessons</button>
                    <div className="absolute top-full right-0 mt-2 w-64 glass-card p-4 rounded-2xl shadow-3xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Quick Access</span>
                      <div className="space-y-2">{resources.filter(r => r.subjectId === subject.id && r.id !== paper.id).slice(0, 3).map(r => (<div key={r.id} onClick={() => onNavigate(`#/paper/${r.id}`)} className="p-2 hover:bg-blue-500/10 rounded-lg cursor-pointer transition-colors"><h4 className="text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate">{r.title}</h4></div>))}</div>
                    </div>
                  </div>
                  <button onClick={() => (document.querySelector('button[aria-label="Ask AI Helper"]') as HTMLElement)?.click()} className="p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:scale-105 transition-all"><Zap size={18} className="fill-current" /></button>
                  <button onClick={() => setIsPdfFullScreen(true)} className="p-2 text-slate-500 hover:text-blue-500 transition-all"><Maximize2 size={18} /></button>
                </div>
              </div>
              <div className="relative">
                <Whiteboard isActive={showWhiteboard} tool={activeTool} />
                <iframe src={`${paper.file_url}#toolbar=0&view=FitH`} className="w-full h-[500px] md:h-[600px] bg-slate-50 dark:bg-slate-900 border-none relative z-10" title="PDF Preview" />
              </div>
              <Calculator isOpen={showCalculator} onClose={() => setShowCalculator(false)} />
            </div>
          </div>
          <CommentSection paperId={paper.id} />
        </div>
        <div className="lg:col-span-4 space-y-4 md:space-y-8 px-4 md:px-0">
          <StudyTimer onStartFocus={() => setIsFocusMode(true)} {...timerProps} />
          <div className="glass-card rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 border-none shadow-sm">
            <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white pb-4 border-b border-slate-100 dark:border-white/5 mb-6">More for you</h3>
            <div className="space-y-6">
              {resources.filter(r => r.subjectId === subject.id && r.id !== paper.id).slice(0, 4).map(r => (
                <div key={r.id} className="cursor-pointer flex items-center gap-5 group" onClick={() => onNavigate(`#/paper/${r.id}`)}>
                  <div className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0"><ChevronRight size={14} /></div>
                  <div className="min-w-0"><h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-blue-500 transition-colors">{r.title}</h4><span className="text-[9px] font-bold text-slate-400">{r.year}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isPdfFullScreen && (
        <div className="fixed inset-0 z-[100] bg-[#020617] flex flex-col animate-in fade-in zoom-in-95 duration-500">
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)] z-10"></div>
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-5xl">
            <div className="glass-card bg-slate-900/40 backdrop-blur-2xl border-white/5 rounded-[2.5rem] p-4 flex items-center justify-between shadow-3xl">
              <div className="flex items-center gap-6 pl-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg"><FileText size={24} /></div>
                <div><h3 className="text-sm font-black text-white uppercase tracking-widest">{paper.title}</h3><div className="flex items-center gap-2 mt-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Premium Reader Active</span></div></div>
              </div>
              <button onClick={() => setIsPdfFullScreen(false)} className="p-4 bg-white/5 hover:bg-red-500/20 hover:text-red-500 text-slate-400 rounded-2xl transition-all group"><X size={24} className="group-hover:rotate-90 transition-transform duration-300" /></button>
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4 pt-28 pb-32">
            <div className="relative w-full h-full max-w-5xl bg-white shadow-3xl rounded-sm transition-all duration-500 ease-out" style={{ transform: `rotate(${rotation}deg) scale(${zoom / 100})`, transformOrigin: 'center center' }}>
              <Whiteboard isActive={showWhiteboard} tool={activeTool} />
              <iframe src={`${paper.file_url}#toolbar=0&view=FitH`} className="w-full h-full border-none" title="Full Screen PDF" />
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40">
            <div className="glass-card bg-slate-900/60 backdrop-blur-3xl border-white/10 rounded-full p-3 flex items-center gap-2 shadow-3xl border-t border-white/20">
              <div className="flex items-center px-4 border-r border-white/10 gap-4">
                <button onClick={() => setZoom(prev => Math.max(50, prev - 20))} className="p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all"><Minus size={20} /></button>
                <div className="min-w-[60px] text-center"><span className="text-xs font-black text-white">{zoom}%</span></div>
                <button onClick={() => setZoom(prev => Math.min(300, prev + 20))} className="p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all"><Plus size={20} /></button>
              </div>
              <div className="flex items-center gap-2 px-2">
                <button onClick={() => setRotation(prev => (prev + 90) % 360)} className="p-4 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-full transition-all"><RotateCw size={22} /></button>
                <div className="h-8 w-px bg-white/10 mx-2"></div>
                <button
                  onClick={() => { setShowWhiteboard(!showWhiteboard); setActiveTool('pen'); }}
                  className={`p-4 rounded-full transition-all ${showWhiteboard ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                >
                  <Pencil size={22} />
                </button>
                <button onClick={() => setShowCalculator(!showCalculator)} className={`p-4 rounded-full transition-all ${showCalculator ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}><Plus size={22} /></button>
                <div className="h-8 w-px bg-white/10 mx-2"></div>
                <button onClick={() => (document.querySelector('button[aria-label="Ask Trag AI"]') as HTMLElement)?.click()} className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-full font-bold uppercase text-[10px] tracking-widest hover:bg-blue-500 hover:scale-105 transition-all shadow-lg shadow-blue-500/40"><Zap size={18} className="fill-current" />Smart AI Context</button>
              </div>
            </div>
          </div>
          <Calculator isOpen={showCalculator} onClose={() => setShowCalculator(false)} />
          <div className="absolute bottom-10 left-10 z-50">
            <div className="group relative">
              <div className="absolute inset-0 bg-blue-600/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative scale-[0.65] origin-bottom-left hover:scale-[0.8] transition-transform duration-500"><StudyTimer {...timerProps} onStartFocus={() => { }} /></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaperDetail;