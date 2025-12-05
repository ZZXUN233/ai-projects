import React, { useState, useEffect } from 'react';
import { MessageCircle, Target, BookOpen } from 'lucide-react';
import { Dream, DiaryEntry, ChatMessage, Mood, AppView } from './types';
import ChatInterface from './components/ChatInterface';
import DreamSystem from './components/DreamSystem';
import SuccessDiary from './components/SuccessDiary';
import { initializeChat } from './services/geminiService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.CHAT);
  
  // App State
  // In a real app, these would be persisted in LocalStorage or a Database
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [diaryEntries, setEntries] = useState<DiaryEntry[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
        id: 'init-1',
        role: 'model',
        text: '你好呀！我是钱钱。很高兴见到你！我们要一起为了梦想努力哦，汪！',
        timestamp: Date.now(),
        mood: Mood.HAPPY
    }
  ]);
  const [moneyMood, setMoneyMood] = useState<Mood>(Mood.HAPPY);

  // Initialize Gemini Chat Context whenever core data changes significantly
  useEffect(() => {
    // Only re-initialize if we are actually chatting to keep context fresh
    // Or do it once on mount and then update prompt context dynamically in deeper implementation
    // For this MVP, we re-init if dreams/diary is empty on first load to set the stage.
    initializeChat(dreams, diaryEntries);
  }, [dreams.length, diaryEntries.length]);

  const renderView = () => {
    switch (currentView) {
      case AppView.CHAT:
        return (
          <ChatInterface 
            messages={messages} 
            setMessages={setMessages}
            moneyMood={moneyMood}
            setMoneyMood={setMoneyMood}
            onChangeView={setCurrentView}
          />
        );
      case AppView.DREAMS:
        return (
          <DreamSystem 
            dreams={dreams} 
            setDreams={setDreams}
            onBack={() => setCurrentView(AppView.CHAT)}
          />
        );
      case AppView.DIARY:
        return (
          <SuccessDiary 
            entries={diaryEntries} 
            setEntries={setEntries} 
            setMoneyMood={setMoneyMood}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto h-screen bg-white shadow-2xl flex flex-col overflow-hidden relative">
      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {renderView()}
      </div>

      {/* Bottom Navigation */}
      <div className="h-16 bg-white border-t border-gray-100 flex justify-around items-center px-2 z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
        <button 
          onClick={() => setCurrentView(AppView.CHAT)}
          className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors ${currentView === AppView.CHAT ? 'text-amber-500' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <MessageCircle size={24} strokeWidth={currentView === AppView.CHAT ? 2.5 : 2} />
          <span className="text-[10px] font-medium">钱钱</span>
        </button>
        
        <button 
          onClick={() => setCurrentView(AppView.DREAMS)}
          className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors ${currentView === AppView.DREAMS ? 'text-amber-500' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Target size={24} strokeWidth={currentView === AppView.DREAMS ? 2.5 : 2} />
          <span className="text-[10px] font-medium">梦想</span>
        </button>

        <button 
          onClick={() => setCurrentView(AppView.DIARY)}
          className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors ${currentView === AppView.DIARY ? 'text-amber-500' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <BookOpen size={24} strokeWidth={currentView === AppView.DIARY ? 2.5 : 2} />
          <span className="text-[10px] font-medium">日记</span>
        </button>
      </div>
    </div>
  );
};

export default App;
