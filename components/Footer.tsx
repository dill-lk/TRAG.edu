
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
              Trag.edu is Sri Lanka's largest free education library for past papers, marking schemes, and study resources.
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
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Instagram size={20} /></a>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Mail size={16} />
              <span>support@trag.edu.lk</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-xs text-slate-500 flex flex-col items-center gap-4">
          <p>&copy; {new Date().getFullYear()} Trag.edu. All rights reserved. Content is gathered from public sources for educational purposes.</p>
          
          {/* Subtle Pro Admin Access */}
          <a 
            href="#/admin" 
            className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.4em] text-slate-700 hover:text-blue-500 transition-all group"
          >
            <ShieldCheck size={12} className="opacity-30 group-hover:opacity-100" />
            Grade Advanced Admin Panel
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
