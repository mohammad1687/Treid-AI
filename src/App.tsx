import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  Plus, 
  MessageSquare, 
  Target, 
  Database, 
  Settings, 
  TrendingUp, 
  Sparkles,
  Cpu
} from 'lucide-react';
import { StorageService } from './lib/storage';
import { TabType, KnowledgeItem, AIModelConfig, UserSettings, Message } from './types';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { KnowledgeBaseView } from './components/KnowledgeBaseView';
import { ModelsView } from './components/ModelsView';
import { SettingsView } from './components/SettingsView';
import { SniperDeskView } from './components/SniperDeskView';
import { LocalTradingEngine } from './services/LocalTradingEngine';

export default function App() {
  // Navigation & UI State
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Storage State
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);
  const [models, setModels] = useState<AIModelConfig[]>([]);
  const [settings, setSettings] = useState<UserSettings>(StorageService.getSettings());
  const [chats, setChats] = useState<Record<string, Message[]>>({});
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Initialize data on mount
  useEffect(() => {
    const loadedKnowledge = StorageService.getKnowledge();
    const loadedModels = StorageService.getModels();
    const loadedSettings = StorageService.getSettings();
    const loadedChats = StorageService.getChats();

    setKnowledge(loadedKnowledge);
    setModels(loadedModels);
    setSettings(loadedSettings);
    setChats(loadedChats);

    // Ensure at least one active chat thread exists
    const chatIds = Object.keys(loadedChats);
    if (chatIds.length === 0) {
      const newId = 'chat_' + Date.now();
      const initialChats = { [newId]: [] };
      setChats(initialChats);
      setCurrentChatId(newId);
      StorageService.saveChats(initialChats);
    } else {
      setCurrentChatId(chatIds[chatIds.length - 1]);
    }
  }, []);

  // Sync Theme & Personalization to document body for global CSS overrides
  useEffect(() => {
    const theme = settings.theme || 'dark-blue';
    const contrast = settings.contrast || 'normal';
    const accent = settings.accentColor || 'blue';
    
    document.body.setAttribute('data-theme', theme);
    document.body.setAttribute('data-contrast', contrast);
    document.body.setAttribute('data-accent', accent);
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-contrast', contrast);
    document.documentElement.setAttribute('data-accent', accent);
  }, [settings.theme, settings.contrast, settings.accentColor]);

  // Sync Knowledge to storage
  const handleSaveKnowledge = (newItems: KnowledgeItem[]) => {
    setKnowledge(newItems);
    StorageService.saveKnowledge(newItems);
  };

  // Knowledge Handlers
  const handleAddKnowledge = (itemData: Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: KnowledgeItem = {
      ...itemData,
      id: 'kb_' + Date.now() + Math.random().toString(36).substring(2, 6),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    handleSaveKnowledge([newItem, ...knowledge]);
  };

  const handleUpdateKnowledge = (id: string, updated: Partial<KnowledgeItem>) => {
    const newItems = knowledge.map((item) => 
      item.id === id ? { ...item, ...updated, updatedAt: Date.now() } : item
    );
    handleSaveKnowledge(newItems);
  };

  const handleDeleteKnowledge = (id: string) => {
    const newItems = knowledge.filter((item) => item.id !== id);
    handleSaveKnowledge(newItems);
  };

  const handleToggleKnowledgeActive = (id: string) => {
    const newItems = knowledge.map((item) =>
      item.id === id ? { ...item, isActive: !item.isActive, updatedAt: Date.now() } : item
    );
    handleSaveKnowledge(newItems);
  };

  // Models Handlers
  const handleSaveModels = (newModels: AIModelConfig[]) => {
    setModels(newModels);
    StorageService.saveModels(newModels);
  };

  const handleUpdateModel = (id: string, updated: Partial<AIModelConfig>) => {
    const newModels = models.map((m) => (m.id === id ? { ...m, ...updated } : m));
    handleSaveModels(newModels);
  };

  const handleSetDefaultModel = (id: string) => {
    const newModels = models.map((m) => ({
      ...m,
      isDefault: m.id === id,
      isActive: m.id === id ? true : m.isActive,
    }));
    handleSaveModels(newModels);
  };

  const handleAddModel = (newModel: Omit<AIModelConfig, 'id'>) => {
    const model: AIModelConfig = {
      ...newModel,
      id: 'model_' + Date.now(),
    };
    handleSaveModels([...models, model]);
  };

  const handleDeleteModel = (id: string) => {
    const newModels = models.filter((m) => m.id !== id);
    handleSaveModels(newModels);
  };

  // Settings Handlers
  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
  };

  const handleResetSettings = () => {
    const defaults = StorageService.resetSettings();
    setSettings(defaults);
  };

  // Chat Handlers
  const handleNewChat = () => {
    const newId = 'chat_' + Date.now();
    const updatedChats = { ...chats, [newId]: [] };
    setChats(updatedChats);
    setCurrentChatId(newId);
    StorageService.saveChats(updatedChats);
    setIsMobileSidebarOpen(false);
  };

  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remainingChats = { ...chats };
    delete remainingChats[id];
    
    let nextId = currentChatId;
    if (currentChatId === id) {
      const keys = Object.keys(remainingChats);
      nextId = keys.length > 0 ? keys[keys.length - 1] : '';
    }

    if (!nextId) {
      nextId = 'chat_' + Date.now();
      remainingChats[nextId] = [];
    }

    setChats(remainingChats);
    setCurrentChatId(nextId);
    StorageService.saveChats(remainingChats);
  };

  const handleClearCurrentChat = () => {
    if (!currentChatId) return;
    const updatedChats = { ...chats, [currentChatId]: [] };
    setChats(updatedChats);
    StorageService.saveChats(updatedChats);
  };

  // Active Model & Active Knowledge Resolution
  const activeModel = models.find((m) => m.isDefault && m.isActive) || models.find((m) => m.isActive) || models[0];
  const activeKnowledgeItems = knowledge.filter((k) => k.isActive);

  // Send message pipeline
  const handleSendMessage = async (
    text: string, 
    images?: string[], 
    files?: { name: string; content: string }[]
  ) => {
    if ((!text.trim() && (!images || images.length === 0) && (!files || files.length === 0)) || isLoading) {
      return;
    }

    const userMessage: Message = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: text,
      images: images,
      files: files,
      timestamp: Date.now(),
    };

    const currentMessages = chats[currentChatId] || [];
    const newMessages = [...currentMessages, userMessage];

    // Update state immediately
    const updatedChatsWithUser = { ...chats, [currentChatId]: newMessages };
    setChats(updatedChatsWithUser);
    StorageService.saveChats(updatedChatsWithUser);
    setIsLoading(true);

    try {
      let replyText: string = '';
      let modelUsed: string = activeModel?.name.split('(')[0] || 'AI Engine';
      let providerName: string = activeModel?.provider || 'gemini';

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: newMessages,
            modelConfig: activeModel,
            activeKnowledge: activeKnowledgeItems,
            settings: settings
          })
        });

        const contentType = response.headers.get('content-type') || '';
        if (response.ok && contentType.includes('application/json')) {
          const data = await response.json();
          if (data.success && data.reply) {
            replyText = data.reply;
            modelUsed = data.modelUsed || modelUsed;
            providerName = data.provider || providerName;
          } else {
            throw new Error(data.error || 'Server error or empty reply');
          }
        } else {
          throw new Error(`Non-JSON response (Status: ${response.status})`);
        }
      } catch (networkOrJsonError: any) {
        console.log('API call failed or localhost standalone mode, using universal live AI executor:', networkOrJsonError.message);
        replyText = await LocalTradingEngine.analyzeMarket(newMessages, activeKnowledgeItems, settings, activeModel);
        modelUsed = activeModel?.name.split('(')[0] || 'Active AI Engine';
        providerName = activeModel?.provider || 'Universal AI';
      }
      
      const assistantMessage: Message = {
        id: 'msg_' + (Date.now() + 1),
        role: 'assistant',
        content: replyText,
        timestamp: Date.now(),
        modelUsed: modelUsed,
        provider: providerName,
      };

      const finalMessages = [...newMessages, assistantMessage];
      const updatedChatsWithAI = { ...chats, [currentChatId]: finalMessages };
      setChats(updatedChatsWithAI);
      StorageService.saveChats(updatedChatsWithAI);

    } catch (error: any) {
      console.error('Fatal error in chat execution:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentMessages = chats[currentChatId] || [];
  const chatIds = Object.keys(chats).reverse();

  // Tab Title Generator for Mobile Header
  const getTabTitle = () => {
    switch (activeTab) {
      case 'chat': return 'اتاق تحلیل و ترید';
      case 'sniper': return 'اتاق فرمان اسنایپر';
      case 'knowledge': return 'پایگاه استراتژی‌ها';
      case 'models': return 'مدل‌های هوش مصنوعی';
      case 'settings': return 'تنظیمات و سفارشی‌سازی';
      default: return 'TradeMind Pro';
    }
  };

  return (
    <div 
      dir="rtl" 
      data-theme={settings.theme || 'dark-blue'} 
      data-contrast={settings.contrast || 'normal'} 
      data-accent={settings.accentColor || 'blue'} 
      className="flex flex-col md:flex-row h-[100dvh] w-screen bg-[#030712] text-slate-100 overflow-hidden font-sans transition-colors duration-500 relative select-none"
    >
      {/* Dynamic Fluid Liquid Glow Orbs in Background */}
      <div 
        className="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-cyan-500/12 via-blue-600/10 to-transparent blur-[140px] pointer-events-none animate-fluid-orb" 
        style={{ animationDuration: '24s' }}
      />
      <div 
        className="absolute bottom-[-15%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tl from-emerald-500/12 via-teal-600/8 to-transparent blur-[140px] pointer-events-none animate-fluid-orb" 
        style={{ animationDuration: '28s', animationDelay: '-8s' }}
      />
      <div 
        className="absolute top-[35%] right-[15%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-tr from-purple-600/10 via-indigo-600/6 to-transparent blur-[160px] pointer-events-none animate-fluid-orb" 
        style={{ animationDuration: '20s', animationDelay: '-14s' }}
      />

      {/* Top Mobile Header (visible only on md:hidden) */}
      <header className="md:hidden h-14 bg-[#050a18]/85 border-b border-white/[0.08] backdrop-blur-3xl px-3.5 flex items-center justify-between z-30 flex-shrink-0 shadow-lg">
        <div className="flex items-center gap-2.5">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-xl liquid-glass-btn text-slate-200 hover:text-white cursor-pointer"
            title="باز کردن منو"
          >
            <Menu className="w-5 h-5 text-cyan-400" />
          </motion.button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 p-[1px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#070d1e] rounded-[11px] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-cyan-300" />
              </div>
            </div>
            <div>
              <span className="font-black text-xs text-white block tracking-tight">TradeMind AI</span>
              <span className="text-[10px] text-cyan-300 font-semibold block leading-tight truncate max-w-[130px]">
                {getTabTitle()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleNewChat}
            className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border border-cyan-400/40 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-cyan-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-[11px]">تحلیل نو</span>
          </motion.button>
        </div>
      </header>

      {/* Modern Liquid Glass Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsMobileSidebarOpen(false);
        }}
        chatIds={chatIds}
        currentChatId={currentChatId}
        onSelectChat={(id) => {
          setCurrentChatId(id);
          setIsMobileSidebarOpen(false);
        }}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        activeKnowledgeCount={activeKnowledgeItems.length}
        activeModel={activeModel}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Liquid Glass Viewport */}
      <main className="flex-1 flex flex-col h-full min-w-0 bg-transparent relative overflow-hidden z-10 pb-16 md:pb-0">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 flex flex-col h-full min-w-0"
            >
              <ChatView
                messages={currentMessages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                activeModel={activeModel}
                models={models}
                onSelectModel={handleSetDefaultModel}
                activeKnowledge={activeKnowledgeItems}
                onClearChat={handleClearCurrentChat}
                onNavigateToKnowledge={() => setActiveTab('knowledge')}
                onNavigateToModels={() => setActiveTab('models')}
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
              />
            </motion.div>
          )}

          {activeTab === 'sniper' && (
            <motion.div
              key="sniper"
              initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 flex flex-col h-full min-w-0"
            >
              <SniperDeskView
                knowledgeItems={knowledge}
                models={models}
                settings={settings}
                onNavigateToKnowledge={() => setActiveTab('knowledge')}
                onSendSignalToChat={(text) => {
                  setActiveTab('chat');
                  handleSendMessage(text);
                }}
              />
            </motion.div>
          )}

          {(activeTab === 'settings' || activeTab === 'models' || activeTab === 'knowledge') && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 flex flex-col h-full min-w-0"
            >
              <SettingsView
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onReset={handleResetSettings}
                models={models}
                onUpdateModel={handleUpdateModel}
                onSetDefaultModel={handleSetDefaultModel}
                onAddModel={handleAddModel}
                onDeleteModel={handleDeleteModel}
                knowledge={knowledge}
                onAddKnowledge={handleAddKnowledge}
                onUpdateKnowledge={handleUpdateKnowledge}
                onDeleteKnowledge={handleDeleteKnowledge}
                onToggleKnowledgeActive={handleToggleKnowledgeActive}
                initialSection={activeTab === 'models' ? 'models' : activeTab === 'knowledge' ? 'data' : 'general'}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modern Liquid Glass Bottom Navigation Dock (Mobile only: md:hidden) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[#050a18]/92 border-t border-white/[0.1] backdrop-blur-3xl z-40 px-3 py-2 flex items-center justify-around shadow-2xl">
        {/* Chat Tab */}
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center justify-center py-1 px-3.5 rounded-2xl transition-all cursor-pointer relative ${
            activeTab === 'chat'
              ? 'text-cyan-300 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {activeTab === 'chat' && (
            <motion.div 
              layoutId="bottomNavIndicator" 
              className="absolute inset-0 bg-cyan-500/15 border border-cyan-400/40 rounded-2xl -z-10 shadow-[0_0_15px_rgba(6,182,212,0.2)]" 
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            />
          )}
          <MessageSquare className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">اتاق تحلیل</span>
        </button>

        {/* Sniper Desk Tab */}
        <button
          onClick={() => setActiveTab('sniper')}
          className={`flex flex-col items-center justify-center py-1 px-3.5 rounded-2xl transition-all cursor-pointer relative ${
            activeTab === 'sniper'
              ? 'text-emerald-300 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {activeTab === 'sniper' && (
            <motion.div 
              layoutId="bottomNavIndicator" 
              className="absolute inset-0 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl -z-10 shadow-[0_0_15px_rgba(16,185,129,0.25)]" 
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            />
          )}
          <Target className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">اتاق سیگنال</span>
        </button>

        {/* Knowledge Base Tab */}
        <button
          onClick={() => setActiveTab('knowledge')}
          className={`flex flex-col items-center justify-center py-1 px-3.5 rounded-2xl transition-all cursor-pointer relative ${
            activeTab === 'knowledge'
              ? 'text-cyan-300 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {activeTab === 'knowledge' && (
            <motion.div 
              layoutId="bottomNavIndicator" 
              className="absolute inset-0 bg-blue-600/20 border border-cyan-400/40 rounded-2xl -z-10 shadow-[0_0_15px_rgba(56,189,248,0.2)]" 
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            />
          )}
          <div className="relative">
            <Database className="w-5 h-5 mb-0.5" />
            {activeKnowledgeItems.length > 0 && (
              <span className="absolute -top-1 -right-2.5 bg-cyan-400 text-slate-950 font-bold text-[8px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-mono">
                {activeKnowledgeItems.length}
              </span>
            )}
          </div>
          <span className="text-[10px]">استراتژی‌ها</span>
        </button>

        {/* Settings Tab */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center py-1 px-3.5 rounded-2xl transition-all cursor-pointer relative ${
            activeTab === 'settings' || activeTab === 'models'
              ? 'text-purple-300 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {(activeTab === 'settings' || activeTab === 'models') && (
            <motion.div 
              layoutId="bottomNavIndicator" 
              className="absolute inset-0 bg-purple-500/20 border border-purple-400/40 rounded-2xl -z-10 shadow-[0_0_15px_rgba(168,85,247,0.2)]" 
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            />
          )}
          <Settings className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">تنظیمات</span>
        </button>
      </nav>

    </div>
  );
}
