import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Database, 
  Cpu, 
  Settings, 
  Plus, 
  Trash2, 
  TrendingUp, 
  ChevronLeft, 
  CheckCircle2, 
  Target, 
  Bot, 
  X,
  Sparkles,
  Zap,
  Activity
} from 'lucide-react';
import { TabType, AIModelConfig } from '../types';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  chatIds: string[];
  currentChatId: string;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string, e: React.MouseEvent) => void;
  activeKnowledgeCount: number;
  activeModel: AIModelConfig | undefined;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  chatIds,
  currentChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  activeKnowledgeCount,
  activeModel,
  isOpenMobile = false,
  onCloseMobile
}) => {
  const handleItemClick = (action: () => void) => {
    action();
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const navItems = [
    {
      id: 'chat' as TabType,
      label: 'اتاق تحلیل و ترید',
      desc: 'گفتگو، چارت و هوش مصنوعی',
      icon: MessageSquare,
      badge: null,
      glowColor: 'cyan'
    },
    {
      id: 'sniper' as TabType,
      label: 'اتاق فرمان اسنایپر',
      desc: 'سیگنال لحظه‌ای و هولوگرافیک',
      icon: Target,
      badge: 'PRO',
      glowColor: 'emerald'
    },
    {
      id: 'knowledge' as TabType,
      label: 'پایگاه استراتژی‌ها',
      desc: 'قوانین و اسناد معاملاتی',
      icon: Database,
      badge: `${activeKnowledgeCount}`,
      glowColor: 'blue'
    },
    {
      id: 'settings' as TabType,
      label: 'تنظیمات و هوش مصنوعی',
      desc: 'مدل‌ها، تم و مدیریت ریسک',
      icon: Settings,
      badge: null,
      glowColor: 'purple'
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full text-slate-100 select-none relative overflow-hidden">
      
      {/* Top Specular Glow Effect */}
      <div className="absolute top-0 right-0 left-0 h-36 bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent pointer-events-none" />

      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between relative z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-500 p-[1px] shadow-lg shadow-cyan-500/25">
              <div className="w-full h-full bg-[#060c1c] rounded-[15px] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-cyan-300" />
              </div>
            </div>
            <span className="absolute -bottom-1 -left-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#060c1c] shadow-[0_0_8px_#34d399]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                TradeMind
              </span>
              <span className="text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 px-1.5 py-0.5 rounded-md">
                PRO AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-wide mt-0.5">
              INSTITUTIONAL DESK
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Close Button */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white transition-all cursor-pointer"
              title="بستن منو"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* New Analysis Button (Luxury Liquid Button) */}
      <div className="p-3.5 flex-shrink-0">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleItemClick(() => {
            onNewChat();
            setActiveTab('chat');
          })}
          className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-3 px-4 rounded-2xl transition-all shadow-xl shadow-cyan-600/20 border border-cyan-400/30 text-xs sm:text-sm group cursor-pointer relative overflow-hidden"
        >
          <div className="absolute inset-0 animate-shimmer opacity-25 pointer-events-none" />
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          <span>تحلیل معاملاتی جدید</span>
        </motion.button>
      </div>

      {/* Main Navigation Items */}
      <div className="px-3 py-2 space-y-1.5 border-b border-white/[0.08] flex-shrink-0">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
          سیستم‌های معاملاتی
        </div>
        
        {navItems.map((item) => {
          const isActive = activeTab === item.id || (item.id === 'settings' && (activeTab === 'models' || activeTab === 'settings'));
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleItemClick(() => setActiveTab(item.id))}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer relative overflow-hidden ${
                isActive
                  ? item.id === 'sniper'
                    ? 'liquid-glass-emerald text-emerald-200'
                    : 'liquid-glass-glow text-cyan-200'
                  : 'text-slate-300 hover:bg-white/[0.05] hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl transition-colors ${
                  isActive 
                    ? item.id === 'sniper' 
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/40' 
                      : 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/40' 
                    : 'bg-white/[0.04] text-slate-400'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <div className="font-bold text-xs text-white leading-tight">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                    {item.desc}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                    item.id === 'sniper' 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <ChevronLeft className="w-4 h-4 text-cyan-400" />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Recent Analysis Chat History */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar min-h-0">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2 flex items-center justify-between">
          <span>جلسات و تاریخچه گفتگو</span>
          <span className="font-mono text-[9px] text-slate-500">{chatIds.length} جلسه</span>
        </div>
        
        {chatIds.length === 0 ? (
          <div className="text-center py-8 px-4 text-slate-400 text-xs liquid-glass-card rounded-2xl border border-dashed border-white/10">
            <p>گفتگویی ثبت نشده است.</p>
            <p className="mt-1 text-[11px] text-cyan-300">چارت یا سوال خود را وارد کنید.</p>
          </div>
        ) : (
          chatIds.map((id, idx) => {
            const isSelected = id === currentChatId && activeTab === 'chat';
            return (
              <motion.div
                key={id}
                whileHover={{ scale: 1.01 }}
                onClick={() => handleItemClick(() => {
                  onSelectChat(id);
                  setActiveTab('chat');
                })}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'liquid-glass-cyan text-white font-bold shadow-md'
                    : 'text-slate-300 hover:bg-white/[0.04] hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="truncate">تحلیل معاملاتی #{chatIds.length - idx}</span>
                </div>
                {chatIds.length > 1 && (
                  <button
                    onClick={(e) => onDeleteChat(id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rose-500/20 hover:text-rose-400 rounded-xl transition-all cursor-pointer"
                    title="حذف گفتگو"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Active Model Status Card in Footer */}
      <div className="p-3.5 bg-[#050a18]/90 border-t border-white/[0.08] flex-shrink-0">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          onClick={() => handleItemClick(() => setActiveTab('models'))}
          className="flex items-center justify-between p-3 rounded-2xl liquid-glass-card hover:border-cyan-500/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 flex items-center justify-center border border-cyan-400/30 flex-shrink-0 shadow-sm">
              <Bot className="w-4 h-4 text-cyan-300" />
            </div>
            <div className="truncate text-right">
              <div className="text-[9px] text-slate-400 flex items-center gap-1 font-mono">
                <span>AI ENGINE:</span>
                <span className="text-emerald-400 font-bold">READY</span>
              </div>
              <div className="text-xs font-bold text-white truncate font-mono">
                {activeModel ? activeModel.name.split('(')[0] : 'انتخاب مدل'}
              </div>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping flex-shrink-0 shadow-[0_0_8px_#34d399]" />
        </motion.div>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile, visible on md and up) */}
      <aside className="hidden md:flex w-72 bg-[#050a18]/80 backdrop-blur-3xl border-l border-white/[0.08] flex-col h-full select-none flex-shrink-0 relative z-20 shadow-[0_0_50px_rgba(0,0,0,0.6)]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (sliding frosted glass) */}
      <AnimatePresence>
        {isOpenMobile && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-md z-50 cursor-pointer"
            />

            {/* Sliding Drawer */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="md:hidden fixed inset-y-0 right-0 w-[85vw] max-w-xs bg-[#050a18]/95 backdrop-blur-3xl border-l border-white/10 z-50 shadow-2xl flex flex-col"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
