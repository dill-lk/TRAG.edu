
import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { GRADES, SUBJECTS_6_TO_9, SUBJECTS_10_TO_11, SUBJECTS_AL, SUBJECTS_SCOUT } from '../constants';
import { Home as HomeIcon, GraduationCap, LayoutGrid, BookOpen, ArrowRight } from 'lucide-react';
import { Subject, Resource } from '../types';

interface GradePageProps {
  gradeId: string;
  onNavigate: (path: string) => void;
  resources: Resource[];
}

const GradePage: React.FC<GradePageProps> = ({ gradeId, onNavigate, resources }) => {
  const grade = GRADES.find(g => g.id === gradeId);

  const targetSubjects: Subject[] = useMemo(() => {
    if (gradeId === 'al') return SUBJECTS_AL;
    if (gradeId === 'scout') return SUBJECTS_SCOUT;
    if (['gr10', 'gr11', 'ol'].includes(gradeId)) return SUBJECTS_10_TO_11;
    return SUBJECTS_6_TO_9;
  }, [gradeId]);

  const groupOrder = [
    '📘 Main Subjects',
    '🙏 Religion',
    '📙 Language & Literature',
    '📝 Category I',
    '📝 Category II',
    '📝 Category III',
    '🧪 Physical Science',
    '🧬 Biological Science',
    '💻 Technology',
    '📈 Commerce',
    '⚜️ Scout Badges'
  ];

  const groupedSubjects: Record<string, Subject[]> = {};
  targetSubjects.forEach(sub => {
    if (!groupedSubjects[sub.group]) groupedSubjects[sub.group] = [];
    groupedSubjects[sub.group].push(sub);
  });

  if (!grade) return <div className="p-32 text-center text-slate-400 font-black tracking-widest uppercase">Grade Module Not Found</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-16 md:space-y-32 animate-in fade-in slide-in-from-bottom-12 duration-1000 pb-32 px-0 md:px-6 overflow-x-hidden">
      <Helmet>
        <title>{grade.name} Past Papers ({grade.sinhalaName}) | TRAG.edu</title>
        <meta name="description" content={`Download ${grade.name} past papers, model papers, and notes for all subjects. Available in Sinhala, Tamil, and English mediums.`} />
        <meta name="keywords" content={`${grade.name}, ${grade.sinhalaName}, Sri Lanka, Past Papers, Exam`} />
      </Helmet>

      {/* Premium Header */}
      <div className="text-center pt-8 md:pt-24 relative px-4">
        <div className="inline-flex items-center gap-2 md:gap-3 px-6 md:px-8 py-2 md:py-3 rounded-full glass-card border-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] mb-8 md:mb-12 shadow-xl">
          <GraduationCap size={16} className="md:w-5 md:h-5" /> Professional Academic Archive
        </div>
        <h1 className="text-5xl md:text-[8rem] font-black text-slate-900 dark:text-white tracking-tighter mb-4 leading-none">{grade.name}</h1>
        <p className="text-2xl md:text-5xl text-blue-600 dark:text-blue-500 font-bold tracking-tight opacity-90">{grade.sinhalaName}</p>
      </div>

      {/* Subjects Categories Matrix */}
      <div className="space-y-24 md:space-y-40">
        {groupOrder.map((group) => {
          const subjects = groupedSubjects[group];
          if (!subjects || subjects.length === 0) return null;

          return (
            <div key={group} className="space-y-8 md:space-y-20">
              <div className="flex flex-col md:flex-row items-center md:items-baseline gap-4 md:gap-6 px-4 md:px-2">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-[1.8rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-2xl">
                    <LayoutGrid size={22} className="md:w-8 md:h-8" />
                  </div>
                  <h2 className="text-2xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">{group}</h2>
                </div>
                <div className="h-1 flex-grow bg-slate-100 dark:bg-white/5 rounded-full hidden md:block"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-10">
                {subjects.map(subject => {
                  const count = resources.filter(r => r.gradeId === gradeId && r.subjectId === subject.id).length;
                  return (
                    <div
                      key={subject.id}
                      onClick={() => onNavigate(`#/subject/${gradeId}/${subject.id}`)}
                      className="
                                group light-gradient-card p-8 md:p-12
                                rounded-none md:rounded-[4.5rem] cursor-pointer flex flex-col justify-between min-h-[300px] md:min-h-[440px] relative overflow-hidden border-none md:border-white/5 md:shadow-sm
                            "
                    >
                      <div className="absolute top-0 right-0 p-10 md:p-12 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[1.8rem] bg-blue-600 text-white flex items-center justify-center shadow-2xl">
                          <ArrowRight size={24} className="md:w-7 md:h-7" />
                        </div>
                      </div>

                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] bg-blue-900/10 dark:bg-slate-800 flex items-center justify-center text-blue-600/40 group-hover:bg-blue-600 group-hover:text-white transition-all duration-700 shadow-inner mb-8 md:mb-12">
                        <BookOpen size={28} className="md:w-9 md:h-9" />
                      </div>

                      <div className="space-y-4 md:space-y-6">
                        <div className="space-y-2 md:space-y-3">
                          <h3 className="font-black text-slate-900 dark:text-white text-2xl md:text-4xl leading-tight group-hover:text-blue-600 transition-colors tracking-tight">
                            {subject.name}
                          </h3>
                          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-2xl md:text-4xl leading-tight group-hover:text-blue-500 transition-colors tracking-tight">
                            {subject.sinhalaName}
                          </h3>
                          {subject.tamilName && (
                            <h3 className="font-medium text-slate-400 dark:text-slate-500 text-2xl md:text-3xl leading-tight group-hover:text-blue-400 transition-colors tracking-tight">
                              {subject.tamilName}
                            </h3>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-4 md:pt-6 border-t border-slate-100 dark:border-white/5">
                          <p className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">{count} Documents</p>
                          <span className="text-[9px] md:text-[10px] font-black text-blue-500 uppercase tracking-widest group-hover:underline">Explore</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Hub */}
      <div className="pt-20 flex flex-col items-center gap-8">
        <button
          onClick={() => onNavigate('#/')}
          className="flex items-center gap-4 md:gap-6 px-12 md:px-20 py-6 md:py-10 bg-blue-600 text-white rounded-[2.5rem] md:rounded-[3rem] font-black text-xs md:text-sm uppercase tracking-[0.4em] hover:scale-105 active:scale-95 transition-all shadow-3xl shadow-blue-500/30 border-none"
        >
          <HomeIcon size={24} className="md:w-7 md:h-7" />
          🏠 BACK TO HOME
        </button>
      </div>
    </div>
  );
};

export default GradePage;
