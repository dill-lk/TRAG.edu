import React, { useState, useEffect } from 'react';
import { Send, User, Shield, CheckCircle, MessageSquare, AlertCircle } from 'lucide-react';
import { supabase } from '../supabase';

interface Comment {
    id: string;
    paper_id: string;
    author_name: string | null;
    content: string;
    is_help_request: boolean;
    status: string;
    created_at: string;
}

interface CommentSectionProps {
    paperId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ paperId }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchComments();
    }, [paperId]);

    const fetchComments = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('paper_id', paperId)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setComments(data);
        }
        setIsLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        const isHelpRequest = newComment.toLowerCase().includes('@admin');

        const { error } = await supabase.from('comments').insert([
            {
                paper_id: paperId,
                author_name: authorName.trim() || null,
                content: newComment.trim(),
                is_help_request: isHelpRequest,
                status: isHelpRequest ? 'pending' : 'none'
            }
        ]);

        if (!error) {
            setNewComment('');
            fetchComments();
        } else {
            alert('Error posting comment: ' + error.message);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="glass-card rounded-none md:rounded-[3rem] p-4 md:p-10 mt-6 md:mt-12 border-none shadow-xl bg-white/40 dark:bg-slate-900/40 mx-0">
            <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-10">
                <div className="w-9 h-9 md:w-12 md:h-12 bg-blue-600/10 text-blue-600 rounded-lg md:rounded-2xl flex items-center justify-center shrink-0">
                    <MessageSquare size={18} className="md:w-6 md:h-6" />
                </div>
                <div>
                    <h3 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Student Discussion</h3>
                    <p className="text-slate-500 text-[8px] md:text-[10px] font-bold uppercase tracking-widest leading-none">Insights & Help</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 mb-8 md:mb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            placeholder="Name (Optional)"
                            className="w-full pl-10 md:pl-14 pr-4 py-3 md:py-4 rounded-xl md:rounded-2xl bg-white dark:bg-slate-800 border-none shadow-sm font-bold placeholder:text-slate-400 text-slate-900 dark:text-white outline-none text-[11px] md:text-sm"
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-blue-500/5 text-blue-600 text-[8px] md:text-[10px] font-bold uppercase tracking-widest border border-blue-500/10">
                        <AlertCircle size={10} />
                        <span className="truncate">Type <strong>@admin</strong> for Help</span>
                    </div>
                </div>

                <div className="relative">
                    <textarea
                        required
                        placeholder="Write your thoughts..."
                        className="w-full p-4 md:p-8 rounded-2xl md:rounded-[2rem] bg-white dark:bg-slate-800 border-none shadow-sm font-bold min-h-[100px] md:min-h-[150px] placeholder:text-slate-400 text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-xs md:text-sm"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button
                        disabled={isSubmitting}
                        className="absolute bottom-3 right-3 md:bottom-6 md:right-6 p-2.5 md:p-4 bg-blue-600 text-white rounded-lg md:rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? <span className="animate-spin block px-1 text-[10px]">...</span> : <Send size={18} className="md:w-6 md:h-6" />}
                    </button>
                </div>
            </form>

            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {isLoading ? (
                    <div className="text-center py-10 opacity-50 font-bold uppercase tracking-widest text-[10px]">Loading Threads...</div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-20 bg-slate-100/50 dark:bg-white/5 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-white/10">
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No discussions yet. Be the first!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className={`p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] relative overflow-hidden transition-all ${comment.is_help_request ? 'bg-amber-500/5 border border-amber-500/20' : 'bg-white dark:bg-white/5 shadow-sm'}`}>
                            <div className="flex justify-between items-start mb-2 md:mb-4">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 font-extrabold text-[10px] shrink-0">
                                        {comment.author_name ? comment.author_name.charAt(0).toUpperCase() : '?'}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-black text-slate-900 dark:text-white text-xs md:text-sm truncate pr-2">
                                            {comment.author_name || 'Anonymous Student'}
                                            {comment.is_help_request && (
                                                <span className="ml-2 px-2 py-0.5 bg-amber-500 text-white rounded-full text-[7px] uppercase tracking-widest inline-flex items-center gap-1">
                                                    <Shield size={8} /> HELP
                                                </span>
                                            )}
                                        </h4>
                                        <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                            {new Date(comment.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                {comment.status === 'resolved' && (
                                    <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                        <CheckCircle size={12} /> Resolved
                                    </div>
                                )}
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 font-semibold leading-relaxed text-xs md:text-base">
                                {comment.content}
                            </p>

                            {comment.admin_reply && (
                                <div className="mt-4 md:mt-6 p-4 md:p-6 bg-blue-600/5 border-l-4 border-blue-500 rounded-xl md:rounded-2xl animate-in slide-in-from-left-4">
                                    <div className="flex items-center gap-2 mb-1.5 md:mb-2 text-blue-600 dark:text-blue-400">
                                        <Shield size={12} />
                                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">Admin Response</span>
                                    </div>
                                    <p className="text-slate-800 dark:text-slate-200 font-bold italic leading-relaxed text-[11px] md:text-sm">
                                        {comment.admin_reply}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CommentSection;
