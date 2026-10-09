import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Target, 
  Upload, 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Copy, 
  Check, 
  Zap, 
  Database, 
  RefreshCw, 
  Clock, 
  Sparkles,
  MessageSquare,
  Calculator,
  Crosshair,
  Sliders,
  Maximize2,
  ChevronRight,
  ShieldCheck,
  Flame,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { KnowledgeItem, AIModelConfig, UserSettings, SniperSignalResult } from '../types';
import { LocalTradingEngine } from '../services/LocalTradingEngine';

const cleanTargetValue = (val: string | number | undefined | null): string => {
  if (val === undefined || val === null) return '';
  const str = val.toString().trim();
  const match = str.replace(/,/g, '').match(/(\d+(\.\d+)?)/);
  if (match) {
    return match[1];
  }
  return str;
};

interface SniperDeskViewProps {
  knowledgeItems: KnowledgeItem[];
  models: AIModelConfig[];
  settings?: UserSettings;
  onNavigateToKnowledge: () => void;
  onSendSignalToChat?: (text: string) => void;
}

export const SniperDeskView: React.FC<SniperDeskViewProps> = ({
  knowledgeItems,
  models,
  settings,
  onNavigateToKnowledge,
  onSendSignalToChat,
}) => {
  // Input parameters
  const [symbol, setSymbol] = useState('');
  const [timeframe, setTimeframe] = useState(settings?.defaultTimeframe || '15M');
  const [note, setNote] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [validity, setValidity] = useState('30m');
  const [strategyMethod, setStrategyMethod] = useState('SMC');
  const [riskMode, setRiskMode] = useState('normal');
  const [direction, setDirection] = useState<'AUTO' | 'BUY_ONLY' | 'SELL_ONLY'>('AUTO');
  const [leverage, setLeverage] = useState<string>('10x');
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(['RSI', 'EMA 200']);
  const [configTab, setConfigTab] = useState<'basic' | 'advanced' | 'indicators'>('basic');

  // Execution state
  const [isScanning, setIsScanning] = useState(false);
  const [scanningStep, setScanningStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentSignal, setCurrentSignal] = useState<SniperSignalResult | null>(null);
  const [history, setHistory] = useState<SniperSignalResult[]>([]);
  const [copied, setCopied] = useState(false);

  // Position Sizing & Live Simulation
  const [balance, setBalance] = useState<number>(10000);
  const [riskPercent, setRiskPercent] = useState<number>(1);
  const [simulatedTPStep, setSimulatedTPStep] = useState<number>(0); // 0: none, 1: TP1, 2: TP2, 3: TP3, 4: RiskFree

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Futuristic Holographic Scanning Telemetry Messages
  const scanTelemetry = [
    { title: 'تحلیل ساختار مارکت و نقدینگی', sub: 'اسکن اوردربلاک‌های پرایس‌اکشن و جذب نقدینگی استاپ‌ها' },
    { title: 'محاسبه تاییدیه الگوهای اسمارت‌مانی', sub: 'تطبیق ساختار با قوانین استراتژی‌های فعال پایگاه داده' },
    { title: 'تعیین محدوده بهینه ورود و حد ضرر', sub: 'محاسبه نسبت ریسک به ریوارد و گام‌های سیو سود (TP1, TP2, TP3)' },
    { title: 'اعتبارسنجی نهایی و صدور فرمان اسنایپر', sub: 'آماده‌سازی پوزیشن معاملاتی با بیشترین درجه قطعیت' }
  ];

  useEffect(() => {
    let interval: any;
    if (isScanning) {
      setScanningStep(0);
      interval = setInterval(() => {
        setScanningStep((prev) => (prev + 1) % scanTelemetry.length);
      }, 850);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  // Load history from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('trademind_sniper_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const saveHistory = (newSignal: SniperSignalResult) => {
    const updated = [newSignal, ...history].slice(0, 20);
    setHistory(updated);
    try {
      localStorage.setItem('trademind_sniper_history', JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  const activeKnowledge = knowledgeItems.filter((k) => k.isActive);
  const activeModel = models.find((m) => m.isActive) || models[0];

  // Sound effects synthesizer
  const playSignalSound = (action: 'BUY' | 'SELL' | 'WAIT') => {
    if (settings?.soundEffects === false) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (action === 'BUY') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      } else if (action === 'SELL') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(350, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch (e) {
      // ignore
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImg = file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp)$/i.test(file.name);
    if (!isImg) {
      setErrorMsg('لطفاً فقط فایل تصویری (PNG, JPG) بارگذاری کنید.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const isImg = file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp)$/i.test(file.name);
    if (!isImg) {
      setErrorMsg('لطفاً فقط فایل تصویری (PNG, JPG) انتخاب کنید.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            setSelectedImage(reader.result as string);
            setErrorMsg(null);
          };
          reader.readAsDataURL(file);
        }
        break;
      }
    }
  };

  const triggerConfettiCelebration = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f2fe', '#00f5a0', '#7928ca', '#ffffff']
      });
    } catch (e) {
      // ignore
    }
  };

  const executeSniperScan = async () => {
    if (!selectedImage && !note.trim() && !symbol.trim()) {
      setErrorMsg('لطفاً چارت را آپلود کنید یا نام نماد معاملاتی را مشخص کنید.');
      return;
    }

    setIsScanning(true);
    setErrorMsg(null);
    setCurrentSignal(null);
    setSimulatedTPStep(0);

    try {
      let res: any = null;

      try {
        const resp = await fetch('/api/sniper', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            symbol: symbol.trim() || 'MARKET CHART',
            timeframe: timeframe || '15M',
            image: selectedImage,
            note: note.trim(),
            activeKnowledge: activeKnowledge,
            riskPerTrade: settings?.riskPerTrade || '1%',
            tradingStyle: settings?.tradingStyle || 'Scalping',
            modelConfig: activeModel,
            validityInput: validity,
            strategyMethodInput: strategyMethod,
            riskModeInput: riskMode,
            direction,
            leverage,
            selectedIndicators
          })
        });

        const contentType = resp.headers.get('content-type') || '';
        if (resp.ok && contentType.includes('application/json')) {
          const data = await resp.json();
          if (data.success && data.result) {
            res = data.result;
          } else {
            throw new Error(data.error || 'خطا در صدور سیگنال اسنایپر');
          }
        } else {
          throw new Error(`Non-JSON response (Status: ${resp.status})`);
        }
      } catch (networkOrJsonErr: any) {
        console.log('Using local trading engine for sniper signal:', networkOrJsonErr.message);
        res = await LocalTradingEngine.generateSniperSignal(
          symbol.trim() || 'XAUUSD',
          timeframe || '15M',
          note.trim(),
          activeKnowledge,
          settings?.riskPerTrade || '1%',
          activeModel,
          selectedImage,
          validity,
          strategyMethod,
          riskMode
        );
      }

      const newSig: SniperSignalResult = {
        id: 'snp_' + Date.now().toString(36),
        timestamp: Date.now(),
        symbol: symbol.trim().toUpperCase() || 'MARKET CHART',
        timeframe: timeframe || '15M',
        action: res.action || 'BUY',
        confidence: res.confidence || 88,
        entryPrice: res.entryPrice,
        stopLoss: res.stopLoss,
        takeProfit1: res.takeProfit1,
        takeProfit2: res.takeProfit2,
        takeProfit3: res.takeProfit3,
        riskRewardRatio: res.riskRewardRatio || '1 : 2.8',
        positionSizeRecommendation: res.positionSizeRecommendation || `حجم استاندارد با ۱٪ ریسک حساب`,
        reasons: Array.isArray(res.reasons) ? res.reasons : [],
        summaryNote: res.summaryNote || 'تحلیل پرایس‌اکشن بر اساس سطوح کلیدی به اتمام رسید.',
        image: selectedImage || undefined,
        validityDuration: res.validityDuration || (validity === '15m' ? '۱۵ دقیقه آینده' : validity === '30m' ? '۳۰ دقیقه آینده' : validity === '1h' ? '۱ ساعت آینده' : validity === '4h' ? '۴ ساعت آینده' : '۲۴ ساعت آینده'),
        strategyMethod: res.strategyMethod || strategyMethod,
        riskMode: res.riskMode || riskMode
      };

      setCurrentSignal(newSig);
      saveHistory(newSig);
      playSignalSound(newSig.action);
      triggerConfettiCelebration();
    } catch (err: any) {
      setErrorMsg(err.message || 'خطای شبکه در صدور سیگنال.');
    } finally {
      setIsScanning(false);
    }
  };

  const copySignalText = (sig: SniperSignalResult) => {
    const text = `🎯 سیگنال اسنایپر (${sig.symbol} - ${sig.timeframe})
===============================
⚡ وضعیت: ${sig.action === 'BUY' ? '🟢 خرید (LONG)' : sig.action === 'SELL' ? '🔴 فروش (SHORT)' : '🟡 نظاره (WAIT)'}
🔥 قطعیت هوش مصنوعی: ${sig.confidence}%
===============================
🎯 نقطه ورود: ${cleanTargetValue(sig.entryPrice) || '-'}
🛑 حد ضرر (SL): ${cleanTargetValue(sig.stopLoss) || '-'}
💰 هدف اول (TP1): ${cleanTargetValue(sig.takeProfit1) || '-'}
💰 هدف دوم (TP2): ${cleanTargetValue(sig.takeProfit2) || '-'}
💰 هدف نهایی (TP3): ${cleanTargetValue(sig.takeProfit3) || '-'}
⚖️ نسبت R/R: ${sig.riskRewardRatio || '-'}
📦 مدیریت سرمایه: ${sig.positionSizeRecommendation || '-'}
===============================
💡 تحلیل: ${sig.summaryNote}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Dynamic lot size calculations for the active signal
  const calculatedRiskAmount = (balance * riskPercent) / 100;
  let calculatedLotSize = '-';
  let stopLossDistance = 0;
  let hasValidNumbers = false;
  let cleanEntry = 0;
  let cleanSL = 0;
  let cleanTP1 = 0;
  let cleanTP2 = 0;
  let cleanTP3 = 0;

  if (currentSignal) {
    const entryNum = parseFloat(cleanTargetValue(currentSignal.entryPrice));
    const slNum = parseFloat(cleanTargetValue(currentSignal.stopLoss));
    const tp1Num = parseFloat(cleanTargetValue(currentSignal.takeProfit1));
    const tp2Num = parseFloat(cleanTargetValue(currentSignal.takeProfit2));
    const tp3Num = parseFloat(cleanTargetValue(currentSignal.takeProfit3));

    if (!isNaN(entryNum) && !isNaN(slNum) && entryNum > 0 && slNum > 0 && entryNum !== slNum) {
      cleanEntry = entryNum;
      cleanSL = slNum;
      cleanTP1 = tp1Num || 0;
      cleanTP2 = tp2Num || 0;
      cleanTP3 = tp3Num || 0;
      stopLossDistance = Math.abs(entryNum - slNum);
      hasValidNumbers = true;

      const sym = currentSignal.symbol.toUpperCase();
      if (stopLossDistance > 0) {
        if (sym.includes('XAU') || sym.includes('GOLD')) {
          calculatedLotSize = (calculatedRiskAmount / (stopLossDistance * 100)).toFixed(2) + ' Lots';
        } else if (sym.includes('BTC')) {
          calculatedLotSize = (calculatedRiskAmount / stopLossDistance).toFixed(4) + ' BTC';
        } else if (sym.includes('ETH')) {
          calculatedLotSize = (calculatedRiskAmount / stopLossDistance).toFixed(3) + ' ETH';
        } else if (sym.includes('EUR') || sym.includes('GBP') || sym.includes('USD') || sym.includes('JPY')) {
          if (sym.includes('JPY')) {
            calculatedLotSize = (calculatedRiskAmount / (stopLossDistance * 1000)).toFixed(2) + ' Lots';
          } else {
            calculatedLotSize = (calculatedRiskAmount / (stopLossDistance * 100000)).toFixed(2) + ' Lots';
          }
        } else {
          calculatedLotSize = (calculatedRiskAmount / stopLossDistance).toFixed(2) + ' Units';
        }
      }
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#030712] overflow-y-auto text-slate-100 p-3 sm:p-5 lg:p-7 pb-28 md:pb-8 custom-scrollbar select-none relative">
      
      {/* Background Liquid Ambient Light Glows */}
      <div className="absolute top-12 left-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-48 right-12 w-[350px] h-[350px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse-glow [animation-delay:2s]" />

      <div className="max-w-5xl mx-auto w-full space-y-5 sm:space-y-6 relative z-10">
        
        {/* Luxury Liquid Glass Hero Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="liquid-glass-card rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden glass-specular-sheen"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start gap-3.5 sm:gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 p-[1px] shadow-xl shadow-emerald-500/25 flex-shrink-0">
                <div className="w-full h-full bg-[#061020] rounded-[15px] flex items-center justify-center">
                  <Target className="w-6 h-6 text-emerald-400 animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-black tracking-tight bg-gradient-to-r from-white via-emerald-100 to-cyan-300 bg-clip-text text-transparent">
                    اتاق فرمان اسنایپر (Sniper Execution Terminal)
                  </h1>
                  <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-400/40 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                    HOLOGRAPHIC AI
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                  صدور مستقیم و بدون حاشیه فرمان خرید/فروش طبق <span className="text-emerald-400 font-bold">قوانین معاملاتی شما</span> و فرمولاسیون مدیریت سرمایه.
                </p>
              </div>
            </div>

            {/* Active Rules Badge */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-between sm:justify-start w-full md:w-auto gap-3 liquid-glass-btn p-2 px-3.5 rounded-2xl flex-shrink-0 border border-white/10"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-400">
                  <Database className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-100 font-mono">
                    {activeKnowledge.length} استراتژی فعال
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    VERIFIED RULES
                  </div>
                </div>
              </div>
              <button
                onClick={onNavigateToKnowledge}
                className="text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-500/40 transition-all font-semibold cursor-pointer"
              >
                تنظیم قوانین
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/* Input & Holographic Scanner Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left: Chart Drop Box with Holographic Laser Scanner */}
          <div className="lg:col-span-5 flex flex-col">
            <div 
              tabIndex={0}
              onPaste={handlePaste}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => !isScanning && fileInputRef.current?.click()}
              className={`flex-1 rounded-3xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[250px] sm:min-h-[320px] relative overflow-hidden group focus:outline-none ${
                selectedImage 
                  ? 'liquid-glass-emerald' 
                  : 'liquid-glass-card hover:border-cyan-500/40'
              }`}
            >
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                onChange={handleImageSelect} 
                className="hidden" 
              />

              {/* Holographic Laser Radar Scanner HUD Overlay when isScanning */}
              <AnimatePresence>
                {isScanning && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center"
                  >
                    {/* Glowing Laser Scan Bar */}
                    <div className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#22d3ee] animate-holographic-scan z-20 pointer-events-none" />
                    
                    {/* Concentric Dual Radar Rings */}
                    <div className="relative w-32 h-32 mb-4 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-pulse" />
                      <div className="absolute inset-2 rounded-full border border-dashed border-emerald-400/50 animate-radar-sweep" />
                      <div className="absolute inset-6 rounded-full border border-cyan-400/70" />
                      <Crosshair className="w-10 h-10 text-cyan-400 animate-pulse" />
                    </div>

                    {/* Step Telemetry */}
                    <div className="space-y-1 z-10 max-w-xs">
                      <div className="text-xs font-mono font-bold text-cyan-300 flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        <span>QUANTUM VISION SCANNER</span>
                      </div>
                      <p className="text-sm text-white font-bold animate-fade-in">
                        {scanTelemetry[scanningStep].title}
                      </p>
                      <p className="text-[11px] text-slate-400 leading-normal animate-fade-in">
                        {scanTelemetry[scanningStep].sub}
                      </p>
                    </div>

                    {/* Equalizer Frequency Pulse */}
                    <div className="flex items-center gap-1.5 mt-5">
                      {[18, 28, 40, 22, 35, 44, 26, 38, 20].map((h, i) => (
                        <motion.div
                          key={i}
                          animate={{ height: [8, h, 8] }}
                          transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.08 }}
                          className="w-1 bg-gradient-to-t from-cyan-500 to-emerald-400 rounded-full shadow-[0_0_8px_#22d3ee]"
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Uploaded Chart Image Preview or Default Drop State */}
              {selectedImage ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <img 
                    src={selectedImage} 
                    alt="Chart preview" 
                    className="max-h-56 object-contain rounded-2xl border border-white/20 shadow-2xl" 
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(null);
                    }}
                    className="absolute top-2 left-2 bg-rose-600/90 hover:bg-rose-600 text-white p-2 rounded-xl transition-all shadow-lg cursor-pointer"
                    title="حذف تصویر"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] text-emerald-300 font-semibold mt-3 bg-emerald-500/20 px-3.5 py-1 rounded-full border border-emerald-500/40 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                    <span>چارت بارگذاری شد (برای تغییر کلیک کنید)</span>
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center mx-auto group-hover:scale-105 group-hover:border-cyan-400/50 transition-all shadow-lg">
                    <Upload className="w-7 h-7 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">تصویر چارت معاملاتی را رها کنید یا کلیک کنید</p>
                    <p className="text-xs text-slate-400 mt-1">پشتیبانی از تریدینگ‌ویو، متاتریدر یا پیست مستقیم (Ctrl+V)</p>
                  </div>
                  <div className="pt-2">
                    <span className="text-[11px] liquid-glass-btn text-cyan-300 px-4 py-2 rounded-xl border border-cyan-500/30 font-medium">
                      انتخاب اسکرین‌شات چارت
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Parameters & Instant Execution Controls */}
          <div className="lg:col-span-7 liquid-glass-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-2xl">
            <div className="space-y-4">
              
              {/* Liquid Tab Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.08] pb-3.5 gap-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-white">تنظیمات الگوریتمی سیگنال</span>
                </div>
                
                {/* Modern Pill Switcher */}
                <div className="flex bg-[#060c1c] p-1 rounded-xl border border-white/10 relative">
                  <button
                    type="button"
                    onClick={() => setConfigTab('basic')}
                    className={`relative z-10 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      configTab === 'basic' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {configTab === 'basic' && (
                      <motion.div 
                        layoutId="sniper-tab"
                        className="absolute inset-0 bg-blue-600 rounded-lg shadow-md -z-10" 
                      />
                    )}
                    ⚙️ مشخصات پایه
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfigTab('advanced')}
                    className={`relative z-10 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      configTab === 'advanced' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {configTab === 'advanced' && (
                      <motion.div 
                        layoutId="sniper-tab"
                        className="absolute inset-0 bg-blue-600 rounded-lg shadow-md -z-10" 
                      />
                    )}
                    🚀 سبک و استراتژی
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfigTab('indicators')}
                    className={`relative z-10 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      configTab === 'indicators' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {configTab === 'indicators' && (
                      <motion.div 
                        layoutId="sniper-tab"
                        className="absolute inset-0 bg-blue-600 rounded-lg shadow-md -z-10" 
                      />
                    )}
                    📊 تاییدیه اندیکاتورها
                  </button>
                </div>
              </div>

              {/* Tab 1: Basic Specifications */}
              {configTab === 'basic' && (
                <motion.div 
                  initial={{ opacity: 0, y: 6 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">نماد یا جفت ارز (Symbol):</label>
                      <input
                        type="text"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                        placeholder="مثلاً XAUUSD یا BTCUSDT"
                        className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none text-left font-mono uppercase"
                      />
                      {/* Quick Symbol Chips */}
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {['XAUUSD', 'BTCUSD', 'ETHUSD', 'EURUSD', 'GBPUSD'].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setSymbol(s)}
                            className={`text-[10px] px-2.5 py-1 rounded-lg font-mono font-bold transition-all cursor-pointer ${
                              symbol.toUpperCase() === s 
                                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 shadow-sm' 
                                : 'bg-white/[0.04] text-slate-400 hover:text-slate-200 hover:bg-white/[0.08] border border-white/5'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">تایم‌فریم معاملاتی:</label>
                      <select
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value)}
                        className="w-full liquid-glass-input rounded-xl px-3 py-2.5 text-sm text-white outline-none font-mono"
                      >
                        <option value="1M">1 Minute (اسکالپ لحظه‌ای)</option>
                        <option value="5M">5 Minutes (اسکالپ)</option>
                        <option value="15M">15 Minutes (دی تریدینگ)</option>
                        <option value="1H">1 Hour (دی تریدینگ)</option>
                        <option value="4H">4 Hours (سوینگ)</option>
                        <option value="Daily">Daily (سوینگ میان‌مدت)</option>
                      </select>
                      <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span>سرعت صدور سیگنال:</span>
                        <span className="text-cyan-300 font-mono font-bold">&lt; ۲ ثانیه</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">یادداشت تکمیلی تحلیلی (اختیاری):</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="مثلاً: در آستانه انتشار خبر NFP، یا در محدوده حمایت روزانه و واگرایی RSI..."
                      rows={2}
                      className="w-full liquid-glass-input rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none resize-none"
                    />
                  </div>
                </motion.div>
              )}

              {/* Tab 2: Advanced Customization */}
              {configTab === 'advanced' && (
                <motion.div 
                  initial={{ opacity: 0, y: 6 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">سبک تحلیل استراتژی:</label>
                      <select
                        value={strategyMethod}
                        onChange={(e) => setStrategyMethod(e.target.value)}
                        className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs text-white outline-none font-medium"
                      >
                        <option value="SMC">اسمارت مانی (Smart Money Concepts)</option>
                        <option value="PA">پرایس اکشن الگوهای کلاسیک</option>
                        <option value="ICT">آی‌سی‌تی (ICT Orderblocks & FVG)</option>
                        <option value="ELLIOTT">امواج الیوت و فیبوناچی</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">اعتبار زمانی پوزیشن:</label>
                      <select
                        value={validity}
                        onChange={(e) => setValidity(e.target.value)}
                        className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs text-white outline-none font-medium"
                      >
                        <option value="15m">۱۵ دقیقه آینده</option>
                        <option value="30m">۳۰ دقیقه آینده</option>
                        <option value="1h">۱ ساعت آینده</option>
                        <option value="4h">۴ ساعت آینده</option>
                        <option value="1d">۲۴ ساعت آینده</option>
                        <option value="نامحدود">نامحدود</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Direction constraint */}
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-2">جهت معامله درخواستی:</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['AUTO', 'BUY_ONLY', 'SELL_ONLY'] as const).map((dir) => (
                          <button
                            key={dir}
                            type="button"
                            onClick={() => setDirection(dir)}
                            className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all border cursor-pointer text-center ${
                              direction === dir
                                ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400/50 shadow-sm'
                                : 'bg-white/[0.03] text-slate-400 border-white/5 hover:text-slate-200'
                            }`}
                          >
                            {dir === 'AUTO' ? '🤖 خودکار' : dir === 'BUY_ONLY' ? '🟢 LONG' : '🔴 SHORT'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Suggested leverage */}
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1.5">اهرم پیشنهادی (Leverage):</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={leverage}
                          onChange={(e) => setLeverage(e.target.value)}
                          placeholder="10x"
                          className="w-14 liquid-glass-input rounded-xl px-1.5 py-1.5 text-xs text-white font-mono text-center outline-none"
                        />
                        <div className="flex gap-1 flex-1">
                          {['5x', '10x', '20x', '50x'].map((lev) => (
                            <button
                              key={lev}
                              type="button"
                              onClick={() => setLeverage(lev)}
                              className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold transition-all border cursor-pointer text-center ${
                                leverage === lev
                                  ? 'bg-blue-600/30 text-cyan-300 border-cyan-400/50 shadow-sm'
                                  : 'bg-white/[0.03] text-slate-400 border-white/5 hover:text-slate-200'
                              }`}
                            >
                              {lev}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">ریسک‌پذیری سیگنال:</label>
                    <select
                      value={riskMode}
                      onChange={(e) => setRiskMode(e.target.value)}
                      className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs text-white outline-none font-medium"
                    >
                      <option value="conservative">محافظه‌کارانه (ریسک کمتر از ۰.۵٪)</option>
                      <option value="normal">عادی و متوازن (۱٪ حساب)</option>
                      <option value="aggressive">تهاجمی (۲٪ تا ۳٪ حساب)</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {/* Tab 3: Indicators Setup */}
              {configTab === 'indicators' && (
                <motion.div 
                  initial={{ opacity: 0, y: 6 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-2.5">اندیکاتورهای تاییدیه تکنیکال:</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['RSI', 'MACD', 'EMA 200', 'Bollinger Bands', 'Volume Profile', 'Liquidity Sweep'].map((ind) => {
                        const isSelected = selectedIndicators.includes(ind);
                        return (
                          <button
                            key={ind}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setSelectedIndicators(selectedIndicators.filter((i) => i !== ind));
                              } else {
                                setSelectedIndicators([...selectedIndicators, ind]);
                              }
                            }}
                            className={`px-3 py-2 rounded-xl text-[11px] font-semibold transition-all border cursor-pointer flex items-center gap-2 ${
                              isSelected
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-sm'
                                : 'bg-white/[0.03] text-slate-400 border-white/5 hover:text-slate-200'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'bg-slate-600'}`} />
                            <span>{ind}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-3.5 liquid-glass-card rounded-2xl border border-white/10 space-y-1">
                    <div className="text-[11px] text-cyan-300 font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>اتصال بلادرنگ به پایگاه استراتژی‌ها:</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      الگوریتم هوش مصنوعی <span className="text-emerald-300 font-semibold">{activeKnowledge.length} قانون فعال</span> شما را به صورت مستقیم در ساختار چارت تزریق می‌کند.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Status Banner */}
              <div className="liquid-glass-btn rounded-2xl p-3 flex items-center justify-between text-xs border border-white/5">
                <div className="flex items-center gap-2 text-slate-300">
                  <ShieldAlert className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>موتور فعال: <strong className="text-white font-mono">{activeModel ? activeModel.name.split(' (')[0] : 'Default Model'}</strong></span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  ریسک پیش‌فرض: <strong className="text-emerald-400 font-mono">{settings?.riskPerTrade || '1%'}</strong>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-fade-in">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Giant Scan Button with Holographic Shimmer */}
            <motion.button
              whileHover={{ scale: isScanning || (!selectedImage && !symbol.trim()) ? 1 : 1.01 }}
              whileTap={{ scale: isScanning || (!selectedImage && !symbol.trim()) ? 1 : 0.99 }}
              onClick={executeSniperScan}
              disabled={isScanning || (!selectedImage && !symbol.trim())}
              className={`w-full py-4 px-6 rounded-2xl font-black text-sm lg:text-base flex items-center justify-center gap-3 transition-all shadow-xl relative overflow-hidden ${
                isScanning || (!selectedImage && !symbol.trim())
                  ? 'bg-slate-800/60 text-slate-500 cursor-not-allowed border border-white/5'
                  : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-emerald-500/25 border border-emerald-400/40 cursor-pointer'
              }`}
            >
              <div className="absolute inset-0 animate-shimmer opacity-30 pointer-events-none" />
              {isScanning ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-white" />
                  <span>درحال پردازش ساختار چارت و صدور سیگنال اسنایپر...</span>
                </>
              ) : (
                <>
                  <Target className="w-5 h-5 text-cyan-200 animate-pulse" />
                  <span>⚡ اسکن و صدور آنی فرمان معامله (Sniper Scan)</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* ULTRA-LUXURY LIQUID GLASS SIGNAL DISPLAY RESULT */}
        <AnimatePresence>
          {currentSignal && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.97, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={`rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden glass-specular-sheen ${
                currentSignal.action === 'BUY'
                  ? 'liquid-glass-emerald'
                  : currentSignal.action === 'SELL'
                  ? 'liquid-glass-rose'
                  : 'liquid-glass-cyan'
              }`}
            >
              {/* Top Accent Light Beam */}
              <div className={`absolute top-0 right-0 left-0 h-1.5 ${
                currentSignal.action === 'BUY' 
                  ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 shadow-[0_0_20px_#10b981]' 
                  : currentSignal.action === 'SELL' 
                  ? 'bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 shadow-[0_0_20px_#f43f5e]' 
                  : 'bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 shadow-[0_0_20px_#22d3ee]'
              }`} />

              {/* Signal Header Row */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div className="flex items-start sm:items-center gap-4">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-2xl ring-2 flex-shrink-0 ${
                    currentSignal.action === 'BUY'
                      ? 'bg-emerald-500 text-slate-950 ring-emerald-400/50 shadow-emerald-500/40'
                      : currentSignal.action === 'SELL'
                      ? 'bg-rose-500 text-white ring-rose-400/50 shadow-rose-500/40'
                      : 'bg-cyan-500 text-slate-950 ring-cyan-400/50 shadow-cyan-500/40'
                  }`}>
                    {currentSignal.action === 'BUY' ? (
                      <TrendingUp className="w-8 h-8 sm:w-9 sm:h-9" />
                    ) : currentSignal.action === 'SELL' ? (
                      <TrendingDown className="w-8 h-8 sm:w-9 sm:h-9" />
                    ) : (
                      <ShieldAlert className="w-8 h-8 sm:w-9 sm:h-9" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-mono text-slate-100 bg-white/10 px-3 py-1 rounded-xl border border-white/15 font-black">
                        {currentSignal.symbol}
                      </span>
                      <span className="text-xs font-mono text-cyan-300 bg-cyan-500/20 px-2.5 py-1 rounded-xl border border-cyan-500/30 font-bold">
                        {currentSignal.timeframe}
                      </span>
                      {currentSignal.validityDuration && (
                        <span className="text-xs text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-xl border border-amber-500/30 font-medium">
                          ⏱️ {currentSignal.validityDuration}
                        </span>
                      )}
                      {currentSignal.strategyMethod && (
                        <span className="text-xs text-purple-300 bg-purple-500/20 px-2.5 py-1 rounded-xl border border-purple-500/30 font-medium">
                          🧠 {currentSignal.strategyMethod === 'SMC' ? 'اسمارت مانی' : currentSignal.strategyMethod === 'PA' ? 'پرایس اکشن' : currentSignal.strategyMethod === 'ICT' ? 'آی‌سی‌تی' : currentSignal.strategyMethod}
                        </span>
                      )}
                    </div>
                    <h2 className={`text-xl sm:text-2xl lg:text-3xl font-black mt-2 tracking-tight ${
                      currentSignal.action === 'BUY' ? 'text-emerald-300' : currentSignal.action === 'SELL' ? 'text-rose-300' : 'text-cyan-300'
                    }`}>
                      {currentSignal.action === 'BUY' ? '🟢 فرمان خرید قاطع (LONG / BUY)' : currentSignal.action === 'SELL' ? '🔴 فرمان فروش قاطع (SHORT / SELL)' : '🟡 عدم ورود / نظاره (WAIT)'}
                    </h2>
                  </div>
                </div>

                {/* Right controls: Confidence, Copy, Chat */}
                <div className="flex items-center gap-2.5 self-stretch md:self-auto w-full md:w-auto justify-between md:justify-end flex-wrap">
                  {/* Confidence Badge */}
                  <div className="liquid-glass-btn border border-white/15 px-4 py-2.5 rounded-2xl text-center shadow-lg">
                    <div className="text-[10px] text-slate-400 font-semibold">درجه قطعیت الگو</div>
                    <div className="text-base font-black text-white font-mono mt-0.5 flex items-center justify-center gap-1.5">
                      <span>{currentSignal.confidence}%</span>
                      <Flame className="w-4 h-4 text-cyan-400" />
                    </div>
                  </div>

                  {/* Copy Button */}
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => copySignalText(currentSignal)}
                    className="flex items-center gap-1.5 liquid-glass-btn text-white font-bold px-4 py-2.5 rounded-2xl transition-all text-xs cursor-pointer shadow-md"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'کپی شد!' : 'کپی مشخصات'}</span>
                  </motion.button>

                  {/* Send to Chat Button */}
                  {onSendSignalToChat && (
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        const prompt = `سلام! می‌خواهم در مورد این سیگنال اسنایپر صادر شده به صورت عمیق بحث کنیم:
- نماد: **${currentSignal.symbol}**
- تایم‌فریم: **${currentSignal.timeframe}**
- وضعیت معامله: **${currentSignal.action === 'BUY' ? '🟢 خرید (LONG)' : currentSignal.action === 'SELL' ? '🔴 فروش (SHORT)' : '🟡 نظاره (WAIT)'}**
- نقطه ورود: **${cleanTargetValue(currentSignal.entryPrice) || '-'}**
- حد ضرر: **${cleanTargetValue(currentSignal.stopLoss) || '-'}**
- اهداف: TP1: ${cleanTargetValue(currentSignal.takeProfit1) || '-'} | TP2: ${cleanTargetValue(currentSignal.takeProfit2) || '-'} | TP3: ${cleanTargetValue(currentSignal.takeProfit3) || '-'}
- نسبت ریسک/ریوارد: **${currentSignal.riskRewardRatio || '-'}**

**خلاصه تحلیل:** ${currentSignal.summaryNote}

لطفاً سناریوی تایید ثانویه و مدیریت پله‌ای خروج را ارزیابی کن.`;
                        onSendSignalToChat(prompt);
                      }}
                      className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold px-4 py-2.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/25 text-xs cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-100" />
                      <span>💬 تحلیل عمیق در چت</span>
                    </motion.button>
                  )}
                </div>
              </div>

              {/* VISUAL PRICE LADDER GAUGE (Interactive Target Zones) */}
              <div className="my-6 p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/10 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-2">
                    <Target className="w-4 h-4 text-cyan-400" />
                    <span>نردبان قیمتی و گام‌های هدف (Visual Execution Ladder)</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    R/R: <strong className="text-cyan-300">{currentSignal.riskRewardRatio || '1 : 2.5'}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center font-mono">
                  {/* Stop Loss */}
                  <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300">
                    <div className="text-[9px] uppercase font-bold text-rose-400">حد ضرر (SL)</div>
                    <div className="text-sm font-black mt-1 text-white">{cleanTargetValue(currentSignal.stopLoss) || '-'}</div>
                  </div>

                  {/* Entry */}
                  <div className="p-3 rounded-xl bg-blue-950/60 border border-cyan-400/50 text-cyan-300 shadow-md shadow-cyan-500/10">
                    <div className="text-[9px] uppercase font-bold text-cyan-400">نقطه ورود (Entry)</div>
                    <div className="text-sm font-black mt-1 text-white">{cleanTargetValue(currentSignal.entryPrice) || 'مارکت'}</div>
                  </div>

                  {/* TP 1 */}
                  <div className={`p-3 rounded-xl border transition-all ${
                    simulatedTPStep >= 1 ? 'bg-emerald-600 text-white border-emerald-300 shadow-lg shadow-emerald-500/40' : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  }`}>
                    <div className="text-[9px] uppercase font-bold">هدف ۱ (TP 1)</div>
                    <div className="text-sm font-black mt-1">{cleanTargetValue(currentSignal.takeProfit1) || '-'}</div>
                  </div>

                  {/* TP 2 */}
                  <div className={`p-3 rounded-xl border transition-all ${
                    simulatedTPStep >= 2 ? 'bg-emerald-600 text-white border-emerald-300 shadow-lg shadow-emerald-500/40' : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  }`}>
                    <div className="text-[9px] uppercase font-bold">هدف ۲ (TP 2)</div>
                    <div className="text-sm font-black mt-1">{cleanTargetValue(currentSignal.takeProfit2) || '-'}</div>
                  </div>

                  {/* TP 3 */}
                  <div className={`p-3 rounded-xl border col-span-2 sm:col-span-1 transition-all ${
                    simulatedTPStep >= 3 ? 'bg-emerald-600 text-white border-emerald-300 shadow-lg shadow-emerald-500/40' : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  }`}>
                    <div className="text-[9px] uppercase font-bold">هدف نهایی (TP 3)</div>
                    <div className="text-sm font-black mt-1">{cleanTargetValue(currentSignal.takeProfit3) || '-'}</div>
                  </div>
                </div>

                {/* Interactive Simulator Bar */}
                <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>شبیه‌ساز مدیریت پوزیشن زنده:</span>
                  </div>

                  <div className="flex gap-1.5 flex-wrap">
                    {[
                      { step: 0, label: 'ریست' },
                      { step: 1, label: 'اصابت TP1 (سیو سود ۵۰٪)' },
                      { step: 2, label: 'اصابت TP2' },
                      { step: 3, label: 'اصابت TP3' },
                    ].map((sim) => (
                      <button
                        key={sim.step}
                        type="button"
                        onClick={() => setSimulatedTPStep(sim.step)}
                        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                          simulatedTPStep === sim.step
                            ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/30'
                            : 'liquid-glass-btn text-slate-300 hover:text-white'
                        }`}
                      >
                        {sim.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bento Grid: Trade Specs & Dynamic Lot Size Calculator */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 my-6">
                
                {/* Left: Summary Analysis */}
                <div className="lg:col-span-6 liquid-glass-card rounded-3xl p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>خلاصه قاطع تحلیل تک‌تیرانداز</span>
                    </h4>
                    <p className="text-sm text-slate-200 leading-relaxed font-medium">
                      {currentSignal.summaryNote}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">ریسک به ریوارد:</span>
                    <span className="text-cyan-300 font-black px-2 py-0.5 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
                      {currentSignal.riskRewardRatio || '1 : 2+'}
                    </span>
                  </div>
                </div>

                {/* Right: Dynamic Lot Size & Capital Management Calculator */}
                <div className="lg:col-span-6 liquid-glass-card rounded-3xl p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
                      <Calculator className="w-4 h-4 text-indigo-400" />
                      <span>محاسبه‌گر حجم مجاز معامله (Position Sizing)</span>
                    </h4>

                    {/* Inputs */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-[10px] text-slate-300 font-medium mb-1">موجودی حساب ($):</label>
                        <input
                          type="number"
                          value={balance}
                          onChange={(e) => setBalance(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full liquid-glass-input rounded-xl px-2.5 py-2 text-xs text-white font-mono text-center outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-300 font-medium mb-1">درصد ریسک مجاز (%):</label>
                        <input
                          type="number"
                          step="0.1"
                          value={riskPercent}
                          onChange={(e) => setRiskPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full liquid-glass-input rounded-xl px-2.5 py-2 text-xs text-white font-mono text-center outline-none"
                        />
                      </div>
                    </div>

                    {/* Quick Risk Buttons */}
                    <div className="flex gap-1.5 mb-3">
                      {[0.5, 1.0, 2.0, 3.0].map((rp) => (
                        <button
                          key={rp}
                          type="button"
                          onClick={() => setRiskPercent(rp)}
                          className={`flex-1 py-1 rounded-lg text-[10px] font-mono font-bold transition-all border cursor-pointer ${
                            riskPercent === rp
                              ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                              : 'bg-white/[0.04] text-slate-400 border-white/5 hover:text-white'
                          }`}
                        >
                          {rp}%
                        </button>
                      ))}
                    </div>

                    {/* Calculation Readout */}
                    <div className="p-4 bg-black/40 border border-white/10 rounded-2xl flex items-center justify-between shadow-inner">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">حجم پیشنهادی ورود:</span>
                        <span className="text-xl font-black text-emerald-400 font-mono mt-0.5 block">
                          {hasValidNumbers ? calculatedLotSize : 'محاسبه مارکت'}
                        </span>
                      </div>
                      <div className="text-left font-mono">
                        <span className="text-[10px] text-slate-400 block font-medium">ریسک دلاری</span>
                        <span className="text-sm font-black text-indigo-300 mt-0.5 block">
                          ${calculatedRiskAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 text-right">
                    {hasValidNumbers ? (
                      <>فاصله استاپ‌لاس: <strong className="text-cyan-300 font-mono">{stopLossDistance.toFixed(currentSignal.symbol.includes('EUR') || currentSignal.symbol.includes('GBP') ? 5 : 2)}</strong> واحد</>
                    ) : (
                      <span>حجم پوزیشن بر اساس مدیریت سرمایه محاسبه شده است.</span>
                    )}
                  </div>
                </div>

              </div>

              {/* Active Knowledge Rules Verification Matrix */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>چک‌لیست تطبیق با استراتژی‌های فعال پایگاه داده شما:</span>
                </h4>

                {currentSignal.reasons && currentSignal.reasons.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentSignal.reasons.map((r, idx) => (
                      <div 
                        key={idx} 
                        className={`p-4 rounded-2xl border flex items-start gap-3 text-xs transition-all ${
                          r.status === 'passed'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                            : r.status === 'failed'
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                            : 'liquid-glass-card text-slate-300'
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {r.status === 'passed' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : r.status === 'failed' ? (
                            <XCircle className="w-4 h-4 text-rose-400" />
                          ) : (
                            <Crosshair className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">{r.ruleTitle}</div>
                          <div className="text-[11px] mt-1 opacity-90 leading-relaxed">{r.explanation}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl liquid-glass-card text-slate-400 text-xs text-center">
                    تحلیل بر اساس ساختار مارکت انجام شد. (می‌توانید قوانین خود را در پایگاه استراتژی‌ها ذخیره کنید).
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Previous Sniper Signals History */}
        {history.length > 0 && (
          <div className="liquid-glass-card rounded-3xl p-5 lg:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>تاریخچه فرمان‌های اخیر اسنایپر</span>
              </h3>
              <button
                onClick={() => {
                  setHistory([]);
                  localStorage.removeItem('trademind_sniper_history');
                }}
                className="text-xs text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                پاک کردن تاریخچه
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {history.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setCurrentSignal(item)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    currentSignal?.id === item.id
                      ? 'liquid-glass-cyan shadow-lg'
                      : 'liquid-glass-card hover:border-white/20 border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs font-mono ${
                      item.action === 'BUY' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : item.action === 'SELL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    }`}>
                      {item.action === 'BUY' ? 'BUY' : item.action === 'SELL' ? 'SELL' : 'WAIT'}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white font-mono">{item.symbol}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.timeframe} • {new Date(item.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs font-black text-cyan-300">
                    {item.confidence}%
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
