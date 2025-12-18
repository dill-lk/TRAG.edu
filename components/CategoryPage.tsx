
import React from 'react';
import { useParams } from 'react-router-dom'; // Mock usage, actually passing ID via props in main switch
import { SUBJECTS, EXAM_CATEGORIES } from '../constants';
import { Book, ChevronRight, GraduationCap } from 'lucide-react';
import { Subject, ExamCategory } from '../types';

interface CategoryPageProps {
  categoryId: string;
  onNavigate: (path: string) => void;
}

const CategoryPage: React.FC<CategoryPageProps> = ({ categoryId, onNavigate }) => {
  const categoryInfo = EXAM_CATEGORIES.find(c => c.id === categoryId);
  const examCat = categoryInfo?.name;

  // Filter subjects based on category string matching
  // Note: Simple matching logic for the mock
  const subjects = SUBJECTS.filter(s => {
      if (categoryId === 'al') return s.category === ExamCategory.AL;
      if (categoryId === 'ol') return s.category === ExamCategory.OL;
      if (categoryId === 'gr5') return s.category === ExamCategory.SCHOLARSHIP;
      return false;
  });

  if (!categoryInfo) return <div className="p-8 text-center">Category not found</div>;

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <span className="cursor-pointer hover:text-blue-600" onClick={() => onNavigate('#/')}>Home</span>
        <ChevronRight size={14} />
        <span className="text-slate-800 font-medium">{categoryInfo.name}</span>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar / Filter (Mock) */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white border border-slate-200 rounded-xl p-6 sticky top-24">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <GraduationCap size={20} className="text-blue-600"/> Streams
            </h3>
            <ul className="space-y-3 text-sm">
                {/* Mock streams for A/L */}
                {categoryId === 'al' && (
                    <>
                    <li className="text-blue-600 font-medium cursor-pointer">Science Stream</li>
                    <li className="text-slate-600 hover:text-blue-600 cursor-pointer">Commerce Stream</li>
                    <li className="text-slate-600 hover:text-blue-600 cursor-pointer">Arts Stream</li>
                    <li className="text-slate-600 hover:text-blue-600 cursor-pointer">Technology Stream</li>
                    </>
                )}
                 {categoryId !== 'al' && (
                    <li className="text-blue-600 font-medium cursor-pointer">General Subjects</li>
                )}
            </ul>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-8 mb-8">
            <h1 className="text-3xl font-bold text-blue-900 mb-2">{categoryInfo.name}</h1>
            <p className="text-blue-700/80">Select a subject below to browse past papers, marking schemes, and notes.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.length > 0 ? subjects.map((subject) => (
              <div 
                key={subject.id}
                onClick={() => onNavigate(`#/subject/${subject.id}`)} // In a real app, this goes to subject page list
                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Book size={20} />
                </div>
                <span className="font-semibold text-slate-700 group-hover:text-slate-900">{subject.name}</span>
              </div>
            )) : (
                <div className="col-span-3 text-center py-12 text-slate-400">
                    No subjects loaded for this category in mock data.
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
