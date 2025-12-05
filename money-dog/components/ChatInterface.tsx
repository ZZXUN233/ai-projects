import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { ChatMessage, Mood, AppView } from '../types';
import MoneyAvatar from './MoneyAvatar';
import { sendMessageToMoney } from '../services/geminiService';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  moneyMood: Mood;
  setMoneyMood: (mood: Mood) => void;
  onChangeView: (view: AppView) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  setMessages, 
  moneyMood, 
  setMoneyMood,
  onChangeView
}) => {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    setMoneyMood(Mood.LISTENING);

    // AI Response
    const aiResponseText = await sendMessageToMoney(inputText);
    
    setIsTyping(false);
    
    // Simple sentiment analysis for mood (could be improved with actual AI analysis)
    let nextMood = Mood.HAPPY;
    if (aiResponseText.includes('棒') || aiResponseText.includes('太好')) nextMood = Mood.EXCITED;
    if (aiResponseText.includes('担心') || aiResponseText.includes('哎呀')) nextMood = Mood.WORRIED;
    setMoneyMood(nextMood);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: aiResponseText,
      timestamp: Date.now(),
      mood: nextMood
    };

    setMessages(prev => [...prev, aiMsg]);
  };

  const handleQuickAction = (action: string) => {
    if (action === 'dream') {
        onChangeView(AppView.DREAMS);
    } else if (action === 'diary') {
        onChangeView(AppView.DIARY);
    }
  };

  return (
    <div className="flex flex-col h-full bg-amber-50 relative">
      {/* Header Area with Money */}
      <div className="flex flex-col items-center justify-center pt-8 pb-4 bg-gradient-to-b from-amber-100 to-amber-50 sticky top-0 z-10">
        <MoneyAvatar mood={moneyMood} size="md" />
        <h2 className="mt-2 text-xl font-bold text-amber-800">小狗钱钱</h2>
        <p className="text-xs text-amber-600 opacity-70">你的专属财富守护犬</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && (
               <div className="mr-2 flex-shrink-0 self-end mb-1">
                   <div className="w-8 h-8 rounded-full bg-amber-200 border-2 border-white overflow-hidden">
                       {/* Mini Avatar for chat bubbles */}
                       <svg viewBox="0 0 90 90" className="w-full h-full">
                           <path d="M10 25 Q5 45 20 55" fill="#fef3c7" stroke="#fbbf24" />
                           <path d="M80 25 Q85 45 70 55" fill="#fef3c7" stroke="#fbbf24" />
                           <rect x="20" y="15" width="50" height="60" rx="25" fill="#fffbeb" stroke="#fcd34d" />
                           <ellipse cx="45" cy="55" rx="12" ry="10" fill="#fde68a" />
                           <circle cx="30" cy="35" r="4" fill="#1F2937" />
                           <circle cx="60" cy="35" r="4" fill="#1F2937" />
                       </svg>
                   </div>
               </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-amber-500 text-white rounded-tr-none'
                  : 'bg-white text-gray-800 rounded-tl-none border border-amber-100'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start items-center space-x-2 pl-12">
             <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
             <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
             <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        )}
        
        {/* Quick Actions Suggestions (if last message was AI) */}
        {!isTyping && messages.length > 0 && messages[messages.length - 1].role === 'model' && (
             <div className="flex gap-2 pl-10 overflow-x-auto pb-2 scrollbar-hide">
                 <button 
                    onClick={() => handleQuickAction('dream')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-amber-200 rounded-full text-xs text-amber-700 whitespace-nowrap shadow-sm active:scale-95 transition-transform"
                 >
                    <Sparkles size={12} />
                    查看梦想
                 </button>
                 <button 
                    onClick={() => handleQuickAction('diary')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-amber-200 rounded-full text-xs text-amber-700 whitespace-nowrap shadow-sm active:scale-95 transition-transform"
                 >
                    <Sparkles size={12} />
                    写成功日记
                 </button>
             </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-amber-100 sticky bottom-0">
        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-full border border-gray-200 focus-within:border-amber-400 transition-colors">
          <input
            type="text"
            className="flex-1 bg-transparent px-4 py-2 outline-none text-sm placeholder-gray-400"
            placeholder="和钱钱聊聊你的想法..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            className={`p-2.5 rounded-full text-white transition-all shadow-md ${
              inputText.trim() && !isTyping ? 'bg-amber-500 hover:bg-amber-600 scale-100' : 'bg-gray-300 scale-90'
            }`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
