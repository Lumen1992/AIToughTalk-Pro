'use client';

import React from 'react';

interface ControlBarProps {
  isConnected: boolean;
  speed: number;
  onStart: () => void;
  onStop: () => void;
  onClear: () => void;
  onSpeedChange: (speed: number) => void;
  onCopy: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  isConnected,
  speed,
  onStart,
  onStop,
  onClear,
  onSpeedChange,
  onCopy,
}) => {
  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseInt(e.target.value);
    onSpeedChange(newSpeed);
  };

  return (
    <div className="input-bar">
      <div className="speed-control">
        <input 
          type="range" 
          className="speed-slider"
          min="0" 
          max="100" 
          value={speed}
          onChange={handleSpeedChange}
          disabled={!isConnected}
        />
        <div className="speed-labels">
          <span>Fast</span>
          <span>Slow</span>
        </div>
      </div>

      <br />

      <button 
        onClick={onStart}
        title="Start voice chat" 
        className="btn start-btn"
        disabled={isConnected}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 5L8 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M8 5L18 12L8 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      <button 
        onClick={onStop}
        title="Stop voice chat" 
        className="btn stop-btn"
        disabled={!isConnected}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="6" y="6" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </button>
      
      <button 
        onClick={onClear}
        title="Reset conversation" 
        className="btn reset-btn"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C14.8273 3 17.35 4.30367 19 6.34267" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M14.5 6.5L19.5 6.5L19.5 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button> 

      <button 
        onClick={onCopy}
        title="Copy conversation" 
        className="btn copy-btn"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="9" y="9" width="11" height="11" rx="1" stroke="currentColor" strokeWidth="2"/>
          <path d="M5 15H4C3.44772 15 3 14.5523 3 14V4C3 3.44772 3.44772 3 4 3H14C14.5523 3 15 3.44772 15 4V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}; 