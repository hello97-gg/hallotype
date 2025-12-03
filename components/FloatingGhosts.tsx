import React from 'react';

const FloatingGhosts: React.FC = () => {
  const ghosts = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${8 + Math.random() * 6}s`,
    size: 30 + Math.random() * 40,
    opacity: 0.1 + Math.random() * 0.2,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {ghosts.map((ghost) => (
        <div
          key={ghost.id}
          className="absolute ghost-float"
          style={{
            left: ghost.left,
            animationDelay: ghost.animationDelay,
            animationDuration: ghost.animationDuration,
            opacity: ghost.opacity,
          }}
        >
          <svg
            width={ghost.size}
            height={ghost.size}
            viewBox="0 0 64 64"
            fill="currentColor"
            className="text-white"
          >
            <path d="M32 4C18.7 4 8 14.7 8 28v28c0 2.2 1.8 4 4 4 1.1 0 2.1-.4 2.8-1.2l4.2-4.2 4.2 4.2c1.6 1.6 4.1 1.6 5.7 0l4.2-4.2 4.2 4.2c1.6 1.6 4.1 1.6 5.7 0l4.2-4.2 4.2 4.2c.8.8 1.8 1.2 2.8 1.2 2.2 0 4-1.8 4-4V28C56 14.7 45.3 4 32 4zm-8 28c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4zm16 0c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"/>
          </svg>
        </div>
      ))}
    </div>
  );
};

export default FloatingGhosts;
