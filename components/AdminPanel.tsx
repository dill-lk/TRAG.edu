import React, { useState, useEffect, useMemo } from 'react';
import {
    Lock, Upload, CheckCircle, FileUp, Loader2,
    AlertCircle, Database, Trash2, Globe, Layout,
    FileText, ShieldAlert, Info, Activity, List,
    Search, Filter, BarChart3, PieChart, TrendingUp,
    UserPlus, Users, Key, Terminal
} from 'lucide-react';
import { GRADES, SUBJECTS, SUBJECTS_6_TO_9, SUBJECTS_10_TO_11, SUBJECTS_AL } from '../constants';
import { supabase } from '../supabase';
import { Resource } from '../types';

const AdminPanel = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isDeveloper, setIsDeveloper] = useState(false);

    // Login State
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);

    const [isUploading, setIsUploading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorStatus, setErrorStatus] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'upload' | 'fleet' | 'dev'>('upload');
    const [fleet, setFleet] = useState<Resource[]>([]);

    // Dev Portal State
    const [adminUsers, setAdminUsers] = useState<any[]>([]);
    const [newAdminUser, setNewAdminUser] = useState('');
    const [newAdminPass, setNewAdminPass] = useState('');
    const [showDbSetup, setShowDbSetup] = useState(false);
    const [maintMode, setMaintMode] = useState(false);

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGrade, setFilterGrade] = useState('');
    const [filterSubject, setFilterSubject] = useState('');

    // Form State
    const [title, setTitle] = useState('');
    const [grade, setGrade] = useState('');
    const [subject, setSubject] = useState('');
    const [type, setType] = useState('Past Paper');
    const [term, setTerm] = useState('1st Term');
    const [medium, setMedium] = useState('English');
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            fetchFleet();
            if (isDeveloper) {
                fetchAdmins();
            }
        }
    }, [isAuthenticated, isDeveloper]);

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
            term: r.term,
            file_url: r.file_url
        })));
    };

    const fetchAdmins = async () => {
        const { data: users } = await supabase.from('admin_users').select('*').order('created_at', { ascending: false });
        if (users) setAdminUsers(users);

        const { data: settings } = await supabase.from('system_settings').select('value').eq('key', 'MAINTENANCE_MODE').single();
        if (settings?.value === 'true') setMaintMode(true);
        else setMaintMode(false);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginLoading(true);
        setErrorStatus(null);

        try {
            // 1. Developer Backdoor
            if (loginPassword === '2011812') {
                setIsAuthenticated(true);
                setIsDeveloper(true);
                setLoginLoading(false);
                return;
            }

            // 2. Master Password (Legacy)
            if (loginPassword === 'admin123') {
                setIsAuthenticated(true);
                setIsDeveloper(false);
                setLoginLoading(false);
                return;
            }

            // 3. Database Auth
            if (loginUsername) {
                const { data, error } = await supabase
                    .from('admin_users')
                    .select('*')
                    .eq('username', loginUsername)
                    .eq('password', loginPassword)
                    .single();

                if (data && !error) {
                    setIsAuthenticated(true);
                    setIsDeveloper(false);
                } else {
                    throw new Error('Invalid Username or Password');
                }
            } else {
                throw new Error('Please enter credentials');
            }

        } catch (err: any) {
            alert(err.message || 'Access Denied');
        } finally {
            setLoginLoading(false);
        }
    };

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAdminUser || !newAdminPass) return;

        const { error } = await supabase.from('admin_users').insert([{
            username: newAdminUser,
            password: newAdminPass
        }]);

        if (error) {
            alert('Error creating admin: ' + error.message);
        } else {
            setNewAdminUser('');
            setNewAdminPass('');
            fetchAdmins();
            alert('New Admin Created Successfully');
        }
    };

    const handleDeleteAdmin = async (id: string) => {
        if (!confirm('Revoke access for this admin?')) return;
        const { error } = await supabase.from('admin_users').delete().eq('id', id);
        if (!error) fetchAdmins();
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
                title, grade_id: grade, subject_id: subject, type, term: type === 'Term Test' ? term : null, medium, year: parseInt(year), file_url: publicUrl
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
                            type="text"
                            placeholder="Username (Optional for Master)"
                            className="w-full px-8 py-5 rounded-2xl bg-slate-50 dark:bg-white/5 dark:text-white border-none shadow-inner text-center font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                            value={loginUsername}
                            onChange={e => setLoginUsername(e.target.value)}
                        />
                        <input
                            type="password"
                            autoFocus
                            placeholder="Enter Password / Dev Code"
                            className="w-full px-8 py-5 rounded-2xl bg-slate-50 dark:bg-white/5 dark:text-white border-none shadow-inner text-center font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                            value={loginPassword}
                            onChange={e => setLoginPassword(e.target.value)}
                        />
                        <button disabled={loginLoading} className="w-full py-5 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 shadow-xl transition-all">
                            {loginLoading ? 'Verifying...' : 'Login'}
                        </button>
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
                    <div className={`w-16 h-16 rounded-2xl text-white flex items-center justify-center shadow-xl ${isDeveloper ? 'bg-indigo-600' : 'bg-blue-600'}`}>
                        {isDeveloper ? <Terminal size={32} /> : <Layout size={32} />}
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">TRAG.edu {isDeveloper ? 'Developer Portal' : 'Control'}</h1>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
                            {isDeveloper ? 'System Administration & Access Control' : 'Advanced Resource Management'}
                        </p>
                    </div>
                </div>

                <button onClick={() => setIsAuthenticated(false)} className="px-8 py-3 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                    Logout System
                </button>
            </div>

            {/* Stats Dashboard */}
            {!isDeveloper && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="glass-card p-8 rounded-[2.5rem] border-white/20 dark:bg-slate-950/40 relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4 text-slate-400">
                                <Database size={20} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Total Resources</span>
                            </div>
                            <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.total}</h3>
                        </div>
                    </div>
                    <div className="glass-card p-8 rounded-[2.5rem] border-white/20 dark:bg-slate-950/40 relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4 text-slate-400">
                                <PieChart size={20} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Active Subjects</span>
                            </div>
                            <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.subjects}</h3>
                        </div>
                    </div>
                    <div className="glass-card p-8 rounded-[2.5rem] border-white/20 dark:bg-slate-950/40 relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4 text-slate-400">
                                <TrendingUp size={20} />
                                <span className="text-[10px] font-black uppercase tracking-widest">New This Year</span>
                            </div>
                            <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.recent}</h3>
                        </div>
                    </div>
                </div>
            )}

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
                            Upload
                        </button>
                        <button
                            onClick={() => setActiveTab('fleet')}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'fleet' ? 'bg-white dark:bg-slate-800 shadow-md text-blue-600' : 'text-slate-400'}`}
                        >
                            <List size={16} />
                            Files
                        </button>
                        {isDeveloper && (
                            <button
                                onClick={() => setActiveTab('dev')}
                                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'dev' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400'}`}
                            >
                                <ShieldAlert size={16} />
                                Dev Portal
                            </button>
                        )}
                    </div>
                </div>

                {showDbSetup && (
                    <div className="mb-10 p-8 bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-500/30 rounded-[2.5rem] animate-in slide-in-from-top-4">
                        <div className="flex items-center gap-4 mb-4 text-indigo-600 dark:text-indigo-400">
                            <Database size={28} />
                            <div>
                                <h3 className="font-black text-lg">Database Setup Required</h3>
                                <p className="text-xs font-bold uppercase tracking-wide opacity-70">Run this SQL in Supabase to fix the error</p>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto border border-white/10 relative group">
                            <pre className="text-[10px] font-mono text-emerald-400 leading-relaxed whitespace-pre">
                                {`-- Run in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.system_settings (
  key text PRIMARY KEY,
  value text
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  action text NOT NULL,
  details text,
  performed_by text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- IMPORTANT: Go to Database > Schema and click "Reload Schema Cache" if errors persist.`}
                            </pre>
                            <button
                                onClick={() => navigator.clipboard.writeText(`CREATE TABLE IF NOT EXISTS public.admin_users (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, username text UNIQUE NOT NULL, password text NOT NULL, created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL); CREATE TABLE IF NOT EXISTS public.system_settings (key text PRIMARY KEY, value text); CREATE TABLE IF NOT EXISTS public.audit_logs (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, action text NOT NULL, details text, performed_by text, created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL);`)}
                                className="absolute top-4 right-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all"
                            >
                                Copy SQL
                            </button>
                        </div>
                        <div className="mt-4 flex gap-4">
                            <button onClick={() => setShowDbSetup(false)} className="text-slate-500 font-bold text-xs hover:text-indigo-500">Close Helper</button>
                            <a href="https://supabase.com/dashboard/project/_/sql" target="_blank" className="text-indigo-500 font-bold text-xs hover:underline flex items-center gap-1">Open Supabase SQL <Globe size={12} /></a>
                        </div>
                    </div>
                )}

                {errorStatus && !showDbSetup && (
                    <div className="mb-10 p-8 bg-red-500/10 border border-red-500/20 rounded-3xl animate-in slide-in-from-top-4">
                        <div className="flex items-center gap-3 text-red-500 mb-2">
                            <AlertCircle size={20} />
                            <h3 className="font-bold text-sm">Error Occurred</h3>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 font-medium">{errorStatus}</p>
                    </div>
                )}

                {activeTab === 'dev' && isDeveloper ? (
                    <div className="space-y-12 animate-in fade-in">

                        {/* System Configuration */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                                        <Key size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white">API Configuration</h3>
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">Manage External Service Keys</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Gemini API Key</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="password"
                                                placeholder="Enter new API Key..."
                                                className="w-full px-6 py-4 rounded-xl bg-white dark:bg-slate-900 border-none shadow-sm font-bold outline-none text-slate-900 dark:text-white"
                                                onChange={async (e) => {
                                                    if (e.target.value.length > 10) {
                                                        await supabase.from('system_settings').upsert({ key: 'GEMINI_API_KEY', value: e.target.value });
                                                    }
                                                }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-2 ml-2">Key updates auto-save on entry.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
                                        <ShieldAlert size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white">System Status</h3>
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">Global Availability Controls</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm">
                                    <div>
                                        <h4 className="font-bold text-slate-800 dark:text-white">Maintenance Mode</h4>
                                        <p className="text-xs text-slate-400">Lock down the site for updates.</p>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            const newVal = !maintMode;
                                            if (!confirm(`Switch system to ${newVal ? 'Maintenance' : 'Normal'} Mode?`)) return;

                                            const { error } = await supabase.from('system_settings').upsert({ key: 'MAINTENANCE_MODE', value: String(newVal) });
                                            if (!error) {
                                                setMaintMode(newVal);
                                                alert(`System is now in ${newVal ? 'Lockdown' : 'Normal'} Mode.`);
                                            }
                                        }}
                                        className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${maintMode ? 'bg-red-500 text-white' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                        {maintMode ? 'Active (Locked)' : 'Normal'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Create Admin Form */}
                        <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                                    <UserPlus size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Grant Admin Access</h3>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">Create new staff credentials</p>
                                </div>
                            </div>

                            <form onSubmit={handleCreateAdmin} className="flex flex-col md:flex-row gap-4">
                                <input
                                    type="text" required placeholder="New Username"
                                    className="w-full px-6 py-4 rounded-xl bg-white dark:bg-slate-900 border-none shadow-sm font-bold outline-none text-slate-900 dark:text-white"
                                    value={newAdminUser} onChange={e => setNewAdminUser(e.target.value)}
                                />
                                <input
                                    type="text" required placeholder="New Password"
                                    className="w-full px-6 py-4 rounded-xl bg-white dark:bg-slate-900 border-none shadow-sm font-bold outline-none text-slate-900 dark:text-white"
                                    value={newAdminPass} onChange={e => setNewAdminPass(e.target.value)}
                                />
                                <button className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-lg whitespace-nowrap">
                                    Create Admin
                                </button>
                            </form>
                        </div>

                        {/* Admin List */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest pl-4">Active Administrators</h3>
                            {adminUsers.map(u => (
                                <div key={u.id} className="glass-card p-6 rounded-2xl flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-400">
                                            <Users size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 dark:text-white">{u.username}</h4>
                                            <p className="text-[10px] text-slate-400 font-mono">ID: {u.id}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteAdmin(u.id)} className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                            {adminUsers.length === 0 && <p className="text-center text-slate-400 py-10">No additional admins found.</p>}
                        </div>

                    </div>
                ) : activeTab === 'fleet' ? (
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
                                                <a href={`#/paper/${r.id}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 group/link">
                                                    <h4 className="font-bold text-slate-800 dark:text-white group-hover/link:text-blue-500 group-hover/link:underline transition-all">{r.title}</h4>
                                                    <Globe size={14} className="text-slate-400 group-hover/link:text-blue-500 opacity-0 group-hover/link:opacity-100 transition-all" />
                                                </a>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide">{r.gradeId}</span>
                                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide">{r.year}</span>
                                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide">{r.medium}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(`${window.location.origin}/#/paper/${r.id}`);
                                                    alert('Public Link Copied!');
                                                }}
                                                className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all"
                                                title="Copy Public Link"
                                            >
                                                <Globe size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(r.id)} className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
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
                                        {Object.entries((() => {
                                            let currentSubjects = SUBJECTS;
                                            if (['gr6', 'gr7', 'gr8', 'gr9'].includes(grade)) currentSubjects = SUBJECTS_6_TO_9;
                                            else if (['gr10', 'gr11', 'ol'].includes(grade)) currentSubjects = SUBJECTS_10_TO_11;
                                            else if (['al', 'gr12', 'gr13'].includes(grade)) currentSubjects = SUBJECTS_AL;

                                            // Fallback if generic grade
                                            return currentSubjects.reduce((acc, s) => {
                                                if (!acc[s.group]) acc[s.group] = [];
                                                acc[s.group].push(s);
                                                return acc;
                                            }, {} as Record<string, typeof SUBJECTS>);
                                        })()).map(([group, subs]) => (
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

                                    {/* Resource Type & Term Selector */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative">
                                            <select
                                                className="w-full px-6 py-5 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 shadow-sm font-bold outline-none cursor-pointer"
                                                value={type} onChange={e => setType(e.target.value)}>
                                                <option value="Past Paper">Past Paper</option>
                                                <option value="Model Paper">Model Paper</option>
                                                <option value="Term Test">Term Test</option>
                                                <option value="Short Note">Short Note</option>
                                                <option value="Syllabus">Syllabus</option>
                                                <option value="Teachers Guide">Teachers Guide</option>
                                                {(grade === 'gr11' || grade === 'ol') && <option value="G.C.E. O/L Exam">G.C.E. O/L Exam</option>}
                                                {(grade === 'gr12' || grade === 'gr13' || grade === 'al') && <option value="G.C.E. A/L Exam">G.C.E. A/L Exam</option>}
                                            </select>
                                        </div>

                                        {type === 'Term Test' && (
                                            <div className="relative animate-in fade-in slide-in-from-left-4">
                                                <select
                                                    className="w-full px-6 py-5 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-500/30 shadow-sm font-bold outline-none cursor-pointer"
                                                    value={term} onChange={e => setTerm(e.target.value)}>
                                                    <option value="1st Term">1st Term</option>
                                                    <option value="2nd Term">2nd Term</option>
                                                    <option value="3rd Term">3rd Term</option>
                                                </select>
                                            </div>
                                        )}
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
