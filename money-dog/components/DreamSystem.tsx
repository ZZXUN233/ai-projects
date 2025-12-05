import React, { useState } from 'react';
import { Plus, Target, Calendar, Coins, ArrowLeft, Trophy } from 'lucide-react';
import { Dream } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface DreamSystemProps {
  dreams: Dream[];
  setDreams: React.Dispatch<React.SetStateAction<Dream[]>>;
  onBack: () => void;
}

const DreamSystem: React.FC<DreamSystemProps> = ({ dreams, setDreams, onBack }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedDreamId, setSelectedDreamId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  
  // New Dream State
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newDeadline, setNewDeadline] = useState('');

  const handleCreateDream = () => {
    if (!newTitle || !newTarget) return;

    const newDream: Dream = {
      id: Date.now().toString(),
      title: newTitle,
      targetAmount: parseFloat(newTarget),
      currentAmount: 0,
      deadline: newDeadline || '未定',
      coverImage: `https://picsum.photos/400/200?random=${Date.now()}`
    };

    setDreams(prev => [...prev, newDream]);
    setIsCreating(false);
    setNewTitle('');
    setNewTarget('');
    setNewDeadline('');
  };

  const handleDeposit = () => {
    if (!selectedDreamId || !depositAmount) return;
    
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) return;

    setDreams(prev => prev.map(d => {
      if (d.id === selectedDreamId) {
        const updated = { ...d, currentAmount: d.currentAmount + amount };
        // Check for completion
        if (updated.currentAmount >= updated.targetAmount && d.currentAmount < d.targetAmount) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
        return updated;
      }
      return d;
    }));

    setDepositAmount('');
    setSelectedDreamId(null);
    confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#FBBF24', '#F59E0B']
    });
  };

  if (isCreating) {
    return (
      <div className="flex flex-col h-full bg-amber-50 p-6 overflow-y-auto">
        <div className="flex items-center gap-2 mb-6 text-amber-800" onClick={() => setIsCreating(false)}>
          <ArrowLeft className="cursor-pointer" />
          <h2 className="text-xl font-bold">创建新梦想</h2>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">梦想名称</label>
            <input 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full p-4 rounded-xl border border-amber-200 focus:border-amber-500 outline-none" 
              placeholder="例如：去云南旅行" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">需要多少钱？ (元)</label>
            <input 
              type="number"
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
              className="w-full p-4 rounded-xl border border-amber-200 focus:border-amber-500 outline-none" 
              placeholder="5000" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">目标日期 (可选)</label>
            <input 
              type="date"
              value={newDeadline}
              onChange={(e) => setNewDeadline(e.target.value)}
              className="w-full p-4 rounded-xl border border-amber-200 focus:border-amber-500 outline-none" 
            />
          </div>

          <button 
            onClick={handleCreateDream}
            disabled={!newTitle || !newTarget}
            className="w-full py-4 bg-amber-500 text-white rounded-xl font-bold shadow-lg hover:bg-amber-600 disabled:bg-gray-300 transition-all mt-4"
          >
            建立梦想储蓄罐
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-amber-50 relative">
      <div className="p-6 pb-2">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-amber-800 flex items-center gap-2">
             <Trophy className="text-amber-500" /> 
             我的梦想清单
          </h2>
          <button 
            onClick={() => setIsCreating(true)}
            className="p-2 bg-amber-100 rounded-full text-amber-700 hover:bg-amber-200"
          >
            <Plus />
          </button>
        </div>

        {dreams.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-center opacity-60">
            <Target size={64} className="text-amber-300 mb-4" />
            <p className="text-lg text-amber-800">还没有梦想哦</p>
            <p className="text-sm text-gray-500 mt-2">快让钱钱帮你一起建立一个吧！</p>
          </div>
        ) : (
          <div className="space-y-6 pb-20 overflow-y-auto h-[calc(100vh-200px)] scrollbar-hide">
            {dreams.map(dream => {
              const progress = Math.min(100, (dream.currentAmount / dream.targetAmount) * 100);
              return (
                <div key={dream.id} className="bg-white rounded-3xl shadow-sm border border-amber-100 overflow-hidden relative">
                  <div className="h-32 bg-gray-200 relative">
                    <img src={dream.coverImage} alt={dream.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-4 text-white">
                      <h3 className="text-xl font-bold">{dream.title}</h3>
                      <p className="text-xs opacity-90 flex items-center gap-1">
                        <Calendar size={12} /> {dream.deadline}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex justify-between text-sm mb-2 font-medium text-gray-600">
                      <span>已存: ¥{dream.currentAmount}</span>
                      <span>目标: ¥{dream.targetAmount}</span>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden mb-4 relative">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${progress}%` }}
                         className="h-full bg-amber-400 rounded-full"
                       />
                       {/* Shine effect */}
                       <div className="absolute top-0 bottom-0 right-0 w-full h-full bg-white opacity-20" style={{ transform: 'skewX(-20deg) translateX(100%)', animation: 'shine 2s infinite' }}></div>
                    </div>
                    
                    {selectedDreamId === dream.id ? (
                      <div className="flex gap-2 items-center mt-2 animate-in slide-in-from-top-2 duration-300">
                        <span className="text-xl font-bold text-amber-500">¥</span>
                        <input 
                          type="number" 
                          autoFocus
                          value={depositAmount}
                          onChange={e => setDepositAmount(e.target.value)}
                          className="flex-1 border-b-2 border-amber-400 outline-none py-1 text-lg font-mono"
                          placeholder="0"
                        />
                        <button 
                          onClick={handleDeposit}
                          className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-bold shadow-md hover:bg-amber-600"
                        >
                          存入
                        </button>
                         <button 
                          onClick={() => setSelectedDreamId(null)}
                          className="px-3 py-2 text-gray-400 hover:text-gray-600"
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setSelectedDreamId(dream.id)}
                        className="w-full py-3 mt-1 flex items-center justify-center gap-2 bg-amber-50 text-amber-700 rounded-xl font-semibold hover:bg-amber-100 transition-colors"
                      >
                        <Coins size={18} />
                        给梦想存点钱
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DreamSystem;
