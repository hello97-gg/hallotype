import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import FloatingGhosts from './components/FloatingGhosts';
import Cobwebs from './components/Cobwebs';
import FlyingBats from './components/FlyingBats';

// Halloween wrapper component
const HalloweenWrapper: React.FC = () => {
  return (
    <>
      {/* Halloween decorations */}
      <FloatingGhosts />
      <Cobwebs />
      <FlyingBats />
      
      {/* Lightning flash effect */}
      <div className="fixed inset-0 pointer-events-none lightning-flash z-50" />
      
      {/* Fog layer */}
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-purple-900/30 to-transparent fog-layer pointer-events-none z-0" />
      
      {/* Original App */}
      <App />
    </>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HalloweenWrapper />
  </React.StrictMode>
);
