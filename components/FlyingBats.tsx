import React from 'react';

const FlyingBats: React.FC = () => {
  const bats = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    top: `${10 + Math.random() * 30}%`,
    animationDelay: `${i * 3}s`,
    animationDuration: `${12 + Math.random() * 8}s`,
    size: 20 + Math.random() * 20,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {bats.map((bat) => (
        <div
          key={bat.id}
          className="absolute bat-fly"
          style={{
            top: bat.top,
            left: '-50px',
            animationDelay: bat.animationDelay,
            animationDuration: bat.animationDuration,
          }}
        >
          <svg
            width={bat.size}
            height={bat.size}
            viewBox="0 0 64 64"
            fill="currentColor"
            className="text-purple-900 opacity-40"
          >
            <path d="M32 20c-4 0-8 2-10 5-2-3-6-5-10-5-6 0-12 6-12 12 0 8 10 16 22 24h0c12-8 22-16 22-24 0-6-6-12-12-12-4 0-8 2-10 5-2-3-6-5-10-5z M8 28c-2-4 0-8 4-8s6 2 8 6c-4 1-8 2-12 2z M56 28c-4 0-8-1-12-2 2-4 4-6 8-6s6 4 4 8z M32 16V8 M28 12l4-4 4 4"/>
          </svg>
        </div>
      ))}
    </div>
  );
};

export default FlyingBats;
