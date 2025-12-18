
import React, { useState, useEffect } from 'react';
import { 
  Lock, Upload, CheckCircle, FileUp, Loader2, 
  AlertCircle, Database, Trash2, Globe, Server,
  FileText, ShieldAlert, Info, Activity, Radio
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
    else alert('Access Denied: Invalid Infrastructure Key');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to terminate this resource?')) return;
    const { error } = await supabase.from('resources').delete().eq('id', id);
    if (!error) fetchFleet();
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStatus(null);
    if (!file || !title || !grade || !subject) {
      alert('Missing required structural fields.');
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
            throw new Error("INFRA_ERROR: Storage bucket 'papers' not found. Deploy via SQL or Dashboard.");
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
                <div className="w-24 h-24 bg-blue-600/10 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-blue-500 shadow-inner">
                    <ShieldAlert size={44} />
                </div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter">Infrastructure Auth</h1>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-12">Authorized Node Access Required</p>
                <form onSubmit={handleLogin} className="space-y-6">
                    <input 
                        type="password" 
                        autoFocus
                        placeholder="INFRA-KEY-X7"
                        className="w-full px-8 py-6 rounded-2xl bg-slate-50 dark:bg-white/5 dark:text-white border-none shadow-inner text-center font-black tracking-[0.6em] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:tracking-normal placeholder:opacity-20"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <button className="w-full py-6 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:scale-[1.02] active:scale-95 shadow-2xl shadow-blue-500/20 transition-all">Initialize Session</button>
                </form>
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 md:px-8">
        <div className="glass-card rounded-[4rem] p-8 md:p-16 shadow-3xl border-white/30 dark:border-white/5 relative overflow-hidden bg-white/40 dark:bg-slate-950/40">
            
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-12 mb-16 pb-16 border-b border-slate-100 dark:border-white/5 relative z-10">
                <div className="flex items-center gap-8">
                    <div className="w-24 h-24 rounded-[2rem] bg-blue-600 text-white flex items-center justify-center shadow-3xl">
                        <Activity size={44} />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-4">Infrastructure Control</h1>
                        <div className="flex items-center gap-6">
                            <span className="text-slate-500 font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                Uplink Stable
                            </span>
                            <span className="text-slate-500 font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                                <Radio size={14} className="text-blue-500" />
                                Node 0x7A4F
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 p-2 bg-slate-100 dark:bg-white/5 rounded-[2rem] shadow-inner">
                    <button 
                        onClick={() => setActiveTab('upload')}
                        className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'upload' ? 'bg-white dark:bg-slate-800 shadow-2xl text-blue-600 scale-[1.05]' : 'text-slate-400 hover:text-slate-600'}`}
                    >Data Push</button>
                    <button 
                        onClick={() => setActiveTab('fleet')}
                        className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'fleet' ? 'bg-white dark:bg-slate-800 shadow-2xl text-blue-600 scale-[1.05]' : 'text-slate-400 hover:text-slate-600'}`}
                    >Fleet Registry</button>
                    <button onClick={() => setIsAuthenticated(false)} className="px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10">Terminate</button>
                </div>
            </div>

            {errorStatus && (
                <div className="mb-12 p-10 bg-red-500/10 border border-red-500/20 rounded-[3rem] animate-in slide-in-from-top-4">
                    <div className="flex items-center gap-4 text-red-500 mb-6">
                        <AlertCircle size={32} />
                        <h3 className="font-black uppercase tracking-[0.4em] text-sm">Deployment Failure</h3>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-bold mb-8 text-xl">{errorStatus}</p>
                    <div className="bg-white/50 dark:bg-black/20 p-8 rounded-[2rem] space-y-6">
                        <h4 className="flex items-center gap-3 font-black uppercase text-[10px] text-blue-500 tracking-widest">
                            <Info size={16} /> Rectification Protocol
                        </h4>
                        <ol className="text-sm text-slate-500 dark:text-slate-400 list-decimal pl-6 space-y-3 font-medium">
                            <li>Access <span className="text-blue-600 font-black">Supabase Cloud Dashboard</span></li>
                            <li>Navigate to <span className="text-slate-800 dark:text-white">Storage Module</span></li>
                            <li>Verify existence of Public Bucket: <code className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">papers</code></li>
                            <li>Ensure RLS Policy permits <code className="text-emerald-500">INSERT</code> for role <code className="text-orange-500">anon</code></li>
                        </ol>
                    </div>
                </div>
            )}

            {activeTab === 'fleet' ? (
                <div className="space-y-6 relative z-10 animate-in fade-in slide-in-from-bottom-6">
                    {fleet.length === 0 && <p className="text-center py-32 text-slate-400 font-black uppercase tracking-widest">Registry Vacuum Detected</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {fleet.map(r => (
                            <div key={r.id} className="glass-card p-8 rounded-[2.5rem] flex items-center justify-between group hover:border-blue-500 transition-all bg-white/5 hover:bg-white/10">
                                 <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors shadow-inner">
                                        <FileText size={32} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-800 dark:text-white text-xl mb-1">{r.title}</h4>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{r.gradeId} // {r.year} // {r.medium}</span>
                                    </div>
                                 </div>
                                 <button onClick={() => handleDelete(r.id)} className="w-14 h-14 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg">
                                    <Trash2 size={24} />
                                 </button>
                            </div>
                        ))}
                    </div>
                </div>
            ) : showSuccess ? (
                <div className="py-40 text-center animate-in zoom-in duration-500">
                    <div className="w-40 h-40 bg-emerald-500 text-white rounded-[4rem] flex items-center justify-center mx-auto mb-12 shadow-3xl shadow-emerald-500/40">
                        <CheckCircle size={80} />
                    </div>
                    <h3 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">Transmission Secured</h3>
                    <p className="text-slate-500 mt-8 text-2xl font-medium max-w-2xl mx-auto">Academic resource broadcasted to global storage cluster with persistent identifiers.</p>
                </div>
            ) : (
                <form onSubmit={handleUpload} className="space-y-16 relative z-10 animate-in fade-in duration-1000">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="space-y-8 lg:col-span-3">
                             <label className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-500 ml-8">Structural Descriptor</label>
                             <input 
                                type="text" required placeholder="GCE A/L Combined Maths 2024 I"
                                className="w-full px-12 py-8 rounded-[3rem] bg-slate-100 dark:bg-white/5 dark:text-white border-none shadow-inner focus:ring-4 focus:ring-blue-500/10 font-black text-3xl md:text-4xl placeholder:opacity-10 tracking-tight"
                                value={title} onChange={e => setTitle(e.target.value)}
                             />
                        </div>

                        <div className="space-y-8">
                             <div className="space-y-6">
                                <label className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 ml-8">Grade Parameter</label>
                                <select className="w-full px-10 py-7 rounded-[2.5rem] bg-slate-100 dark:bg-white/5 dark:text-white border-none shadow-inner font-black text-lg outline-none cursor-pointer appearance-none text-center"
                                    value={grade} onChange={e => setGrade(e.target.value)}>
                                    <option value="">Select Logic</option>
                                    {GRADES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                             </div>
                        </div>

                        <div className="space-y-8">
                             <div className="space-y-6">
                                <label className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 ml-8">Subject Identifier</label>
                                <select className="w-full px-10 py-7 rounded-[2.5rem] bg-slate-100 dark:bg-white/5 dark:text-white border-none shadow-inner font-black text-lg outline-none cursor-pointer appearance-none text-center"
                                    value={subject} onChange={e => setSubject(e.target.value)}>
                                    <option value="">Select Module</option>
                                    {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                             </div>
                        </div>

                        <div className="space-y-8">
                             <div className="space-y-6">
                                <label className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 ml-8">Meta Config</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <select className="w-full px-8 py-7 rounded-[2.5rem] bg-slate-100 dark:bg-white/5 dark:text-white border-none shadow-inner font-black text-center outline-none"
                                        value={medium} onChange={e => setMedium(e.target.value)}>
                                        <option value="English">ENG</option>
                                        <option value="Sinhala">SIN</option>
                                        <option value="Tamil">TAM</option>
                                    </select>
                                    <input 
                                        type="number" placeholder="Year"
                                        className="w-full px-8 py-7 rounded-[2.5rem] bg-slate-100 dark:bg-white/5 dark:text-white border-none shadow-inner font-black text-center"
                                        value={year} onChange={e => setYear(e.target.value)}
                                    />
                                </div>
                             </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <label className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 ml-8">Asset Injection Port</label>
                        <div className="relative group overflow-hidden bg-slate-100 dark:bg-white/5 border-4 border-dashed border-slate-200 dark:border-white/10 hover:border-blue-600 rounded-[4rem] p-24 md:p-32 text-center transition-all cursor-pointer">
                            <input type="file" accept=".pdf" onChange={e => e.target.files && setFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                            <div className="relative z-10 pointer-events-none">
                                <div className="w-24 h-24 rounded-[2rem] bg-white/50 dark:bg-white/5 flex items-center justify-center mx-auto mb-10 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xl">
                                    <FileUp size={44} className="group-hover:-translate-y-2 transition-transform" />
                                </div>
                                <p className="text-3xl md:text-4xl font-black text-slate-700 dark:text-slate-300">
                                    {file ? file.name : 'Inject PDF Payload'}
                                </p>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-6 group-hover:text-blue-500 transition-colors">Max Payload 50MB // Encrypted Stream</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-10">
                        <button 
                            disabled={isUploading}
                            className={`w-full py-10 rounded-[3rem] font-black text-2xl uppercase tracking-[0.5em] flex items-center justify-center gap-8 transition-all shadow-3xl ${isUploading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 dark:bg-blue-600 text-white hover:scale-[1.02] shadow-blue-500/40 active:scale-95'}`}>
                            {isUploading ? <Loader2 size={40} className="animate-spin" /> : <Upload size={40} />}
                            {isUploading ? 'COMMITTING BYTES...' : 'DEPLOY TO MAIN CLUSTER'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    </div>
  );
};

export default AdminPanel;
