import React, { useState, useEffect } from 'react';
import { Play, Search, Filter, BookOpen, GraduationCap, Youtube } from 'lucide-react';
import { supabase } from '../supabase';
import { GRADES, SUBJECTS, SUBJECTS_AL, SUBJECTS_6_TO_9, SUBJECTS_10_TO_11, SUBJECTS_SCOUT } from '../constants';

interface Video {
    id: string;
    title: string;
    youtube_url: string;
    grade_id: string;
    subject_id: string;
    description: string;
    author: string;
    created_at: string;
}

const VideoLibrary: React.FC = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGrade, setSelectedGrade] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const { data, error } = await supabase
                .from('videos')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setVideos(data || []);
        } catch (error) {
            console.error('Error fetching videos:', error);
        } finally {
            setLoading(false);
        }
    };

    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const filteredVideos = videos.filter(video => {
        const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (video.description && video.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesGrade = selectedGrade ? video.grade_id === selectedGrade : true;
        const matchesSubject = selectedSubject ? video.subject_id === selectedSubject : true;
        return matchesSearch && matchesGrade && matchesSubject;
    });

    const currentSubjects = (() => {
        if (['gr6', 'gr7', 'gr8', 'gr9'].includes(selectedGrade)) return SUBJECTS_6_TO_9;
        if (['gr10', 'gr11', 'ol'].includes(selectedGrade)) return SUBJECTS_10_TO_11;
        if (['al', 'gr12', 'gr13'].includes(selectedGrade)) return SUBJECTS_AL;
        if (selectedGrade === 'scout') return SUBJECTS_SCOUT;
        return SUBJECTS;
    })();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black font-sans selection:bg-rose-500/30">
            {/* Header */}
            <div className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[50vh] bg-gradient-to-b from-rose-100/50 via-purple-100/30 to-transparent dark:from-rose-900/20 dark:via-purple-900/10 dark:to-transparent pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10 text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100/50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4">
                        <Youtube size={14} />
                        <span>Video Library</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter animate-in fade-in slide-in-from-bottom-6">
                        Learn visually.
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8">
                        Curated educational videos to help you master complex topics.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-20">
                {/* Filters */}
                <div className="bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 mb-12 shadow-xl shadow-slate-200/50 dark:shadow-none animate-in fade-in slide-in-from-bottom-10">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative md:col-span-2 group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search videos..."
                                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border-none font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500/20 transition-all placeholder:text-slate-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <select
                                className="w-full pl-6 pr-10 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border-none font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500/20 cursor-pointer appearance-none"
                                value={selectedGrade}
                                onChange={(e) => setSelectedGrade(e.target.value)}
                            >
                                <option value="">All Grades</option>
                                {GRADES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                <GraduationCap size={18} />
                            </div>
                        </div>
                        <div className="relative">
                            <select
                                className="w-full pl-6 pr-10 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border-none font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500/20 cursor-pointer appearance-none"
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                            >
                                <option value="">All Subjects</option>
                                {currentSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                <BookOpen size={18} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Video Grid */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Library...</p>
                    </div>
                ) : filteredVideos.length === 0 ? (
                    <div className="text-center py-32 bg-white dark:bg-white/5 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/10">
                        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Youtube size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No videos found</h3>
                        <p className="text-slate-500 dark:text-slate-400">Try adjusting your filters or search terms.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredVideos.map((video) => {
                            const videoId = getYouTubeId(video.youtube_url);
                            return (
                                <div
                                    key={video.id}
                                    onClick={() => setSelectedVideo(video)}
                                    className="group bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-rose-500/10 hover:-translate-y-1 transition-all cursor-pointer"
                                >
                                    <div className="aspect-video relative overflow-hidden bg-slate-100 dark:bg-black">
                                        <img
                                            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                                            alt={video.title}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                            onError={(e) => {
                                                // Fallback if maxres is not available
                                                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-all duration-300">
                                                <Play size={24} fill="currentColor" />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                            <span className="px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wide border border-white/10">
                                                {GRADES.find(g => g.id === video.grade_id)?.name || video.grade_id}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="font-bold text-lg text-slate-800 dark:text-white line-clamp-2 mb-2 group-hover:text-rose-500 transition-colors">
                                            {video.title}
                                        </h3>
                                        {video.description && (
                                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                                                {video.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 mt-auto">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                {SUBJECTS.find(s => s.id === video.subject_id)?.name || video.subject_id}
                                            </span>
                                            {video.author && (
                                                <>
                                                    <span className="text-slate-300">•</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                        {video.author}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Video Modal */}
            {selectedVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in">
                    <div className="absolute inset-0" onClick={() => setSelectedVideo(null)} />
                    <div className="relative w-full max-w-5xl bg-black rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95">
                        <div className="aspect-video">
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${getYouTubeId(selectedVideo.youtube_url)}?autoplay=1`}
                                title={selectedVideo.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                        <div className="p-8 bg-slate-900">
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-2">{selectedVideo.title}</h2>
                                    <p className="text-slate-400 text-sm leading-relaxed">{selectedVideo.description}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedVideo(null)}
                                    className="px-4 py-2 rounded-xl bg-white/10 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoLibrary;
