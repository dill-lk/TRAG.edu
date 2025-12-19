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
        <div className="glass-card rounded-[3rem] p-10 mt-12 border-none shadow-xl bg-white/40 dark:bg-slate-900/40">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center">
                    <MessageSquare size={24} />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Student Discussion</h3>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Share insights or ask for help</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 mb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Display Name (Optional)"
                            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white dark:bg-slate-800 border-none shadow-sm font-bold placeholder:text-slate-400 text-slate-900 dark:text-white outline-none"
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-blue-500/5 text-blue-600 text-[10px] font-bold uppercase tracking-widest border border-blue-500/10">
                        <AlertCircle size={14} />
                        <span>Type <strong>@admin</strong> to flag as Help Request</span>
                    </div>
                </div>

                <div className="relative">
                    <textarea
                        required
                        placeholder="Write your thoughts here..."
                        className="w-full p-8 rounded-[2rem] bg-white dark:bg-slate-800 border-none shadow-sm font-bold min-h-[150px] placeholder:text-slate-400 text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button
                        disabled={isSubmitting}
                        className="absolute bottom-6 right-6 p-4 bg-blue-600 text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? <span className="animate-spin block">...</span> : <Send size={24} />}
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
                        <div key={comment.id} className={`p-8 rounded-[2.5rem] relative overflow-hidden transition-all ${comment.is_help_request ? 'bg-amber-500/5 border border-amber-500/20' : 'bg-white dark:bg-white/5 shadow-sm'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 font-black text-xs">
                                        {comment.author_name ? comment.author_name.charAt(0).toUpperCase() : '?'}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 dark:text-white text-sm">
                                            {comment.author_name || 'Anonymous Student'}
                                            {comment.is_help_request && (
                                                <span className="ml-3 px-3 py-1 bg-amber-500 text-white rounded-full text-[8px] uppercase tracking-widest inline-flex items-center gap-1">
                                                    <Shield size={10} /> Help Request
                                                </span>
                                            )}
                                        </h4>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                            {new Date(comment.created_at).toLocaleDateString()} • {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                {comment.status === 'resolved' && (
                                    <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                        <CheckCircle size={12} /> Resolved
                                    </div>
                                )}
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                                {comment.content}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CommentSection;
