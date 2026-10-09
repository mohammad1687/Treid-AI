import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Image as ImageIcon, 
  Paperclip, 
  Trash2, 
  Bot, 
  User, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ChevronDown, 
  X, 
  FileText, 
  CheckCircle2, 
  Copy, 
  Check, 
  Maximize2,
  Cpu,
  Layers,
  ArrowRight,
  Mic,
  MicOff,
  Flame,
  Search,
  Brain
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, AIModelConfig, KnowledgeItem, UserSettings } from '../types';

interface ChatViewProps {
  messages: Message[];
  onSendMessage: (text: string, images?: string[], files?: { name: string; content: string }[]) => void;
  isLoading: boolean;
  activeModel: AIModelConfig | undefined;
  models: AIModelConfig[];
  onSelectModel: (modelId: string) => void;
  activeKnowledge: KnowledgeItem[];
  onClearChat: () => void;
  onNavigateToKnowledge: () => void;
  onNavigateToModels: () => void;
  settings?: UserSettings;
  onUpdateSettings?: (settings: UserSettings) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  isLoading,
  activeModel,
  models,
  onSelectModel,
  activeKnowledge,
  onClearChat,
  onNavigateToKnowledge,
  onNavigateToModels,
  settings,
}) => {
  const [inputText, setInputText] = useState('');
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; content: string }[]>([]);
  
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [deepSearchEnabled, setDeepSearchEnabled] = useState(false);
  const [deepThinkEnabled, setDeepThinkEnabled] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const prevMsgCountRef = useRef(messages.length);

  // Web Audio Synthesizer for high-tech terminal sound effects
  const playAudioEffect = (type: 'send' | 'receive' | 'alert') => {
    if (settings?.soundEffects === false) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'send') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'receive') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.setValueAtTime(680, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.14);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.14);
      } else if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.18);
      }
    } catch (e) {
      // Audio might be blocked prior to interaction
    }
  };

  useEffect(() => {
    if (messages.length > prevMsgCountRef.current) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.role === 'assistant') {
        playAudioEffect('receive');
        if (settings?.enableRiskWarnings !== false && (lastMsg.content.includes('هشدار') || lastMsg.content.includes('ریسک') || lastMsg.content.includes('ضرر'))) {
          setTimeout(() => playAudioEffect('alert'), 200);
        }
      }
    }
    prevMsgCountRef.current = messages.length;
  }, [messages.length, settings?.soundEffects, settings?.enableRiskWarnings]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const activeModels = models.filter((m) => m.isActive);

  // Voice Dictation
  const toggleDictation = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('مرورگر شما از قابلیت تشخیص گفتار صوتی پشتیبانی نمی‌کند.');
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }
    try {
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRec();
      recognition.lang = settings?.language === 'en' ? 'en-US' : 'fa-IR';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? prev + ' ' + transcript : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  // Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setAttachedImages((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      }
    }
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  // File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedFiles((prev) => [
          ...prev,
          { name: file.name, content: reader.result as string }
        ]);
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && attachedImages.length === 0 && attachedFiles.length === 0) || isLoading) {
      return;
    }

    let finalPrompt = inputText.trim();
    if (deepThinkEnabled) {
      finalPrompt = `[تحلیل عمیق منطقی و بررسی ساختار چندتایم‌فریمی]:\n` + finalPrompt;
    }
    if (deepSearchEnabled) {
      finalPrompt = `[بررسی اخبار مارکت و سنتیمنت آنلاین]:\n` + finalPrompt;
    }

    playAudioEffect('send');
    onSendMessage(finalPrompt, attachedImages, attachedFiles);

    setInputText('');
    setAttachedImages([]);
    setAttachedFiles([]);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const detectSignal = (content: string) => {
    const lower = content.toLowerCase();
    if (content.includes('سیگنال خرید') || content.includes('🟢 خرید') || content.includes('فرمان خرید') || lower.includes('buy signal') || lower.includes('long entry')) {
      return { type: 'BUY', label: 'سیگنال تایید شده خرید (LONG)', color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' };
    }
    if (content.includes('سیگنال فروش') || content.includes('🔴 فروش') || content.includes('فرمان فروش') || lower.includes('sell signal') || lower.includes('short entry')) {
      return { type: 'SELL', label: 'سیگنال تایید شده فروش (SHORT)', color: 'border-rose-500/50 bg-rose-500/10 text-rose-300' };
    }
    return null;
  };

  const getSmartSuggestions = (content: string) => {
    const suggestions: string[] = [];
    if (content.includes('طلا') || content.includes('XAU')) {
      suggestions.push('نقطه دقیق استاپ‌لاس و اهداف TP طلا کجاست؟');
      suggestions.push('آیا برای سشن نیویورک روی طلا سناریوی نقض وجود دارد؟');
    } else if (content.includes('بیتکوین') || content.includes('BTC')) {
      suggestions.push('سطح نقدینگی بعدی نهنگ‌ها روی بیتکوین کجاست؟');
      suggestions.push('اگر الگوی فعلی فیل شود، سناریوی ریزش تا چه سطحی است؟');
    } else {
      suggestions.push('محاسبه دقیق حجم ورود با ۱٪ ریسک حساب');
      suggestions.push('تحلیل سنتیمنت بازار و تاییدیه اندیکاتورها');
    }
    return suggestions.slice(0, 2);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#030712] overflow-hidden select-none relative">
      
      {/* Top Liquid Glass Header Bar */}
      <header className="h-16 bg-[#050a18]/85 border-b border-white/[0.08] backdrop-blur-3xl px-4 sm:px-6 flex items-center justify-between z-20 flex-shrink-0 shadow-lg">
        
        {/* Model Selector Dropdown */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowModelDropdown(!showModelDropdown)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl liquid-glass-btn text-xs font-bold text-cyan-200 transition-all cursor-pointer shadow-sm"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>{activeModel ? activeModel.name.split('(')[0].trim() : 'انتخاب مدل هوش مصنوعی'}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-cyan-400 transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
          </motion.button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {showModelDropdown && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                className="absolute right-0 mt-2 w-[calc(100vw-32px)] max-w-xs sm:w-72 liquid-glass-card rounded-2xl shadow-2xl p-2.5 z-50"
              >
                <div className="text-[10px] font-bold text-slate-400 px-2.5 py-1.5 uppercase border-b border-white/10 mb-1">
                  موتورهای فعال هوش مصنوعی
                </div>
                
                {activeModels.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-400">
                    هیچ مدلی فعال نیست.
                    <button 
                      onClick={() => { setShowModelDropdown(false); onNavigateToModels(); }}
                      className="block w-full mt-2 text-cyan-400 hover:underline font-bold cursor-pointer"
                    >
                      تنظیم کلیدهای API
                    </button>
                  </div>
                ) : (
                  activeModels.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        onSelectModel(m.id);
                        setShowModelDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs text-right transition-all cursor-pointer ${
                        activeModel?.id === m.id
                          ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/40'
                          : 'text-slate-300 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate font-mono">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />
                        <span className="truncate">{m.name}</span>
                      </div>
                      {activeModel?.id === m.id && <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
                    </button>
                  ))
                )}

                <div className="mt-2 pt-2 border-t border-white/10 px-1">
                  <button
                    onClick={() => {
                      setShowModelDropdown(false);
                      onNavigateToModels();
                    }}
                    className="w-full text-center text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold py-1 rounded-xl hover:bg-white/[0.04] transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>مدیریت کلیدهای API</span>
                    <ArrowRight className="w-3 h-3 rotate-180" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Active Knowledge Pill */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          onClick={onNavigateToKnowledge}
          className="hidden md:flex items-center gap-2 liquid-glass-btn px-4 py-1.5 rounded-full text-xs text-cyan-300 font-mono cursor-pointer transition-all border border-cyan-500/30"
          title="قوانین فعال در پایگاه داده"
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>⚡ {activeKnowledge.length} قانون استراتژی فعال در هوش مصنوعی</span>
        </motion.div>

        {/* Clear Chat Screen */}
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onClearChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl liquid-glass-btn hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/10 hover:border-rose-500/40 text-xs transition-all cursor-pointer"
              title="پاک کردن این گفتگو"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">پاک کردن</span>
            </motion.button>
          )}
        </div>

      </header>

      {/* Main Messages Feed */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8 space-y-5 pb-28 md:pb-6 custom-scrollbar relative">
        
        {/* Welcome Screen when chat is empty */}
        {messages.length === 0 ? (
          <div className="max-w-3xl mx-auto my-auto py-10 text-center animate-fade-in flex flex-col items-center justify-center min-h-[60vh]">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-500 p-[1px] shadow-2xl shadow-cyan-500/25 mb-6"
            >
              <div className="w-full h-full bg-[#050a18] rounded-[23px] flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-cyan-300" />
              </div>
            </motion.div>

            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2.5 bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
              اتاق تحلیل معاملاتی ProTrade AI
            </h2>
            <p className="text-sm text-slate-300 max-w-xl mb-7 leading-relaxed">
              چارت یا سوال تخصصی ترید خود را ارسال کنید. هوش مصنوعی بر اساس <span className="text-cyan-300 font-bold">قوانین فعال شما در پایگاه استراتژی‌ها</span> پاسخ خواهد داد.
            </p>

            {/* Quick Prompt Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-2xl text-right">
              {[
                { title: "📊 تحلیل تکنیکال چارت بیتکوین (BTC/USDT)", desc: "بررسی سطوح کلیدی حمایت، مقاومت و سناریوی صعودی/نزولی" },
                { title: "⚡ بررسی ساختار بازار و ریسک به ریوارد طلا", desc: "محاسبه دقیق حد ضرر (Stop Loss) و اهداف سود (Take Profit)" },
                { title: "🎯 ارزیابی الگوهای پرایس اکشن و کندل‌استیک", desc: "تشخیص نقدینگی (Liquidity) و اوردر بلاک‌های اسمارت مانی" },
                { title: "🛡️ محاسبه حجم پوزیشن بر اساس ۱٪ ریسک", desc: "مدیریت سرمایه حرفه‌ای برای جلوگیری از کال مارجین" }
              ].map((prompt, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSendMessage(prompt.title)}
                  className="liquid-glass-card hover:border-cyan-500/40 p-4 rounded-2xl text-right transition-all group flex flex-col justify-between shadow-lg cursor-pointer glass-specular-sheen"
                >
                  <div className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors mb-1">
                    {prompt.title}
                  </div>
                  <div className="text-[11px] text-slate-400 leading-normal">
                    {prompt.desc}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          /* Render Messages */
          <div className="max-w-4xl mx-auto space-y-6 pb-4">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              const signal = !isUser ? detectSignal(msg.content) : null;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-2.5 sm:gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                    isUser
                      ? 'bg-blue-600 text-white border border-blue-400/40 shadow-blue-600/20'
                      : 'liquid-glass-cyan text-cyan-300'
                  }`}>
                    {isUser ? <User className="w-4 h-4 sm:w-5 sm:h-5" /> : <Bot className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </div>

                  {/* Message Bubble Container */}
                  <div className={`flex-1 min-w-0 max-w-[92%] sm:max-w-[85%] ${isUser ? 'text-right' : 'text-right'}`}>
                    
                    {/* Header meta */}
                    <div className={`flex items-center gap-2 text-[11px] text-slate-400 mb-1.5 ${isUser ? 'justify-start' : 'justify-start'}`}>
                      <span className="font-bold text-slate-200">{isUser ? 'شما (معامله‌گر)' : 'TradeMind AI'}</span>
                      {msg.modelUsed && (
                        <span className="bg-cyan-500/15 text-cyan-300 px-2 py-0.5 rounded-md font-mono text-[10px] border border-cyan-500/30">
                          {msg.modelUsed}
                        </span>
                      )}
                      <span className="font-mono text-slate-500 text-[10px]">
                        {new Date(msg.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Trade Signal Badge */}
                    {signal && (
                      <div className={`mb-3 p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold font-mono shadow-md ${signal.color}`}>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          <span>{signal.label}</span>
                        </div>
                        <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-black/25 font-mono">SIGNAL CONFIRMED</span>
                      </div>
                    )}

                    {/* Bubble Content */}
                    <div className={`p-4 sm:p-5 rounded-3xl shadow-xl transition-all ${
                      isUser
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none border border-cyan-400/30 font-medium text-sm leading-relaxed'
                        : 'liquid-glass-card text-slate-100 rounded-tl-none leading-relaxed'
                    }`}>
                      
                      {/* Attached Images */}
                      {msg.images && msg.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {msg.images.map((img, i) => (
                            <div 
                              key={i} 
                              onClick={() => setPreviewImage(img)}
                              className="relative rounded-2xl overflow-hidden border border-white/20 cursor-pointer group max-h-48 bg-black/40 flex items-center justify-center"
                            >
                              <img src={img} alt="chart" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <Maximize2 className="w-6 h-6" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Attached Files */}
                      {msg.files && msg.files.length > 0 && (
                        <div className="space-y-1.5 mb-3">
                          {msg.files.map((f, i) => (
                            <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-black/30 border border-white/10 text-xs font-mono text-cyan-300">
                              <FileText className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{f.name}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Content Render */}
                      {isUser ? (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      ) : (
                        <div className="markdown-body text-sm prose prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}

                    </div>

                    {/* Footer Tools for AI messages */}
                    {!isUser && (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <button
                            onClick={() => copyToClipboard(msg.content, msg.id)}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-xl liquid-glass-btn text-[11px] cursor-pointer"
                            title="کپی متن تحلیل"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-cyan-400" />
                                <span className="text-cyan-400">کپی شد</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>کپی تحلیل</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Interactive Follow-up Suggestions */}
                        {settings?.enableAutoSuggestions !== false && idx === messages.length - 1 && !isLoading && (
                          <div className="pt-3 border-t border-white/10 space-y-2.5 animate-fade-in">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                              <span>پیشنهادات هوشمند بعدی:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {getSmartSuggestions(msg.content).map((sug, sIdx) => (
                                <motion.button
                                  key={sIdx}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => onSendMessage(sug)}
                                  className="text-xs liquid-glass-btn text-slate-300 hover:text-cyan-300 rounded-2xl px-3.5 py-2 transition-all text-right flex items-center gap-2 group cursor-pointer shadow-sm border border-white/10"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 group-hover:scale-125 transition-transform" />
                                  <span>{sug}</span>
                                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400 rotate-180" />
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </motion.div>
              );
            })}

            {/* Generating State */}
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-4"
              >
                <div className="w-9 h-9 rounded-2xl liquid-glass-cyan text-cyan-300 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Bot className="w-5 h-5 animate-spin" />
                </div>
                <div className="liquid-glass-card p-4 rounded-3xl rounded-tl-none shadow-xl text-xs text-slate-300 flex items-center gap-3">
                  <div className="flex space-x-1.5 space-x-reverse">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                  </div>
                  <span className="font-mono text-cyan-300 font-semibold">درحال بررسی چارت و انطباق با قوانین معاملاتی شما...</span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

      </div>

      {/* Floating Liquid Glass Input Bar at Bottom */}
      <div className="p-2.5 sm:p-4 bg-[#050a18]/90 border-t border-white/[0.08] backdrop-blur-3xl z-20 flex-shrink-0 shadow-2xl">
        <div className="max-w-4xl mx-auto">
          
          {/* Attached Files & Images Pill Previews */}
          {(attachedImages.length > 0 || attachedFiles.length > 0) && (
            <div className="flex items-center gap-2 mb-2.5 overflow-x-auto pb-1 custom-scrollbar">
              {attachedImages.map((img, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden border border-cyan-400/40 w-12 h-12 flex-shrink-0">
                  <img src={img} alt="preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setAttachedImages(attachedImages.filter((_, idx) => idx !== i))}
                    className="absolute inset-0 bg-rose-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {attachedFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl liquid-glass-btn text-xs text-cyan-300 font-mono flex-shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[120px]">{f.name}</span>
                  <button onClick={() => setAttachedFiles(attachedFiles.filter((_, idx) => idx !== i))}>
                    <X className="w-3 h-3 hover:text-rose-400" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Controls Row */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            
            <input 
              ref={imageInputRef} 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={handleImageUpload} 
              className="hidden" 
            />
            <input 
              ref={fileInputRef} 
              type="file" 
              multiple 
              onChange={handleFileUpload} 
              className="hidden" 
            />

            {/* Quick Upload Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="p-2 sm:p-2.5 rounded-xl liquid-glass-btn text-slate-300 hover:text-cyan-300 cursor-pointer transition-all"
                title="آپلود تصویر چارت"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 sm:p-2.5 rounded-xl liquid-glass-btn text-slate-300 hover:text-cyan-300 cursor-pointer transition-all"
                title="پیوست فایل تحلیل یا دیتا"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={toggleDictation}
                className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer ${
                  isListening 
                    ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/40' 
                    : 'liquid-glass-btn text-slate-300 hover:text-cyan-300'
                }`}
                title="تبدیل صدا به متن"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            {/* Text Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="سوال تخصصی، نماد یا تحلیل خود را بنویسید..."
                className="w-full liquid-glass-input rounded-2xl py-3 px-4 text-xs sm:text-sm text-slate-100 placeholder-slate-400 outline-none"
              />
            </div>

            {/* Send Button with Shimmer Sheen */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={(!inputText.trim() && attachedImages.length === 0 && attachedFiles.length === 0) || isLoading}
              className={`p-3 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-lg relative overflow-hidden ${
                (!inputText.trim() && attachedImages.length === 0 && attachedFiles.length === 0) || isLoading
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-cyan-600/30 border border-cyan-400/40'
              }`}
            >
              <Send className="w-4 h-4 rotate-180" />
            </motion.button>
          </form>

        </div>
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-pointer"
          >
            <div className="relative max-w-4xl max-h-[90vh]">
              <img src={previewImage} alt="full preview" className="max-w-full max-h-[85vh] rounded-2xl border border-white/20 shadow-2xl" />
              <button 
                onClick={() => setPreviewImage(null)}
                className="absolute top-3 left-3 bg-black/60 hover:bg-black text-white p-2 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
