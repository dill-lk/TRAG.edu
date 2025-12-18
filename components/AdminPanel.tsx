import React, { useState, useEffect } from 'react';
import {
    Lock, Upload, CheckCircle, FileUp, Loader2,
    AlertCircle, Database, Trash2, Globe, Layout,
    FileText, ShieldAlert, Info, Activity, List
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

    // Form State
    const [title, setTitle] = useState('');
    const [grade, setGrade] = useState('');
    const [subject, setSubject] = useState('');
    const [type, setType] = useState('Past Paper');
    const [medium, setMedium] = useState('English');
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        if (isAuthenticated && activeTab === 'fleet') {
            fetchFleet();
        }
    }, [isAuthenticated, activeTab]);

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
        <div className="max-w-6xl mx-auto py-10 px-4">
            <div className="glass-card rounded-[3.5rem] p-8 md:p-12 shadow-3xl border-white/20 dark:bg-slate-950/40">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12 pb-12 border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xl">
                            <Layout size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Dashboard</h1>
                            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Manage Library Resources</p>
                        </div>
                    </div>

                    <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl shadow-inner">
                        <button
                            onClick={() => setActiveTab('upload')}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'upload' ? 'bg-white dark:bg-slate-800 shadow-md text-blue-600' : 'text-slate-400'}`}
                        >Upload</button>
                        <button
                            onClick={() => setActiveTab('fleet')}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'fleet' ? 'bg-white dark:bg-slate-800 shadow-md text-blue-600' : 'text-slate-400'}`}
                        >Manage Files</button>
                        <button onClick={() => setIsAuthenticated(false)} className="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500">Logout</button>
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
                    <div className="space-y-4 animate-in fade-in">
                        {fleet.length === 0 && <p className="text-center py-20 text-slate-400 font-bold uppercase text-xs tracking-widest">No papers uploaded yet</p>}
                        <div className="grid grid-cols-1 gap-4">
                            {fleet.map(r => (
                                <div key={r.id} className="glass-card p-6 rounded-2xl flex items-center justify-between group hover:border-blue-500 transition-all">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 dark:text-white">{r.title}</h4>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{r.gradeId} • {r.year} • {r.medium}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDelete(r.id)} className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
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
                                        {SUBJECTS.map(s => <option key={s.id} value={s.id} className="text-slate-900 dark:text-white">{s.name}</option>)}
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
