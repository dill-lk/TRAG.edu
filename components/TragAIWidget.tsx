import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Send, Camera, Maximize2, Minimize2, 
  Volume2, VolumeX, Sparkles, Trash2, 
  AlertCircle, BookOpen, BrainCircuit,
  Paperclip, Mic, ChevronRight, Zap
} from 'lucide-react';
import { ChatMessage } from '../types';
import { marked } from 'marked';
import { streamChatWithTragAI } from '../services/geminiService';

interface TragAIWidgetProps {
  currentContext: string;
}

const TragAIWidget: React.FC<TragAIWidgetProps> = ({ currentContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState<'chat' | 'planner' | 'solver'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model', 
      text: "### ✨ Ayubowan! \nI'm **TragAI 2.5**, your advanced study companion. \n\nI can help you with:\n* 📚 **Subject Explanations**\n* 📅 **Study Planning**\n* 🧩 **Past Paper Solutions**\n\n*What shall we focus on today?*" 
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isLoading]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setMode('solver');
        if (!isOpen) setIsOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'model', 
        text: '### 🧹 Chat Reset\nMemory cleared. Ready for a new topic!'
      }
    ]);
  };

  const handleSend = async () => {
    const userMsgText = input.trim();
    if (!userMsgText && !selectedImage) return;

    const newUserMessage: ChatMessage = {
      role: 'user',
      text: userMsgText || (selectedImage ? "Analyzing attached content..." : ""),
      image: selectedImage || undefined
    };

    setMessages(prev => [...prev, newUserMessage]);
    
    const currentInput = userMsgText;
    const currentImg = selectedImage;

    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    const historyForService = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    try {
      // Add empty model message for streaming
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      const userContent = mode === 'planner'
        ? `Create a detailed study plan for: ${currentInput}.`
        : mode === 'solver'
          ? `Solve and explain this problem: ${currentInput || 'attached image'}.` 
          : currentInput;

      let fullResponse = "";
      
      await streamChatWithTragAI(
        historyForService,
        userContent,
        (chunk) => {
          fullResponse += chunk;
          setMessages(prev => {
            const newMsgs = [...prev];
            if (newMsgs.length > 0) {
              newMsgs[newMsgs.length - 1].text = fullResponse;
            }
            return newMsgs;
          });
        },
        currentContext,
        currentImg || undefined
      );

    } catch (err: any) {
      setMessages(prev => {
         const newMsgs = [...prev];
         if (newMsgs[newMsgs.length - 1].text === '') newMsgs.pop(); 
         return [...newMsgs, {
            role: 'model',
            text: `### ⚠️ Network Interruption\n${err.message || 'Please check your connection.'}`,
            isError: true
          }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSpeech = (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text.replace(/[#*`$]/g, ''));
      utterance.rate = 1.1;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const renderMarkdown = (text: string) => {
    const html = marked.parse(text || "");
    return { __html: html };
  };

  return (
    <>
      {/* Floating Launcher */}
      <button
        onClick={() => setIsOpen(true)}
        className={`
          fixed bottom-6 right-6 z-[60] group transition-all duration-500 ease-out
          ${isOpen ? 'translate-y-24 opacity-0 scale-75' : 'translate-y-0 opacity-100 scale-100'}
        `}
      >
        <div className="relative w-16 h-16 rounded-full bg-slate-900 dark:bg-black flex items-center justify-center shadow-2xl overflow-hidden border border-white/10 group-hover:scale-110 transition-transform">
          {/* Animated Gradient Border */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20 group-hover:opacity-40 animate-spin-slow" />
          
          <div className="relative z-10 text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <Sparkles size={28} className="animate-pulse-glow" />
          </div>
          
          {/* Ripple Effect Ring */}
          <div className="absolute inset-0 rounded-full border border-white/20 scale-0 group-hover:scale-150 transition-transform duration-700 opacity-0 group-hover:opacity-100" />
        </div>
      </button>

      {/* Main Widget Container */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:items-end md:justify-end md:p-6 pointer-events-none">
          <div className={`
            pointer-events-auto w-full transition-all duration-500 cubic-bezier(0.19, 1, 0.22, 1)
            ${isExpanded ? 'max-w-[1000px] h-[85vh]' : 'max-w-[420px] h-[700px] max-h-[90vh]'}
            bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl
            rounded-[2.5rem] shadow-[0_40px_80px_-12px_rgba(0,0,0,0.5)] 
            border border-white/20 dark:border-white/10 flex flex-col overflow-hidden 
            animate-slide-up origin-bottom-right
          `}>
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100/50 dark:border-white/5 flex justify-between items-center bg-white/40 dark:bg-slate-900/40">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <BrainCircuit size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">TragAI <span className="text-blue-500 text-xs align-top">2.5</span></h3>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Neural Link Active
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button onClick={clearChat} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors" title="Clear Chat">
                  <Trash2 size={18} />
                </button>
                <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-colors">
                  {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="px-6 py-2 bg-slate-50/50 dark:bg-slate-900/20">
              <div className="flex p-1 bg-slate-200/50 dark:bg-black/20 rounded-2xl gap-1">
                {[ 
                  { id: 'chat', icon: Zap, label: 'Tutor' },
                  { id: 'planner', icon: BookOpen, label: 'Plan' },
                  { id: 'solver', icon: Sparkles, label: 'Solve' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setMode(item.id as any)}
                    className={`
                      flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-300
                      ${mode === item.id 
                        ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}
                    `}
                  >
                    <item.icon size={14} className={mode === item.id ? 'animate-pulse' : ''} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar bg-slate-50/30 dark:bg-black/5">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up group`}>
                  
                  {msg.role === 'model' && (
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0 mr-3 shadow-sm mt-1">
                      <Sparkles size={14} className="text-blue-500" />
                    </div>
                  )}

                  <div className={`
                    max-w-[85%] rounded-3xl p-5 shadow-sm relative text-sm leading-6
                    ${msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none ml-12 shadow-blue-500/20' 
                      : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-none mr-12'}
                    ${msg.isError ? 'border-red-500/50 bg-red-50 dark:bg-red-900/10' : ''}
                  `}>
                    {msg.image && (
                      <div className="mb-4 rounded-2xl overflow-hidden border border-white/20">
                        <img src={msg.image} className="w-full h-auto" alt="Attachment" />
                      </div>
                    )}
                    
                    {msg.isError && (
                      <div className="flex items-center gap-2 text-red-500 mb-2 font-bold">
                        <AlertCircle size={16} /> <span>Error</span>
                      </div>
                    )}

                    {/* Markdown Content */}
                    <div 
                      className={`prose prose-sm max-w-none 
                        ${msg.role === 'user' ? 'prose-invert' : 'dark:prose-invert'}
                        prose-p:m-0 prose-headings:mb-2 prose-headings:mt-4 prose-ul:my-2
                      `}
                      dangerouslySetInnerHTML={renderMarkdown(msg.text)} 
                    />

                    {/* Speech Toggle (Hover) */}
                    {msg.role === 'model' && !msg.isError && msg.text && (
                      <button 
                        onClick={() => toggleSpeech(msg.text)}
                        className="absolute -right-10 top-2 p-2 text-slate-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start animate-pulse pl-12">
                   <div className="flex space-x-1.5 p-4 bg-slate-100 dark:bg-slate-900 rounded-3xl rounded-bl-none w-24 items-center justify-center">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-typing-dot" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-typing-dot" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-typing-dot" style={{ animationDelay: '300ms' }} />
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-5 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-white/5">
              {selectedImage && (
                <div className="mb-3 flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-500/30">
                  <img src={selectedImage} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">Image Attached</p>
                    <p className="text-[10px] text-slate-500">Ready for analysis</p>
                  </div>
                  <button onClick={() => setSelectedImage(null)} className="p-2 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-full text-blue-500 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className="flex items-end gap-2">
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="p-4 rounded-3xl bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all"
                >
                  <Paperclip size={20} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageSelect} 
                  className="hidden" 
                  accept="image/*" 
                />
                
                <div className="flex-1 relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if(e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={mode === 'chat' ? "Ask anything..." : mode === 'planner' ? "Describe your goals..." : "Paste question..."}
                    className="w-full bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-[24px] py-4 px-5 pr-12 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-medium resize-none custom-scrollbar"
                    rows={1}
                    style={{ minHeight: '56px', maxHeight: '120px' }}
                  />
                  <div className="absolute right-3 bottom-3">
                     {/* Optional Mic Icon (Visual only for now) */}
                     <Mic size={18} className="text-slate-400 hover:text-blue-500 cursor-pointer transition-colors" />
                  </div>
                </div>

                <button 
                  onClick={handleSend} 
                  disabled={(!input.trim() && !selectedImage) || isLoading}
                  className={`
                    p-4 rounded-[24px] transition-all duration-300 shadow-lg
                    ${(!input.trim() && !selectedImage) || isLoading 
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 shadow-none' 
                      : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white hover:scale-105 active:scale-95 shadow-blue-500/30'}
                  `}
                >
                  <Send size={20} className={isLoading ? 'hidden' : ''} />
                  {isLoading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default TragAIWidget;