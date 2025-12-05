import React from 'react';
import { motion } from 'framer-motion';
import { Mood } from '../types';

interface MoneyAvatarProps {
  mood: Mood;
  size?: 'sm' | 'md' | 'lg';
}

const MoneyAvatar: React.FC<MoneyAvatarProps> = ({ mood, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-24 h-24',
    lg: 'w-40 h-40',
  };

  // Simple SVG representation of a White Labrador
  // We change the expression based on Mood
  
  const getExpression = () => {
    switch (mood) {
      case Mood.EXCITED:
        return (
            <>
                <path d="M35 45 Q45 55 55 45" stroke="#4B5563" strokeWidth="3" fill="none" />
                <circle cx="30" cy="35" r="4" fill="#1F2937" />
                <circle cx="60" cy="35" r="4" fill="#1F2937" />
                <path d="M40 60 Q45 70 50 60" fill="#FF8ba7" />
            </>
        );
      case Mood.WORRIED:
        return (
            <>
                <path d="M35 50 Q45 45 55 50" stroke="#4B5563" strokeWidth="3" fill="none" />
                <circle cx="30" cy="35" r="4" fill="#1F2937" />
                <circle cx="60" cy="35" r="4" fill="#1F2937" />
            </>
        );
      case Mood.SLEEPING:
        return (
            <>
                <path d="M30 40 L40 40" stroke="#1F2937" strokeWidth="3" />
                <path d="M55 40 L65 40" stroke="#1F2937" strokeWidth="3" />
                <path d="M45 50 Q50 55 55 50" stroke="#4B5563" strokeWidth="2" fill="none" />
                <text x="60" y="30" fontSize="12" fill="#4B5563">zZ</text>
            </>
        );
      case Mood.HAPPY:
      default:
        return (
            <>
                <path d="M35 50 Q45 55 55 50" stroke="#4B5563" strokeWidth="3" fill="none" />
                <circle cx="30" cy="35" r="4" fill="#1F2937" />
                <circle cx="60" cy="35" r="4" fill="#1F2937" />
            </>
        );
    }
  };

  return (
    <motion.div 
      className={`${sizeClasses[size]} relative flex items-center justify-center rounded-full bg-amber-100 border-4 border-white shadow-lg overflow-hidden`}
      animate={mood === Mood.EXCITED ? { y: [0, -5, 0] } : {}}
      transition={{ repeat: mood === Mood.EXCITED ? Infinity : 0, duration: 0.5 }}
    >
        <svg viewBox="0 0 90 90" className="w-full h-full">
            {/* Ears */}
            <path d="M10 25 Q5 45 20 55" fill="#fef3c7" stroke="#fbbf24" strokeWidth="2" />
            <path d="M80 25 Q85 45 70 55" fill="#fef3c7" stroke="#fbbf24" strokeWidth="2" />
            {/* Head */}
            <rect x="20" y="15" width="50" height="60" rx="25" fill="#fffbeb" stroke="#fcd34d" strokeWidth="2"/>
            {/* Snout */}
            <ellipse cx="45" cy="55" rx="12" ry="10" fill="#fde68a" />
            <ellipse cx="45" cy="50" rx="4" ry="3" fill="#1F2937" />
            
            {getExpression()}
        </svg>
    </motion.div>
  );
};

export default MoneyAvatar;
