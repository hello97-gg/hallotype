import React from 'react';

interface KeyboardProps {
  activeKey: string | null;
}

const KEY_LAYOUT = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
  ['space'],
];

const Keyboard: React.FC<KeyboardProps> = ({ activeKey }) => {
  return (
    <div className="w-full max-w-3xl p-4 bg-[#FFF8E1] dark:bg-gray-700 rounded-xl border-2 border-[#8D6E63] dark:border-gray-500 flex flex-col gap-2">
      {KEY_LAYOUT.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-2">
          {row.map(key => {
            const isActive = activeKey === key;
            const keyClasses = `
              h-12 rounded-md flex items-center justify-center font-mono text-xl transition-all duration-75
              ${isActive ? 'bg-purple-400 dark:bg-purple-500 text-white scale-110' : 'bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200'}
              ${key === 'space' ? 'w-1/2' : 'w-12'}
            `;
            return (
              <div key={key} className={keyClasses}>
                {key === 'space' ? ' ' : key}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;