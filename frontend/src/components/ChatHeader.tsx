'use client';

import React from 'react';

interface ChatHeaderProps {
  status: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ status }) => {
  return (
    <div className="header">
      <svg height="24" width="24" viewBox="0 0 22 22" fill="#fff" style={{marginRight: '8px'}}>
        <circle cx="11" cy="11" r="12" fill="#222F3D" />
        <text
          x="50%"
          y="50%"
          fill="#fff"
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize="12"
          fontFamily="Inter"
        >AI</text>
      </svg>
      Real-Time Voice Chat
      <span className="status">{status}</span>
    </div>
  );
}; 