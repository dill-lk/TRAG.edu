import React, { useState, useEffect, useMemo } from 'react';
import {
    Lock, Upload, CheckCircle, FileUp, Loader2,
    AlertCircle, Database, Trash2, Globe, Layout,
    FileText, ShieldAlert, Info, Activity, List,
    Search, Filter, BarChart3, PieChart, TrendingUp
} from 'lucide-react';
import { GRADES, SUBJECTS } from '../constants';
import { supabase } from '../supabase';
import { Resource } from '../types';

const AdminPanel = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorStatus, setErrorStatus] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'upload' | 'fleet'>('upload');
    const [fleet, setFleet] = useState<Resource[]>([]);

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGrade, setFilterGrade] = useState('');
    const [filterSubject, setFilterSubject] = useState('');

    // Form State
    const [title, setTitle] = useState('');
    const [grade, setGrade] = useState('');
    const [subject, setSubject] = useState('');
    const [type, setType] = useState('Past Paper');
    const [medium, setMedium] = useState('English');
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            fetchFleet();
        }
    }, [isAuthenticated]);

    const fetchFleet = async () => {
        const { data, error } = await supabase.from('resources').select('*').order('created_at', { ascending: false });
        if (!error) setFleet(data.map((r: any) => ({
            id: r.id,
            title: r.title,
            type: r.type,
            gradeId: r.grade_id,
            subjectId: r.subject_id,
            year: r.year,
            medium: r.medium,
            file_url: r.file_url
        })));
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'admin123') setIsAuthenticated(true);
        else alert('Access Denied: Invalid Key');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this resource?')) return;
        const { error } = await supabase.from('resources').delete().eq('id', id);
        if (!error) fetchFleet();
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorStatus(null);
        if (!file || !title || !grade || !subject) {
            alert('Please fill in all fields.');
            return;
        }

        setIsUploading(true);
        try {
            const fileName = `${grade}/${subject}/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('papers')
                .upload(fileName, file, { cacheControl: '3600', upsert: false });

            if (uploadError) {
                if (uploadError.message.includes('bucket not found')) {
                    throw new Error("Storage Error: The 'papers' folder was not found in Supabase.");
                }
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage.from('papers').getPublicUrl(fileName);

            const { error: dbError } = await supabase.from('resources').insert([{
                title, grade_id: grade, subject_id: subject, type, medium, year: parseInt(year), file_url: publicUrl
            }]);

            if (dbError) throw dbError;

            setShowSuccess(true);
            fetchFleet(); // Refresh stats immediately
            setTimeout(() => {
                setShowSuccess(false);
                setTitle('');
                setFile(null);
            }, 3000);

        } catch (err: any) {
            console.error(err);
            setErrorStatus(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    // Computed Stats
    const stats = useMemo(() => {
        return {
            total: fleet.length,
            subjects: new Set(fleet.map(f => f.subjectId)).size,
            recent: fleet.filter(f => f.year === new Date().getFullYear().toString()).length
        };
    }, [fleet]);

    // Filtered List
    const filteredFleet = useMemo(() => {
        return fleet.filter(r => {
            const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesGrade = filterGrade ? r.gradeId === filterGrade : true;
            const matchesSubject = filterSubject ? r.subjectId === filterSubject : true;
            return matchesSearch && matchesGrade && matchesSubject;
        });
    }, [fleet, searchTerm, filterGrade, filterSubject]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-4">
                <div className="w-full max-w-sm glass-card p-12 rounded-[3.5rem] shadow-3xl text-center border-white/20 dark:bg-slate-950/80">
                    <div className="w-20 h-20 bg-blue-600/10 rounded-[1.8rem] flex items-center justify-center mx-auto mb-10 text-blue-500 shadow-inner">
                        <Lock size={36} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">Admin Login</h1>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-10">Access restricted to staff</p>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <input
                            type="password"
                            autoFocus
                            placeholder="Enter Admin Password"
                            className="w-full px-8 py-5 rounded-2xl bg-slate-50 dark:bg-white/5 dark:text-white border-none shadow-inner text-center font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        <button className="w-full py-5 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 shadow-xl transition-all">Login</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-10 px-4">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xl">
                        <Layout size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">TRAG.edu Control</h1>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Advanced Resource Management</p>
                    </div>
                </div>

                <button onClick={() => setIsAuthenticated(false)} className="px-8 py-3 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                    Logout System
                </button>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="glass-card p-8 rounded-[2.5rem] border-white/20 dark:bg-slate-950/40 relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4 text-slate-400">
                            <Database size={20} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Total Resources</span>
                        </div>
                        <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.total}</h3>
                    </div>
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-500/10 rounded-full group-hover:scale-110 transition-transform" />
                </div>

                <div className="glass-card p-8 rounded-[2.5rem] border-white/20 dark:bg-slate-950/40 relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4 text-slate-400">
                            <PieChart size={20} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Active Subjects</span>
                        </div>
                        <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.subjects}</h3>
                    </div>
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full group-hover:scale-110 transition-transform" />
                </div>

                <div className="glass-card p-8 rounded-[2.5rem] border-white/20 dark:bg-slate-950/40 relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4 text-slate-400">
                            <TrendingUp size={20} />
                            <span className="text-[10px] font-black uppercase tracking-widest">New This Year</span>
                        </div>
                        <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.recent}</h3>
                    </div>
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-500/10 rounded-full group-hover:scale-110 transition-transform" />
                </div>
            </div>

            {/* Main Control Panel */}
            <div className="glass-card rounded-[3.5rem] p-8 md:p-12 shadow-3xl border-white/20 dark:bg-slate-950/40">

                {/* Tab Navigation */}
                <div className="flex justify-center mb-12">
                    <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl shadow-inner">
                        <button
                            onClick={() => setActiveTab('upload')}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'upload' ? 'bg-white dark:bg-slate-800 shadow-md text-blue-600' : 'text-slate-400'}`}
                        >
                            <Upload size={16} />
                            Upload New
                        </button>
                        <button
                            onClick={() => setActiveTab('fleet')}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'fleet' ? 'bg-white dark:bg-slate-800 shadow-md text-blue-600' : 'text-slate-400'}`}
                        >
                            <List size={16} />
                            Manage Fleet
                            <span className="bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 rounded-md text-[9px]">{fleet.length}</span>
                        </button>
                    </div>
                </div>

                {errorStatus && (
                    <div className="mb-10 p-8 bg-red-500/10 border border-red-500/20 rounded-3xl animate-in slide-in-from-top-4">
                        <div className="flex items-center gap-3 text-red-500 mb-2">
                            <AlertCircle size={20} />
                            <h3 className="font-bold text-sm">Error Occurred</h3>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 font-medium">{errorStatus}</p>
                    </div>
                )}

                {activeTab === 'fleet' ? (
                    <div className="space-y-8 animate-in fade-in">

                        {/* Search & Filter Bar */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-white/5">
                            <div className="relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by title..."
                                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white dark:bg-slate-800 border-none shadow-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="relative">
                                <select
                                    className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 border-none shadow-sm font-bold text-slate-800 dark:text-white outline-none cursor-pointer appearance-none"
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
                                    className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 border-none shadow-sm font-bold text-slate-800 dark:text-white outline-none cursor-pointer appearance-none"
                                    value={filterSubject}
                                    onChange={e => setFilterSubject(e.target.value)}
                                >
                                    <option value="">All Subjects</option>
                                    {Object.entries(SUBJECTS.reduce((acc, s) => {
                                        if (!acc[s.group]) acc[s.group] = [];
                                        acc[s.group].push(s);
                                        return acc;
                                    }, {} as Record<string, typeof SUBJECTS>)).map(([group, subs]) => (
                                        <optgroup key={group} label={group}>
                                            {subs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </optgroup>
                                    ))}
                                </select>
                                <Filter className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>
                        </div>

                        {filteredFleet.length === 0 ? (
                            <div className="text-center py-20 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/10">
                                <div className="w-16 h-16 bg-slate-200 dark:bg-white/10 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search size={32} />
                                </div>
                                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No resources found matching criteria</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {filteredFleet.map(r => (
                                    <div key={r.id} className="glass-card p-6 rounded-2xl flex items-center justify-between group hover:border-blue-500 transition-all">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                                                <FileText size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 dark:text-white">{r.title}</h4>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide">{r.gradeId}</span>
                                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide">{r.year}</span>
                                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide">{r.medium}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDelete(r.id)} className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : showSuccess ? (
                    <div className="py-32 text-center animate-in zoom-in">
                        <div className="w-24 h-24 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl">
                            <CheckCircle size={48} />
                        </div>
                        <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Upload Complete</h3>
                        <p className="text-slate-500 mt-4 text-lg font-medium">The paper is now available for students.</p>
                    </div>
                ) : (
                    <form onSubmit={handleUpload} className="space-y-10 animate-in fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6 md:col-span-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-blue-500 ml-2">Document Title</label>
                                <input
                                    type="text" required placeholder="e.g. GCE O/L Science 2024 Past Paper"
                                    className="w-full px-8 py-5 rounded-2xl bg-slate-100 dark:bg-white/5 dark:text-white border-none shadow-inner focus:ring-4 focus:ring-blue-500/10 font-bold text-lg"
                                    value={title} onChange={e => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-6">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Select Grade</label>
                                    <select
                                        className="w-full px-8 py-5 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 shadow-sm font-bold outline-none cursor-pointer"
                                        value={grade} onChange={e => setGrade(e.target.value)}>
                                        <option value="" className="text-slate-900 dark:text-white">Choose Grade</option>
                                        {GRADES.map(g => <option key={g.id} value={g.id} className="text-slate-900 dark:text-white">{g.name}</option>)}
                                    </select>

                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Select Subject</label>
                                    <select
                                        className="w-full px-8 py-5 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 shadow-sm font-bold outline-none cursor-pointer"
                                        value={subject} onChange={e => setSubject(e.target.value)}>
                                        <option value="" className="text-slate-900 dark:text-white">Choose Subject</option>
                                        {Object.entries(SUBJECTS.reduce((acc, s) => {
                                            if (!acc[s.group]) acc[s.group] = [];
                                            acc[s.group].push(s);
                                            return acc;
                                        }, {} as Record<string, typeof SUBJECTS>)).map(([group, subs]) => (
                                            <optgroup key={group} label={group} className="text-slate-900 dark:text-white font-bold bg-slate-100 dark:bg-slate-900">
                                                {subs.map(s => (
                                                    <option key={s.id} value={s.id} className="text-slate-900 dark:text-white pl-4">
                                                        {s.name}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-6">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Extra Details</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <select
                                            className="w-full px-6 py-5 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 shadow-sm font-bold outline-none cursor-pointer"
                                            value={medium} onChange={e => setMedium(e.target.value)}>
                                            <option value="English">English</option>
                                            <option value="Sinhala">Sinhala</option>
                                            <option value="Tamil">Tamil</option>
                                        </select>
                                        <input
                                            type="number" placeholder="Year"
                                            className="w-full px-6 py-5 rounded-2xl bg-slate-100 dark:bg-white/5 dark:text-white border-none shadow-inner font-bold text-center"
                                            value={year} onChange={e => setYear(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Select PDF File</label>
                            <div className="relative group overflow-hidden bg-slate-100 dark:bg-white/5 border-2 border-dashed border-slate-300 dark:border-white/10 hover:border-blue-600 rounded-[2rem] p-16 text-center transition-all cursor-pointer">
                                <input type="file" accept=".pdf" onChange={e => e.target.files && setFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                                <div className="relative z-10 pointer-events-none">
                                    <FileUp size={40} className="mx-auto mb-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                    <p className="text-xl font-bold text-slate-600 dark:text-slate-300">
                                        {file ? file.name : 'Click to select PDF'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                disabled={isUploading}
                                className={`w-full py-6 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-4 transition-all ${isUploading ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 dark:bg-blue-600 text-white shadow-xl hover:scale-[1.01]'}`}>
                                {isUploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
                                {isUploading ? 'Uploading...' : 'Save and Publish'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
