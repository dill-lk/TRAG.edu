import React, { useState, useMemo, useEffect } from 'react';
import { GRADES } from '../constants';
import {
  ArrowRight, Search, GraduationCap,
  FileText, Flame, Timer, CalendarClock,
  BookOpen, Lightbulb, Calendar, Coffee, Twitter, Facebook, Instagram
} from 'lucide-react';
import { Resource } from '../types';
import { supabase } from '../supabase';

interface HomeProps {
  onNavigate: (path: string) => void;
  resources: Resource[];
}

const Home: React.FC<HomeProps> = ({ onNavigate, resources }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic Exam Settings
  const [exam1Title, setExam1Title] = useState('G.C.E. O/L Exam - 2024(2025)');
  const [exam1Date, setExam1Date] = useState('2025-05-01');

  const [exam2Title, setExam2Title] = useState('G.C.E. A/L Exam - 2024(2025)');
  const [exam2Date, setExam2Date] = useState('2025-01-28');

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('system_settings').select('*');
      if (data) {
        data.forEach(setting => {
          if (setting.key === 'EXAM_1_TITLE') setExam1Title(setting.value);
          if (setting.key === 'EXAM_1_DATE') setExam1Date(setting.value);
          if (setting.key === 'EXAM_2_TITLE') setExam2Title(setting.value);
          if (setting.key === 'EXAM_2_DATE') setExam2Date(setting.value);
        });
      }
    };
    fetchSettings();
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return resources.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.year?.toString().includes(q)
    ).slice(0, 6);
  }, [searchQuery, resources]);

  const daysLeft = (dateStr: string) => {
    return Math.max(0, Math.ceil((new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="space-y-32 animate-in fade-in duration-1000 pb-24">

      {/* Hero Section */}
      <section className="text-center pt-24 pb-12 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="inline-flex items-center gap-3 px-8 py-3 rounded-full glass-card mb-12 border-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-black uppercase tracking-[0.4em] shadow-lg">
            <Flame size={16} />
            <span>Sri Lanka's Professional Paper Repository</span>
          </div>

          <h1 className="font-display text-7xl md:text-[10rem] font-black tracking-tighter leading-[0.8] mb-12 text-slate-900 dark:text-white">
            Digital <br />
            <span className="text-shimmer">Archives.</span>
          </h1>

          <div className="flex flex-col items-center gap-4 mb-20">
            <p className="text-2xl md:text-3xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed font-bold tracking-tight">
              High-quality past papers and marking schemes for all examination cycles.
            </p>
            <p className="text-lg md:text-xl text-blue-600 dark:text-blue-500 font-medium tracking-wide">
              සියලුම විභාග ප්‍රශ්න පත්‍ර සහ පිළිතුරු පත්‍ර මෙතැනින් ලබාගන්න.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative max-w-4xl mx-auto group">
            <div className="absolute -inset-4 bg-blue-600/10 rounded-[4rem] blur-[100px] opacity-0 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative glass-card rounded-[3.5rem] p-4 shadow-3xl overflow-visible border-white/40 dark:border-white/5">
              <div className="flex items-center">
                <div className="flex-1 flex items-center pl-10">
                  <Search className="text-blue-600 mr-8" size={36} />
                  <input
                    type="text"
                    placeholder="Search Year, Grade, or Subject / වසර හෝ විෂය සොයන්න..."
                    className="bg-transparent border-none w-full py-8 text-2xl font-bold focus:ring-0 outline-none placeholder:text-slate-300 text-slate-900 dark:text-white tracking-tight"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-8 glass-card rounded-[3.5rem] p-8 shadow-3xl z-[100] animate-in slide-in-from-top-6 duration-500">
                  <div className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6 px-6 border-b border-white/5 pb-4">Direct Archive Access</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResults.map(res => (
                      <div
                        key={res.id}
                        onClick={() => onNavigate(`#/paper/${res.id}`)}
                        className="flex items-center justify-between p-6 hover:bg-blue-600 hover:text-white rounded-[2.5rem] cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-white shadow-inner">
                            <FileText size={24} />
                          </div>
                          <div className="text-left">
                            <h4 className="font-black text-lg group-hover:text-white leading-none mb-1">{res.title}</h4>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">{res.type} • {res.year}</span>
                          </div>
                        </div>
                        <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Grade Selector Section (MOVED TO TOP) */}
      <section className="px-4 max-w-[1500px] mx-auto space-y-16">
        <div className="flex flex-col md:flex-row items-end justify-between px-6 gap-6">
          <div className="text-left">
            <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.5em] block mb-4">Archives by Level</span>
            <h2 className="font-display text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Library Grade Catalog</h2>
          </div>
          <p className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-500 text-right opacity-80">ශ්‍රේණිය අනුව ප්‍රශ්න පත්‍ර තෝරන්න.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {GRADES.map((grade) => (
            <div
              key={grade.id}
              onClick={() => onNavigate(`#/grade/${grade.id}`)}
              className="group glass-card card-hover rounded-[3.5rem] p-12 h-[500px] relative overflow-hidden cursor-pointer flex flex-col items-center justify-between border-white/5 bg-white/40 dark:bg-slate-900/60 transition-all duration-700 hover:bg-slate-900 hover:dark:bg-blue-600 shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

              <div className="w-24 h-24 rounded-full bg-slate-100/50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 group-hover:bg-white/20 group-hover:text-white transition-all duration-700 shadow-inner relative z-10">
                <GraduationCap size={44} />
              </div>

              <div className="relative z-10 text-center space-y-4 w-full">
                <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 group-hover:text-white/80 uppercase tracking-[0.4em] block">{grade.id.toUpperCase()} MODULE</span>
                <p className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white group-hover:text-white transition-colors leading-tight tracking-tighter">
                  {grade.name}
                </p>
                <p className="text-xl font-bold text-slate-400 group-hover:text-white/70 transition-colors">
                  {grade.sinhalaName}
                </p>
              </div>

              <div className="relative z-10 w-full pt-8 flex items-center justify-center gap-3 text-slate-400 group-hover:text-white transition-all border-t border-slate-200 dark:border-white/5 group-hover:border-white/10">
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Browse Archive</span>
                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-500" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Exam Countdown Section */}
      <section className="px-4 max-w-6xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-10 rounded-[3rem] relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-2xl group">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-0 transition-all duration-700">
              <Timer size={140} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4 opacity-80">
                <CalendarClock size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Upcoming Exam</span>
              </div>
              <h3 className="text-3xl font-black mb-1 tracking-tighter">{exam1Title}</h3>
              <p className="text-indigo-100 font-bold text-sm mb-8">Scheduled: {exam1Date}</p>
              <div className="flex gap-4">
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 min-w-[80px] text-center">
                  <span className="block text-4xl font-black tracking-tighter">
                    {daysLeft(exam1Date)}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-80">Days Left</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-10 rounded-[3rem] relative overflow-hidden bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-2xl group">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-0 transition-all duration-700">
              <Timer size={140} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4 opacity-80">
                <CalendarClock size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Upcoming Exam</span>
              </div>
              <h3 className="text-3xl font-black mb-1 tracking-tighter">{exam2Title}</h3>
              <p className="text-rose-100 font-bold text-sm mb-8">Scheduled: {exam2Date}</p>
              <div className="flex gap-4">
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 min-w-[80px] text-center">
                  <span className="block text-4xl font-black tracking-tighter">
                    {daysLeft(exam2Date)}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-80">Days Left</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Added Section */}
      <section className="px-4 max-w-6xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-8">
        <div className="flex items-center justify-between px-6 mb-8">
          <h3 className="text-xl font-black uppercase tracking-widest text-slate-400">Recently Added</h3>
          <span className="text-blue-500 font-bold text-[10px] uppercase tracking-widest bg-blue-500/10 px-4 py-2 rounded-full">New Arrivals</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.slice(0, 4).map(res => (
            <div
              key={res.id}
              onClick={() => onNavigate(`#/paper/${res.id}`)}
              className="flex items-center justify-between p-6 bg-white dark:bg-white/5 hover:bg-blue-600 hover:text-white rounded-[2.5rem] cursor-pointer transition-all group border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl"
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-white shadow-inner">
                  <FileText size={24} />
                </div>
                <div className="text-left">
                  <h4 className="font-black text-lg text-slate-900 dark:text-white group-hover:text-white leading-none mb-1 line-clamp-1">{res.title}</h4>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-50">{res.type} • {res.year}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Student Toolkit Section */}
      <section className="px-4 max-w-6xl mx-auto mb-20">
        <div className="flex items-center gap-4 mb-8 px-4 opacity-50">
          <BookOpen size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Student Toolkit</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: 'Syllabuses', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { title: 'Teachers\' Guides', icon: GraduationCap, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { title: 'Model Papers', icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10' },
            { title: 'Time Tables', icon: Calendar, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          ].map((item, i) => (
            <div key={i} className="glass-card p-6 rounded-[2rem] flex flex-col items-center text-center gap-4 hover:scale-105 transition-all cursor-pointer group">
              <div className={`w-14 h-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center`}>
                <item.icon size={24} />
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">{item.title}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* Daily Motivation */}
      <section className="px-4 max-w-4xl mx-auto mb-32">
        <div className="glass-card rounded-[3rem] p-12 text-center relative overflow-hidden bg-slate-900 text-white">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-400 animate-pulse">
              <Lightbulb size={32} />
            </div>
            <h3 className="font-display text-3xl md:text-5xl font-black tracking-tighter mb-6 leading-tight">
              "Education is the passport to the future, for tomorrow belongs to those who prepare for it today."
            </h3>
            <p className="font-mono text-slate-400 text-xs uppercase tracking-widest">— Malcolm X</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/5 pt-20">
        <div className="max-w-6xl mx-auto px-6 mb-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <Flame size={20} />
            </div>
            <span className="font-display font-black text-2xl tracking-tighter text-slate-900 dark:text-white">TRAG.edu</span>
          </div>
          <div className="flex gap-8 text-slate-500 font-bold text-xs uppercase tracking-widest">
            <span className="cursor-pointer hover:text-blue-500 transition-colors">Home</span>
            <span className="cursor-pointer hover:text-blue-500 transition-colors">About</span>
            <span className="cursor-pointer hover:text-blue-500 transition-colors">Contact</span>
            <span className="cursor-pointer hover:text-blue-500 transition-colors">Privacy</span>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all cursor-pointer">
              <Twitter size={18} />
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all cursor-pointer">
              <Facebook size={18} />
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all cursor-pointer">
              <Instagram size={18} />
            </div>
          </div>
        </div>
        <div className="text-center pb-8 opacity-40">
          <p className="text-[10px] font-bold uppercase tracking-widest">© 2024 TRAG.edu Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
