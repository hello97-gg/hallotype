import React from 'react';

const CONFETTI_COUNT = 150;
const COLORS = ['#FFCA28', '#4DB6AC', '#8D6E63', '#FF7043', '#7E57C2'];

const Confetti: React.FC = React.memo(() => {
  const confetti = Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
    const style: React.CSSProperties = {
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${3 + Math.random() * 2}s`,
      backgroundColor: COLORS[Math.floor(Math.random() * COLORS.length)],
      transform: `rotate(${Math.random() * 360}deg)`,
    };
    return <div key={i} className="confetti-piece" style={style}></div>;
  });

  return <div className="confetti-container">{confetti}</div>;
});

export default Confetti;
