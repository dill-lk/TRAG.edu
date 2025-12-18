
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Camera, Maximize2, Minimize2, Volume2, VolumeX, Terminal, Cpu } from 'lucide-react';
import { ChatMessage } from '../types';
import { marked } from 'marked';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from '../supabase';

interface TragAIWidgetProps {
  currentContext: string;
}

// Hardcoded API Key as requested by the user
const GEMINI_API_KEY = "AIzaSyDubin-_dKhQqb7-m1S4c7JsOdaWAYJMes";

const TragAIWidget: React.FC<TragAIWidgetProps> = ({ currentContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState<'chat' | 'planner' | 'solver'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: '### Ayubowan! I am your TRAG Study Assistant\nHow can I help you today? I can explain GCE exam questions, help with study schedules, or teach you specific topics in **English** or **සිංහල**. \n\nYou can also upload a photo of any question from a paper!' }
  ]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSend = async () => {
    const userMsg = input.trim();
    if (!userMsg && !selectedImage) return;

    setMessages(prev => [...prev, {
      role: 'user',
      text: userMsg || "Analyze paper image.",
      image: selectedImage || undefined
    }]);

    const currentInput = userMsg;
    const currentImg = selectedImage;

    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: `You are 'TRAG Study Assistant', a professional educational expert for Sri Lankan students. 
      CONTEXT: ${currentContext}.
      FORMAT: Always use clean Markdown for better readability. Use bold for key terms. Use LaTeX for math.
      STYLE: Professional, encouraging, and clear. 
      BILINGUAL: You are fluent in English and Sinhala. If the user asks in Sinhala, respond in Sinhala. If English, respond in English. If bilingual, use both where helpful.
      GOAL: Provide high-quality tutoring aligned with the Sri Lankan Ministry of Education syllabus.`
      });

      const prompt = mode === 'planner'
        ? `Create a detailed study plan for: ${currentInput}.`
        : mode === 'solver'
          ? `Explain this question step-by-step: ${currentInput || 'attached paper image'}. Ensure clear methodology.`
          : `Teach me this topic clearly: ${currentInput}.`;

      const parts: any[] = [prompt];
      if (currentImg) {
        const base64Data = currentImg.includes('base64,') ? currentImg.split('base64,')[1] : currentImg;
        parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Data
          }
        });
      }

      const result = await model.generateContentStream(parts);

      let fullText = "";
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].text = fullText;
          return updated;
        });
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: '### System Notice\nI am having difficulty connecting to the study hub. Please check your API key and try again.', isError: true }]);
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
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const renderMarkdown = (text: string) => {
    const html = marked.parse(text);
    return { __html: html };
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 z-[60] group transition-all duration-700 ${isOpen ? 'translate-y-24 opacity-0' : 'translate-y-0 opacity-100'}`}
      >
        <div className="relative w-20 h-20 rounded-[2.5rem] glass-card dark:bg-blue-600 flex items-center justify-center shadow-3xl border-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse"></div>
          <Cpu size={36} className="relative z-10 text-slate-900 dark:text-white group-hover:text-white transition-colors" />
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:items-end md:justify-end md:p-8 pointer-events-none">
          <div className={`
            pointer-events-auto w-full transition-all duration-500 cubic-bezier(0.23, 1, 0.32, 1)
            ${isExpanded ? 'max-w-[1100px] h-[92vh]' : 'max-w-[480px] h-[780px]'}
            glass-card dark:bg-slate-950/95 rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in zoom-in-95
          `}>

            <div className="p-8 pb-6 bg-white/10 dark:bg-slate-900/40 border-b border-white/5">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-5">
                  <Terminal size={32} className="text-blue-600" />
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Study Assistant</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Bilingual Academic Support</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setIsExpanded(!isExpanded)} className="p-3.5 glass-card rounded-2xl text-slate-400 hover:text-blue-500 transition-all border-none">
                    {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                  </button>
                  <button onClick={() => setIsOpen(false)} className="p-3.5 glass-card rounded-2xl text-slate-400 hover:text-red-500 transition-all border-none">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-[1.5rem] gap-1.5">
                <button onClick={() => setMode('chat')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'chat' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xl' : 'text-slate-400'}`}>Tutor</button>
                <button onClick={() => setMode('planner')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'planner' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-400'}`}>Study Plan</button>
                <button onClick={() => setMode('solver')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'solver' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400'}`}>Solve Paper</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-10 scroll-smooth custom-scrollbar">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-6`}>
                  <div className={`
                    max-w-[92%] p-8 rounded-[2.8rem] shadow-sm relative overflow-hidden
                    ${msg.role === 'user'
                      ? 'bg-slate-900 dark:bg-blue-600 text-white rounded-tr-none'
                      : 'glass-card dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-tl-none border-white/5'}
                  `}>
                    {msg.image && <img src={msg.image} className="w-full rounded-[2rem] mb-8 shadow-2xl border border-white/10" alt="paper scan" />}
                    <div
                      className="prose-content text-[15px] leading-relaxed font-medium"
                      dangerouslySetInnerHTML={renderMarkdown(msg.text)}
                    />
                    {msg.role === 'model' && msg.text && (
                      <button onClick={() => toggleSpeech(msg.text)} className="absolute bottom-4 right-4 p-3 glass-card rounded-2xl text-slate-400 hover:text-blue-500 transition-all">
                        {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-8 bg-white/5 dark:bg-slate-900/40 border-t border-white/5">
              {selectedImage && (
                <div className="mb-6 flex items-center gap-5 animate-in slide-in-from-bottom-4">
                  <div className="relative w-28 h-28">
                    <img src={selectedImage} className="w-full h-full object-cover rounded-[2rem] border-2 border-blue-500 shadow-2xl" />
                    <button onClick={() => setSelectedImage(null)} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2.5 shadow-xl transition-transform hover:scale-110"><X size={16} /></button>
                  </div>
                  <div className="text-[10px] font-black uppercase text-blue-500 tracking-[0.4em] animate-pulse">Paper Fragment Buffered</div>
                </div>
              )}
              <div className="flex items-center gap-5">
                <button onClick={() => fileInputRef.current?.click()} className="p-6 glass-card rounded-[2rem] text-blue-500 hover:bg-blue-600 hover:text-white transition-all shadow-xl border-none" title="Scan Paper">
                  <Camera size={28} />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleImageSelect} className="hidden" accept="image/*" />
                <div className="flex-1 relative">
                  <input
                    type="text" value={input} onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your academic question here..."
                    className="w-full glass-card dark:bg-slate-800 rounded-[2rem] py-6 px-10 outline-none text-[16px] font-bold shadow-inner focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
                <button onClick={handleSend} disabled={(!input.trim() && !selectedImage) || isLoading} className="p-6 bg-blue-600 text-white rounded-[2rem] shadow-[0_20px_40px_rgba(37,99,235,0.3)] disabled:opacity-50 transition-all hover:scale-[1.05] active:scale-95">
                  {isLoading ? <Loader2 size={28} className="animate-spin" /> : <Send size={28} />}
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
