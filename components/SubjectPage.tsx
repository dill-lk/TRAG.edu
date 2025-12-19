import React, { useState, useMemo } from 'react';
import { GRADES, SUBJECTS } from '../constants';
import {
    ArrowLeft, FileText, ChevronRight, Layers, Bookmark,
    Book, Target, Loader2
} from 'lucide-react';
import { Resource } from '../types';

interface SubjectPageProps {
    gradeId: string;
    subjectId: string;
    onNavigate: (path: string) => void;
    resources: Resource[];
}

const SubjectPage: React.FC<SubjectPageProps> = ({ gradeId, subjectId, onNavigate, resources: allResources }) => {
    const [activeTab, setActiveTab] = useState<'papers' | 'notes' | 'help'>('papers');

    const grade = GRADES.find(g => g.id === gradeId);
    const subject = SUBJECTS.find(s => s.id === subjectId);

    const subjectResources = useMemo(() => {
        return allResources.filter(r => r.gradeId === gradeId && r.subjectId === subjectId);
    }, [allResources, gradeId, subjectId]);

    const papers = subjectResources.filter(r => r.type === 'Term Test' || r.type === 'Past Paper');
    const notes = subjectResources.filter(r => r.type === 'Short Note' || r.type === 'Syllabus' || r.type === 'Teachers Guide');

    if (!grade || !subject) {
        return (
            <div className="text-center pt-20">
                <h2 className="text-2xl font-bold text-slate-400">Subject Not Found</h2>
                <button onClick={() => onNavigate(`#/grade/${gradeId}`)} className="text-blue-500 mt-4 font-bold uppercase tracking-widest text-[10px] hover:underline">Back to Grades</button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pt-4 md:pt-10 animate-in fade-in duration-700 pb-32 px-0 md:px-6">

            {/* Simple Header */}
            <div className="mb-8 md:mb-12 px-4 md:px-0">
                <button
                    onClick={() => onNavigate(`#/grade/${gradeId}`)}
                    className="flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-all mb-6 md:mb-8 font-bold text-[10px] uppercase tracking-widest"
                >
                    <ArrowLeft size={16} /> Back
                </button>

                <div className="light-gradient-card p-8 md:p-14 rounded-none md:rounded-[3rem] relative overflow-hidden shadow-xl border-none">
                    <div className="absolute top-0 right-0 p-12 text-blue-500/5 pointer-events-none">
                        <Target size={200} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-md">
                                {grade.name}
                            </span>
                            <span className="px-4 py-1.5 glass-card rounded-xl text-[9px] font-bold uppercase tracking-widest text-slate-400 border-none">
                                {subjectResources.length} Resources
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-4 leading-none tracking-tighter">
                            {subject.name.split('/')[0]}
                        </h1>
                        <p className="text-2xl text-blue-600 dark:text-blue-400 font-bold tracking-tight">
                            {subject.sinhalaName}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex p-1.5 bg-blue-900/10 dark:bg-white/5 rounded-2xl mb-10 w-fit mx-auto md:mx-0 shadow-inner">
                <button
                    onClick={() => setActiveTab('papers')}
                    className={`flex items-center gap-2 px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'papers' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-950'}`}
                >
                    <Layers size={16} /> Papers
                </button>
                <button
                    onClick={() => setActiveTab('notes')}
                    className={`flex items-center gap-2 px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'notes' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-950'}`}
                >
                    <Bookmark size={16} /> Study Assets
                </button>
                <button
                    onClick={() => setActiveTab('help')}
                    className={`flex items-center gap-2 px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'help' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}
                >
                    <Book size={16} /> Helper
                </button>
            </div>

            {/* List Content */}
            <div className="space-y-4">
                {activeTab === 'help' ? (
                    <div className="glass-card rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 text-center space-y-6 animate-in zoom-in-95 duration-500 border-none mx-4 md:mx-0 bg-white/40 dark:bg-slate-900/40">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-500/10 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                            <Book size={32} className="md:w-9 md:h-9" />
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Academic Helper</h3>
                        <p className="text-slate-500 max-w-lg mx-auto text-base md:text-lg font-medium tracking-tight">
                            Consult our Library Helper to create a clear study schedule or explain difficult topics for <span className="text-blue-600 font-bold">{subject.name}</span>.
                        </p>
                        <button
                            onClick={() => (document.querySelector('button[aria-label="Ask AI Helper"]') as HTMLElement)?.click()}
                            className="w-full md:w-auto px-10 py-5 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-105 transition-all"
                        >
                            Talk to Helper
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Function to render a grouped section */
                            ['English', 'Sinhala', 'Tamil'].map(medium => {
                                const mediumPapers = papers.filter(p => p.medium === medium);
                                if (mediumPapers.length === 0) return null;

                                // Group by Term/Type
                                const pastPapers = mediumPapers.filter(p => p.type === 'Past Paper' || p.type === 'Model Paper');
                                const term1 = mediumPapers.filter(p => p.term === '1st Term');
                                const term2 = mediumPapers.filter(p => p.term === '2nd Term');
                                const term3 = mediumPapers.filter(p => p.term === '3rd Term');

                                return (
                                    <div key={medium} className="mb-12 animate-in fade-in slide-in-from-bottom-4">
                                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                            <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                                            {medium} Medium
                                        </h2>

                                        <div className="space-y-8 pl-0 md:pl-4 border-l-2 border-slate-100 dark:border-white/5 ml-1">
                                            {pastPapers.length > 0 && (
                                                <div>
                                                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 pl-4">Past & Model Papers</h3>
                                                    <div className="grid grid-cols-1 gap-4">
                                                        {pastPapers.map((item, idx) => (
                                                            <ResourceCard key={item.id} item={item} idx={idx} onClick={() => onNavigate(`#/paper/${item.id}`)} />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Term Groups */}
                                            {[term1, term2, term3].map((group, i) => group.length > 0 && (
                                                <div key={i}>
                                                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 pl-4">{i + 1}{i === 0 ? 'st' : i === 1 ? 'nd' : 'rd'} Term Papers</h3>
                                                    <div className="grid grid-cols-1 gap-4">
                                                        {group.map((item, idx) => (
                                                            <ResourceCard key={item.id} item={item} idx={idx} onClick={() => onNavigate(`#/paper/${item.id}`)} />
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                        {/* Render Notes (Unchanged for now, just flat list or similar grouping if desired) */}
                        {activeTab === 'notes' && (
                            <div className="grid grid-cols-1 gap-4">
                                {notes.map((item, idx) => (
                                    <ResourceCard key={item.id} item={item} idx={idx} isNote onClick={() => onNavigate(`#/paper/${item.id}`)} />
                                ))}
                            </div>
                        )}

                        {(activeTab === 'papers' ? papers : notes).length === 0 && (
                            <div className="text-center py-24 glass-card rounded-[2.5rem] border-dashed border-2 border-slate-100 dark:border-white/5">
                                <Loader2 className="animate-spin text-slate-200 mx-auto mb-4" size={40} />
                                <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Searching library records...</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// Helper Component for consistency
const ResourceCard = ({ item, idx, onClick, isNote = false }: any) => (
    <div
        onClick={onClick}
        className="group light-gradient-card rounded-none md:rounded-[2rem] p-5 md:p-6 cursor-pointer flex items-center gap-4 md:gap-6 relative overflow-hidden hover:-translate-y-2 transition-all duration-500"
        style={{ animationDelay: `${idx * 80}ms` }}
    >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all ${!isNote ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'}`}>
            <FileText size={24} />
        </div>

        <div className="flex-grow">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-[8px] font-bold uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full text-slate-500">{item.year}</span>
                <span className={`text-[8px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${!isNote ? 'bg-blue-500/5 text-blue-600' : 'bg-emerald-500/10 text-emerald-600'}`}>{item.type}</span>
                {item.term && <span className="text-[8px] font-bold uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full text-slate-500">{item.term}</span>}
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-xl group-hover:text-blue-600 transition-colors leading-tight">{item.title}</h3>
            <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">{item.medium} Medium</p>
        </div>

        <div className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-slate-300 group-hover:text-blue-500 transition-all border-none">
            <ChevronRight size={20} />
        </div>
    </div>
);

export default SubjectPage;