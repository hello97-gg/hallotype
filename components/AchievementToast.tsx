import React, { useEffect, useState } from 'react';
import { Achievement } from '../types';

interface AchievementToastProps {
  achievement: Achievement;
  onDismiss: () => void;
}

const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300); // Wait for fade-out animation
    }, 4000);

    return () => clearTimeout(timer);
  }, [achievement, onDismiss]);

  return (
    <div className={`fixed bottom-5 right-5 w-full max-w-sm bg-[#FFF8E1] dark:bg-gray-700 p-4 rounded-xl border-2 border-[#8D6E63] dark:border-gray-500 shadow-lg transition-transform duration-300 ease-out z-50 ${visible ? 'translate-x-0' : 'translate-x-[calc(100%+2rem)]'}`}>
      <p className="font-bold text-lg text-amber-600 dark:text-amber-400">Achievement Unlocked!</p>
      <div className="flex items-center gap-3 mt-1">
        <achievement.icon className={`w-10 h-10 ${achievement.ringClass.replace('ring-', 'text-')}`} />
        <div>
          <p className="font-bold text-xl">{achievement.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{achievement.description}</p>
        </div>
      </div>
    </div>
  );
};

export default AchievementToast;
