
import React from 'react';
import { Difficulty } from '../types';
import { TIME_OPTIONS, DIFFICULTY_OPTIONS } from '../constants';

interface SettingsProps {
  timeLimit: number;
  setTimeLimit: (time: number) => void;
  difficulty: Difficulty;
  setDifficulty: (difficulty: Difficulty) => void;
  onStart: () => void;
}

const Settings: React.FC<SettingsProps> = ({ timeLimit, setTimeLimit, difficulty, setDifficulty, onStart }) => {
  const buttonBaseClasses = "px-6 py-3 text-2xl border-2 border-[#8D6E63] rounded-lg transition-all duration-200 focus:outline-none dark:border-gray-400";
  const selectedClasses = "bg-[#8D6E63] text-[#FEF7DC] dark:bg-amber-500 dark:text-gray-900";
  const unselectedClasses = "hover:bg-[#EFEBE9] dark:hover:bg-gray-600";

  return (
    <div className="w-full max-w-2xl flex flex-col items-center gap-10">
      <div className="w-full bg-[#FFF8E1] dark:bg-gray-700 p-6 rounded-2xl border-2 border-[#8D6E63] dark:border-gray-500">
        <h2 className="text-3xl font-bold text-center mb-5">Time</h2>
        <div className="flex justify-center gap-4">
          {TIME_OPTIONS.map(time => (
            <button
              key={time}
              onClick={() => setTimeLimit(time)}
              className={`${buttonBaseClasses} ${time === timeLimit ? selectedClasses : unselectedClasses}`}
            >
              {time}s
            </button>
          ))}
        </div>
      </div>

      <div className="w-full bg-[#FFF8E1] dark:bg-gray-700 p-6 rounded-2xl border-2 border-[#8D6E63] dark:border-gray-500">
        <h2 className="text-3xl font-bold text-center mb-5">Difficulty</h2>
        <div className="flex justify-center gap-4">
          {DIFFICULTY_OPTIONS.map(level => (
            <button
              key={level}
              onClick={() => setDifficulty(level)}
              className={`${buttonBaseClasses} ${level === difficulty ? selectedClasses : unselectedClasses} capitalize`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>
      
      <button 
        onClick={onStart} 
        className="mt-6 px-12 py-4 text-4xl font-bold bg-[#FFCA28] text-[#6D4C41] border-2 border-[#6D4C41] rounded-xl hover:bg-[#FFB300] transition-transform transform hover:scale-105 dark:bg-amber-400 dark:text-gray-800 dark:border-amber-500 dark:hover:bg-amber-500"
      >
        Start Test
      </button>
    </div>
  );
};

export default Settings;