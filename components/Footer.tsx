
import React from 'react';
import { Facebook, Twitter, Instagram, Mail, ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800 mt-auto">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <span className="text-xl font-bold text-white tracking-tight mb-4 block">Trag<span className="text-blue-500">.edu</span></span>
            <p className="text-sm text-slate-400 leading-relaxed">
              TRAG.edu is Sri Lanka's largest free education library for past papers, marking schemes, and study resources.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Exam Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#/grade/al" className="hover:text-white transition-colors">G.C.E. Advanced Level</a></li>
              <li><a href="#/grade/ol" className="hover:text-white transition-colors">G.C.E. Ordinary Level</a></li>
              <li><a href="#/grade/gr5" className="hover:text-white transition-colors">Grade 5 Scholarship</a></li>
              <li><a href="#/" className="hover:text-white transition-colors">Other Grades</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Syllabus</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Teachers' Guides</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Model Papers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Provincial Papers</a></li>
            </ul>
          </div>

          {/* Social / Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Connect With Us</h4>
            <div className="flex space-x-4 mb-6">
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors"><Facebook size={20} /></a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors"><Twitter size={20} /></a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors"><Instagram size={20} /></a>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Mail size={16} />
              <span>support@trag.edu.lk</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="text-left">
            <p className="text-xs text-slate-500 font-medium">&copy; {new Date().getFullYear()} TRAG.edu. All rights reserved.</p>
            <p className="text-[10px] text-slate-600 mt-1">Digital Paper Library for Sri Lanka.</p>
          </div>

          {/* Developer Credit - High Impact Design */}
          <div className="py-10">
            <a 
              href="https://dill.is-a.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex flex-col items-center transition-all duration-500"
            >
              <div className="relative mb-6">
                {/* Background Glow */}
                <div className="absolute -inset-6 bg-blue-600/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <img 
                  src="/dev-assets/developer-zen-white.svg" 
                  alt="Zen Technologies" 
                  className="h-40 w-auto relative z-10 opacity-90 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110 drop-shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                />
              </div>
              <div className="flex flex-col items-center gap-2 relative z-10">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 group-hover:text-blue-400 transition-colors">Developed By</span>
                <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-slate-400 tracking-tighter group-hover:from-blue-400 group-hover:to-white transition-all duration-500 shadow-sm">
                  Zen Technologies
                </span>
              </div>
            </a>
          </div>

          {/* Visual Pro Admin Access */}
          <div className="flex flex-col items-center md:items-end gap-3">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-700">Internal Systems</span>
            <a
              href="#/admin"
              className="flex items-center gap-4 px-8 py-4 rounded-[1.8rem] bg-slate-950 text-white hover:bg-blue-600 transition-all group shadow-2xl border border-white/5"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <ShieldCheck size={20} className="text-blue-500 group-hover:text-white" />
              </div>
              <div className="flex flex-col items-start leading-tight">
                <span className="text-[11px] font-black uppercase tracking-widest">Admin Panel</span>
                <span className="text-[9px] font-bold text-slate-500 group-hover:text-blue-200 uppercase tracking-widest">Control Center</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
