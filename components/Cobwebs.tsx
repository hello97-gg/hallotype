import React from 'react';

const Cobwebs: React.FC = () => {
  return (
    <>
      {/* Top-left cobweb */}
      <div className="fixed top-0 left-0 pointer-events-none z-10 opacity-30">
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" stroke="currentColor" className="text-gray-400">
          <path d="M0 0 L200 200 M0 0 L150 200 M0 0 L100 200 M0 0 L50 200 M0 0 L200 150 M0 0 L200 100 M0 0 L200 50" strokeWidth="1" opacity="0.5"/>
          <path d="M20 0 Q60 60 0 100 M40 0 Q100 80 0 160 M60 0 Q140 100 0 200" strokeWidth="0.5" opacity="0.3"/>
          <circle cx="30" cy="30" r="2" fill="currentColor" opacity="0.4"/>
          <circle cx="60" cy="50" r="1.5" fill="currentColor" opacity="0.3"/>
          <circle cx="45" cy="70" r="1" fill="currentColor" opacity="0.3"/>
        </svg>
      </div>
      
      {/* Top-right cobweb */}
      <div className="fixed top-0 right-0 pointer-events-none z-10 opacity-30 transform scale-x-[-1]">
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" stroke="currentColor" className="text-gray-400">
          <path d="M0 0 L200 200 M0 0 L150 200 M0 0 L100 200 M0 0 L50 200 M0 0 L200 150 M0 0 L200 100 M0 0 L200 50" strokeWidth="1" opacity="0.5"/>
          <path d="M20 0 Q60 60 0 100 M40 0 Q100 80 0 160 M60 0 Q140 100 0 200" strokeWidth="0.5" opacity="0.3"/>
        </svg>
      </div>

      {/* Bottom corners - smaller cobwebs */}
      <div className="fixed bottom-0 left-0 pointer-events-none z-10 opacity-20 transform rotate-180">
        <svg width="120" height="120" viewBox="0 0 200 200" fill="none" stroke="currentColor" className="text-gray-400">
          <path d="M0 0 L200 200 M0 0 L150 200 M0 0 L100 200 M0 0 L200 150 M0 0 L200 100" strokeWidth="1" opacity="0.5"/>
        </svg>
      </div>
      
      <div className="fixed bottom-0 right-0 pointer-events-none z-10 opacity-20 transform rotate-180 scale-x-[-1]">
        <svg width="120" height="120" viewBox="0 0 200 200" fill="none" stroke="currentColor" className="text-gray-400">
          <path d="M0 0 L200 200 M0 0 L150 200 M0 0 L100 200 M0 0 L200 150 M0 0 L200 100" strokeWidth="1" opacity="0.5"/>
        </svg>
      </div>
    </>
  );
};

export default Cobwebs;
