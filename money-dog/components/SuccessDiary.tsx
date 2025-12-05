import React, { useState } from 'react';
import { Book, PenTool, Star, Plus } from 'lucide-react';
import { DiaryEntry, Mood } from '../types';
import { generateDiaryComment } from '../services/geminiService';
import MoneyAvatar from './MoneyAvatar';

interface SuccessDiaryProps {
  entries: DiaryEntry[];
  setEntries: React.Dispatch<React.SetStateAction<DiaryEntry[]>>;
  setMoneyMood: (mood: Mood) => void;
}

const SuccessDiary: React.FC<SuccessDiaryProps> = ({ entries, setEntries, setMoneyMood }) => {
  const [isWriting, setIsWriting] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSaveEntry = async () => {
    if (!newContent.trim()) return;

    setIsProcessing(true);
    setMoneyMood(Mood.LISTENING);

    const aiComment = await generateDiaryComment(newContent);
    setMoneyMood(Mood.EXCITED);

    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      content: newContent,
      aiComment: aiComment
    };

    setEntries(prev => [newEntry, ...prev]);
    setIsWriting(false);
    setNewContent('');
    setIsProcessing(false);
  };

  const getDayString = (isoDate: string) => {
    const date = new Date(isoDate);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  if (isWriting) {
    return (
      <div className="flex flex-col h-full bg-white p-6">
        <h2 className="text-xl font-bold text-amber-800 mb-2">记录成功日记</h2>
        <p className="text-sm text-gray-500 mb-6">不论多小的事情，只要做到了，就是成功！</p>
        
        <div className="flex-1">
          <textarea
            className="w-full h-48 p-4 bg-amber-50 rounded-2xl border-none resize-none focus:ring-2 focus:ring-amber-200 outline-none text-gray-700 leading-relaxed"
            placeholder="今天我..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          ></textarea>
          
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {/* Auto suggestions - Mocked for MVP */}
            {['今天我没有乱花钱', '坚持记账了', '为了梦想存了钱'].map(s => (
                <button 
                    key={s}
                    onClick={() => setNewContent(s)}
                    className="px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-600 whitespace-nowrap border border-gray-200"
                >
                    {s}
                </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSaveEntry}
          disabled={!newContent.trim() || isProcessing}
          className="w-full py-4 bg-amber-500 text-white rounded-xl font-bold shadow-lg hover:bg-amber-600 disabled:bg-gray-300 transition-all flex items-center justify-center gap-2"
        >
          {isProcessing ? (
              <>正在告诉钱钱...</>
          ) : (
              <>完成，求夸奖！ <Star size={18} fill="currentColor" /></>
          )}
        </button>
        <button 
            onClick={() => setIsWriting(false)}
            className="mt-4 text-gray-400 text-sm w-full text-center"
        >
            返回
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-amber-50 relative">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-amber-800 flex items-center gap-2">
             <Book className="text-amber-500" /> 
             成功日记
          </h2>
          <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
            已记录 <span className="font-bold">{entries.length}</span> 天
          </div>
        </div>

        <button
          onClick={() => setIsWriting(true)}
          className="w-full py-4 bg-white border-2 border-dashed border-amber-300 rounded-2xl text-amber-600 font-semibold flex items-center justify-center gap-2 hover:bg-amber-50 transition-colors mb-6 shadow-sm"
        >
          <PenTool size={20} />
          写今天的日记
        </button>

        <div className="space-y-4 pb-20">
          {entries.length === 0 ? (
             <div className="text-center py-10 opacity-50">
                 <p>空空如也...</p>
                 <p className="text-sm">每天记录5件事，会让你更自信哦！</p>
             </div>
          ) : (
              entries.map((entry) => (
                <div key={entry.id} className="bg-white p-5 rounded-2xl shadow-sm border border-amber-50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-lg">
                        {getDayString(entry.date)}
                    </span>
                  </div>
                  <p className="text-gray-800 mb-4 leading-relaxed">{entry.content}</p>
                  
                  {/* AI Comment Section */}
                  <div className="flex items-start gap-3 bg-amber-50 p-3 rounded-xl">
                    <div className="w-8 h-8 flex-shrink-0">
                         <MoneyAvatar mood={Mood.HAPPY} size="sm" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-amber-800 mb-0.5">钱钱说：</p>
                        <p className="text-sm text-amber-900 opacity-90">{entry.aiComment}</p>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SuccessDiary;
