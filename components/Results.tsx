import React, { useState } from 'react';
import { TestHistoryItem, TestResult } from '../types';
import { TrophyIcon, StarIcon, UserIcon, ChartBarIcon, ListIcon } from './icons';
import Confetti from './Confetti';
import TestChart from './TestChart';

interface ResultsProps {
  results: TestHistoryItem | null;
  onRestart: () => void;
  highScores: TestResult;
  isNewHighScore: boolean;
  onViewProfile: () => void;
  isModalView?: boolean;
}

const Stat = ({ label, value, subValue }: { label: string; value: React.ReactNode; subValue?: React.ReactNode }) => (
    <div className="flex flex-col items-center">
        <div className="text-sm text-[#646669]">{label}</div>
        <div className="text-3xl font-bold text-[#d1d5db]">{value}</div>
        {subValue && <div className="text-xs text-gray-500">{subValue}</div>}
    </div>
);

const Results: React.FC<ResultsProps> = ({ results, onRestart, highScores, isNewHighScore, onViewProfile, isModalView }) => {
  const [showDetailed, setShowDetailed] = useState(true);

  if (!results) return null;

  const simpleView = (
    <>
      <TrophyIcon className="w-24 h-24 text-[#FFCA28] dark:text-amber-400" />
      <h2 className="text-5xl font-bold">Results</h2>
      
      {isNewHighScore && !isModalView && (
        <div className="flex items-center gap-3 px-6 py-3 bg-green-100 dark:bg-green-900/50 rounded-lg border-2 border-green-500 dark:border-green-600 text-green-700 dark:text-green-300">
            <StarIcon className="w-8 h-8" />
            <p className="text-2xl font-bold">New High Score!</p>
        </div>
      )}

      <div className="flex justify-around w-full mt-4 gap-6">
        <div className="text-center bg-[#FFF8E1] dark:bg-gray-700 p-8 rounded-2xl border-2 border-[#8D6E63] dark:border-gray-500 flex-1">
          <p className="text-2xl">WPM</p>
          <p className="text-6xl font-bold text-[#4DB6AC] dark:text-teal-400">{results.wpm}</p>
          <p className="text-xl mt-2 text-gray-500 dark:text-gray-400">Best: {highScores.wpm}</p>
        </div>
        <div className="text-center bg-[#FFF8E1] dark:bg-gray-700 p-8 rounded-2xl border-2 border-[#8D6E63] dark:border-gray-500 flex-1">
          <p className="text-2xl">Accuracy</p>
          <p className="text-6xl font-bold text-[#4DB6AC] dark:text-teal-400">{results.accuracy}%</p>
          <p className="text-xl mt-2 text-gray-500 dark:text-gray-400">Best: {highScores.accuracy}%</p>
        </div>
      </div>
    </>
  );

  const detailedView = (
    <div className="w-full max-w-5xl flex flex-col items-center gap-4 text-[#d1d5db]" style={{ fontFamily: "'Fira Code', monospace" }}>
        <div className="w-full flex justify-between items-start">
            <div className="flex flex-col items-start gap-4">
                <div>
                    <div className="text-lg text-[#646669]">wpm</div>
                    <div className="text-6xl text-[#e2b714] font-bold">{results.wpm}</div>
                </div>
                 <div>
                    <div className="text-lg text-[#646669]">acc</div>
                    <div className="text-6xl text-[#e2b714] font-bold">{results.accuracy}%</div>
                </div>
            </div>
            <div className="flex-grow">
              <TestChart data={results.graphData} timeLimit={results.timeLimit} />
            </div>
        </div>
        <div className="w-full grid grid-cols-3 md:grid-cols-5 gap-4 items-center justify-items-center bg-[#323437]/50 p-4 rounded-lg">
            <Stat label="test type" value={
                <div className="text-center text-xl text-[#d1d5db]">
                    <div>time {results.timeLimit}</div>
                    <div className="capitalize">{results.difficulty}</div>
                </div>
            } />
            <Stat label="raw" value={results.rawWpm} />
            <Stat label="characters" value={`${results.charStats.correct}/${results.charStats.incorrect}/${results.charStats.missed}/${results.charStats.extra}`} />
            <Stat label="consistency" value={`${results.consistency}%`} />
            <Stat label="time" value={`${results.timeLimit}s`} subValue={!isModalView ? new Date().toLocaleTimeString() : new Date(results.timestamp).toLocaleString()} />
        </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col items-center gap-6 animate-fade-in relative">
      {!isModalView && <Confetti />}

      {showDetailed ? detailedView : simpleView}
      
      <div className="flex items-center gap-4">
        {!isModalView && (
          <button 
            onClick={onViewProfile} 
            className="mt-6 px-6 py-4 text-3xl font-bold bg-gray-200 text-[#6D4C41] border-2 border-[#6D4C41] rounded-xl hover:bg-gray-300 transition-transform transform hover:scale-105 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500"
          >
            <UserIcon className="w-8 h-8" />
          </button>
        )}
         <button 
            onClick={() => setShowDetailed(!showDetailed)} 
            className="mt-6 px-6 py-4 text-3xl font-bold bg-gray-200 text-[#6D4C41] border-2 border-[#6D4C41] rounded-xl hover:bg-gray-300 transition-transform transform hover:scale-105 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500"
            title={showDetailed ? "Show simple results" : "Show detailed results"}
        >
          {showDetailed ? <ListIcon className="w-8 h-8"/> : <ChartBarIcon className="w-8 h-8"/>}
        </button>
        {!isModalView && (
          <button 
            onClick={onRestart} 
            className="mt-6 px-10 py-4 text-3xl font-bold bg-[#FFCA28] text-[#6D4C41] border-2 border-[#6D4C41] rounded-xl hover:bg-[#FFB300] transition-transform transform hover:scale-105 dark:bg-amber-400 dark:text-gray-800 dark:border-amber-500 dark:hover:bg-amber-500"
          >
            Try Again (Enter)
          </button>
        )}
      </div>
    </div>
  );
};

export default Results;