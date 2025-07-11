'use client';

import React, { useEffect, useRef } from 'react';
import { Message } from '@/types';

interface MessageListProps {
  messages: Message[];
  typingUser: string;
  typingAssistant: string;
}

const escapeHtml = (str: string): string => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
};

export const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  typingUser, 
  typingAssistant 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUser, typingAssistant]);

  return (
    <div className="messages">
      {messages.map((message, index) => (
        <div key={index} className={`bubble ${message.role}`}>
          {message.content}
        </div>
      ))}
      
      {typingUser && (
        <div className="bubble user typing">
          <span dangerouslySetInnerHTML={{ 
            __html: escapeHtml(typingUser) + '<span style="opacity:.6;">✏️</span>' 
          }} />
        </div>
      )}
      
      {typingAssistant && (
        <div className="bubble assistant typing">
          <span dangerouslySetInnerHTML={{ 
            __html: escapeHtml(typingAssistant) + '<span style="opacity:.6;">✏️</span>' 
          }} />
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}; 