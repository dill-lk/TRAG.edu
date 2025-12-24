import React, { useState, useEffect, useMemo } from 'react';
import {
    Plus, Search, Filter, BookOpen, Download,
    User, CheckCircle, Upload, Loader2, X, FileUp
} from 'lucide-react';
import { GRADES, SUBJECTS } from '../constants';
import { supabase } from '../supabase';

interface PeerNote {
    id: string;
    title: string;
    author: string;
    grade_id: string;
    subject_id: string;
    file_url: string;
    is_verified: boolean;
    created_at: string;
}

const NotesMarketplace: React.FC = () => {
    const [notes, setNotes] = useState<PeerNote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    // States for filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGrade, setFilterGrade] = useState('');
    const [filterSubject, setFilterSubject] = useState('');

    // States for upload form
    const [newTitle, setNewTitle] = useState('');
    const [newAuthor, setNewAuthor] = useState('');
    const [newGrade, setNewGrade] = useState('');
    const [newSubject, setNewSubject] = useState('');
    const [newFile, setNewFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('peer_notes')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setNotes(data);
        }
        setIsLoading(false);
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFile || !newTitle || !newAuthor || !newGrade || !newSubject) {
            alert('Please fill all fields and select a PDF');
            return;
        }

        setIsUploading(true);
        try {
            const fileName = `peer_notes/${Date.now()}-${newFile.name.replace(/\s/g, '_')}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('peer_notes')
                .upload(fileName, newFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('peer_notes').getPublicUrl(fileName);

            const { error: dbError } = await supabase.from('peer_notes').insert([{
                title: newTitle,
                author: newAuthor,
                grade_id: newGrade,
                subject_id: newSubject,
                file_url: publicUrl
            }]);

            if (dbError) throw dbError;

            setIsUploadOpen(false);
            setNewTitle('');
            setNewAuthor('');
            setNewFile(null);
            fetchNotes();
            alert('Note uploaded successfully! It will be visible to all students.');
        } catch (err: any) {
            alert('Upload failed: ' + err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const filteredNotes = useMemo(() => {
        return notes.filter(n => {
            const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || n.author.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesGrade = filterGrade ? n.grade_id === filterGrade : true;
            const matchesSubject = filterSubject ? n.subject_id === filterSubject : true;
            return matchesSearch && matchesGrade && matchesSubject;
        });
    }, [notes, searchTerm, filterGrade, filterSubject]);

    return (
        <div className="animate-in fade-in duration-700">
            {/* Hero Header */}
            <div className="relative mb-16 p-12 md:p-20 rounded-[4rem] overflow-hidden bg-slate-900 group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 group-hover:scale-110 transition-transform duration-1000"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="text-center md:text-left">
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6">Notes Marketplace</h1>
                        <p className="text-slate-400 text-lg md:text-xl max-w-xl font-medium leading-relaxed">Browse, share, and learn from top student study guides and short notes.</p>
                    </div>
                    <button
                        onClick={() => setIsUploadOpen(true)}
                        className="group/btn relative px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-105 active:scale-95 overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            <Plus size={20} /> Share Your Notes
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 p-4 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md rounded-[2.5rem] border border-white/20">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search notes or authors..."
                        className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white dark:bg-slate-900 border-none shadow-sm font-bold text-slate-800 dark:text-white outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <select
                        className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-slate-900 border-none shadow-sm font-bold text-slate-800 dark:text-white outline-none cursor-pointer appearance-none"
                        value={filterGrade}
                        onChange={e => setFilterGrade(e.target.value)}
                    >
                        <option value="">All Grades</option>
                        {GRADES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                    <Filter className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
                <div className="relative">
                    <select
                        className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-slate-900 border-none shadow-sm font-bold text-slate-800 dark:text-white outline-none cursor-pointer appearance-none"
                        value={filterSubject}
                        onChange={e => setFilterSubject(e.target.value)}
                    >
                        <option value="">All Subjects</option>
                        {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <Filter className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="py-40 text-center opacity-50 font-black uppercase tracking-widest text-sm flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Syncing Market...
                </div>
            ) : filteredNotes.length === 0 ? (
                <div className="py-40 text-center bg-white/20 dark:bg-white/5 rounded-[4rem] border-2 border-dashed border-slate-200 dark:border-white/10">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-300">
                        <BookOpen size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-500 mb-2">No notes found</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Be the first to share your hard work!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredNotes.map(note => (
                        <div key={note.id} className="glass-card group p-8 rounded-[3rem] hover:border-blue-500/50 transition-all duration-500 flex flex-col h-full bg-white dark:bg-slate-900/40">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <BookOpen size={28} />
                                </div>
                                {note.is_verified && (
                                    <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                                        <CheckCircle size={10} /> Verified Note
                                    </div>
                                )}
                            </div>

                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-blue-500 transition-colors">{note.title}</h3>

                            <div className="flex items-center gap-2 mb-8 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                <User size={12} /> {note.author}
                            </div>

                            <div className="mt-auto space-y-6">
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-lg text-[9px] font-bold text-slate-500">{note.grade_id.toUpperCase()}</span>
                                    <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-lg text-[9px] font-bold text-slate-500">{note.subject_id}</span>
                                </div>

                                <a
                                    href={note.file_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-center gap-3 w-full py-4 bg-slate-100 dark:bg-white/5 dark:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white dark:hover:bg-blue-600 transition-all"
                                >
                                    <Download size={16} /> Download PDF
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            {isUploadOpen && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in">
                    <div onClick={() => !isUploading && setIsUploadOpen(false)} className="absolute inset-0" />
                    <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 md:p-14 shadow-3xl animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setIsUploadOpen(false)}
                            className="absolute top-8 right-8 w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">Share Note</h2>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-10">Upload your study guide for the community</p>

                        <form onSubmit={handleUpload} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Title</label>
                                    <input required placeholder="e.g. Science Quick Revision" className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 dark:text-white border-none font-bold" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Your Name</label>
                                    <input required placeholder="Your display name" className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 dark:text-white border-none font-bold" value={newAuthor} onChange={e => setNewAuthor(e.target.value)} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Grade</label>
                                    <select required className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 font-bold outline-none cursor-pointer" value={newGrade} onChange={e => setNewGrade(e.target.value)}>
                                        <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Select Grade</option>
                                        {GRADES.map(g => <option key={g.id} value={g.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{g.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Subject</label>
                                    <select required className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 font-bold outline-none cursor-pointer" value={newSubject} onChange={e => setNewSubject(e.target.value)}>
                                        <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Select Subject</option>
                                        {SUBJECTS.map(s => <option key={s.id} value={s.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{s.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Select PDF</label>
                                <div className="relative group overflow-hidden bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-blue-600 rounded-3xl p-12 text-center transition-all cursor-pointer">
                                    <input type="file" accept=".pdf" required onChange={e => e.target.files && setNewFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                                    <div className="relative z-10 pointer-events-none">
                                        <FileUp size={32} className="mx-auto mb-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                        <p className="font-bold text-slate-600 dark:text-slate-300">{newFile ? newFile.name : 'Click to select PDF or Drag & Drop'}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                disabled={isUploading}
                                className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 shadow-xl transition-all flex items-center justify-center gap-3"
                            >
                                {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                                {isUploading ? 'Uploading Note...' : 'Publish to Marketplace'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotesMarketplace;
