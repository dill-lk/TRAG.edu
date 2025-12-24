import React, { useState, useEffect } from 'react';
import { Play, Search, Filter, BookOpen, GraduationCap, Youtube, List, ChevronRight, ChevronLeft, X } from 'lucide-react';
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
    playlist_id: string | null;
    order_index: number;
    created_at: string;
}

interface Playlist {
    id: string;
    title: string;
    description: string;
    grade_id: string;
    subject_id: string;
    created_at: string;
}

const VideoLibrary: React.FC = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGrade, setSelectedGrade] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const { data: vData, error: vError } = await supabase
                .from('videos')
                .select('*')
                .order('order_index', { ascending: true });

            if (vError) throw vError;
            setVideos(vData || []);

            const { data: pData, error: pError } = await supabase
                .from('video_playlists')
                .select('*')
                .order('created_at', { ascending: false });

            if (pError) throw pError;
            setPlaylists(pData || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const filteredPlaylists = playlists.filter(playlist => {
        const matchesSearch = playlist.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (playlist.description && playlist.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesGrade = selectedGrade ? playlist.grade_id === selectedGrade : true;
        const matchesSubject = selectedSubject ? playlist.subject_id === selectedSubject : true;
        return matchesSearch && matchesGrade && matchesSubject;
    });

    const filteredVideos = videos.filter(video => {
        const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (video.description && video.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesGrade = selectedGrade ? video.grade_id === selectedGrade : true;
        const matchesSubject = selectedSubject ? video.subject_id === selectedSubject : true;
        const isIndependent = !video.playlist_id;
        return matchesSearch && matchesGrade && matchesSubject && isIndependent;
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
                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Library...</p>
                    </div>
                ) : (filteredVideos.length === 0 && filteredPlaylists.length === 0) ? (
                    <div className="text-center py-32 bg-white dark:bg-white/5 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/10">
                        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Youtube size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No videos or playlists found</h3>
                        <p className="text-slate-500 dark:text-slate-400">Try adjusting your filters or search terms.</p>
                    </div>
                ) : (
                    <div className="space-y-16">
                        {/* Playlists Section */}
                        {filteredPlaylists.length > 0 && (
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center">
                                        <List size={20} />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Playlists</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filteredPlaylists.map((playlist) => {
                                        const playlistVideos = videos.filter(v => v.playlist_id === playlist.id);
                                        const firstVideo = playlistVideos[0];
                                        const videoId = firstVideo ? getYouTubeId(firstVideo.youtube_url) : null;

                                        return (
                                            <div
                                                key={playlist.id}
                                                onClick={() => {
                                                    setSelectedPlaylist(playlist);
                                                    if (firstVideo) setSelectedVideo(firstVideo);
                                                }}
                                                className="group bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all cursor-pointer"
                                            >
                                                <div className="aspect-video relative overflow-hidden bg-slate-100 dark:bg-black">
                                                    {videoId ? (
                                                        <img
                                                            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                                                            alt={playlist.title}
                                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                            <Youtube size={48} />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                                                        <div className="text-center text-white px-6">
                                                            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-3">
                                                                <List size={24} />
                                                            </div>
                                                            <span className="text-sm font-black uppercase tracking-widest">{playlistVideos.length} Videos</span>
                                                        </div>
                                                    </div>
                                                    <div className="absolute top-4 left-4">
                                                        <span className="px-3 py-1 rounded-lg bg-indigo-600 text-[10px] font-black text-white uppercase tracking-wider shadow-lg">
                                                            Playlist
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="p-6">
                                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white line-clamp-1 mb-2 group-hover:text-indigo-500 transition-colors">
                                                        {playlist.title}
                                                    </h3>
                                                    {playlist.description && (
                                                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                                                            {playlist.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-2 mt-auto">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                            {GRADES.find(g => g.id === playlist.grade_id)?.name || playlist.grade_id}
                                                        </span>
                                                        <span className="text-slate-300">•</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                            {SUBJECTS.find(s => s.id === playlist.subject_id)?.name || playlist.subject_id}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Independent Videos Section */}
                        <div className="space-y-8">
                            {filteredPlaylists.length > 0 && filteredVideos.length > 0 && (
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center">
                                        <Youtube size={20} />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Individual Lessons</h2>
                                </div>
                            )}
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
                        </div>
                    </div>
                )}
            </div>

            {/* Video Modal */}
            {selectedVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in">
                    <div className="absolute inset-0" onClick={() => { setSelectedVideo(null); setSelectedPlaylist(null); }} />
                    <div className="relative w-full max-w-6xl bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col lg:flex-row h-[85vh]">
                        {/* Player Area */}
                        <div className="flex-grow bg-black flex flex-col">
                            <div className="relative aspect-video lg:aspect-auto lg:flex-grow">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${getYouTubeId(selectedVideo.youtube_url)}?autoplay=1`}
                                    title={selectedVideo.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="absolute inset-0"
                                />
                            </div>
                            <div className="p-8 border-t border-white/5">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest">{selectedVideo.subject_id}</span>
                                            {selectedPlaylist && <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-widest">Part of Playlist</span>}
                                        </div>
                                        <h2 className="text-2xl font-black text-white tracking-tight">{selectedVideo.title}</h2>
                                        <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">{selectedVideo.description}</p>
                                    </div>
                                    <button
                                        onClick={() => { setSelectedVideo(null); setSelectedPlaylist(null); }}
                                        className="p-3 rounded-full bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all transform hover:rotate-90"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar (Only for playlists) */}
                        {selectedPlaylist && (
                            <div className="w-full lg:w-80 bg-slate-800/50 backdrop-blur-md border-l border-white/5 flex flex-col">
                                <div className="p-6 border-b border-white/5">
                                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Up Next in</h3>
                                    <h4 className="text-sm font-bold text-white line-clamp-1">{selectedPlaylist.title}</h4>
                                </div>
                                <div className="flex-grow overflow-y-auto p-4 space-y-2">
                                    {videos.filter(v => v.playlist_id === selectedPlaylist.id).map((v, index) => (
                                        <button
                                            key={v.id}
                                            onClick={() => setSelectedVideo(v)}
                                            className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 group ${selectedVideo.id === v.id ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-white/5 text-slate-400'}`}
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center flex-shrink-0 text-[10px] font-black">
                                                {index + 1}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold line-clamp-2 leading-tight group-hover:text-white transition-colors">{v.title}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoLibrary;
