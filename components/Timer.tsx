import React from 'react';

interface TimerProps {
  timeLeft: number;
}

const Timer: React.FC<TimerProps> = ({ timeLeft }) => {
  return (
    <div className="bg-[#FFF8E1] dark:bg-gray-700 px-8 py-2 rounded-xl border-2 border-[#8D6E63] dark:border-gray-500">
      <p className="text-4xl font-bold text-center text-[#4DB6AC] dark:text-teal-400">
        {timeLeft}
      </p>
    </div>
  );
};

export default Timer;