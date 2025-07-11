'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { WebSocketMessage } from '@/types';

export interface UseWebSocketReturn {
  socket: WebSocket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  sendMessage: (message: WebSocketMessage) => void;
  sendBinary: (data: ArrayBuffer) => void;
}

export const useWebSocket = (
  onMessage: (message: WebSocketMessage) => void
): UseWebSocketReturn => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    
    ws.onopen = () => {
      setIsConnected(true);
      setSocket(ws);
      socketRef.current = ws;
    };

    ws.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const message = JSON.parse(event.data);
          onMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setSocket(null);
      socketRef.current = null;
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
  }, [onMessage]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
    }
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  }, []);

  const sendBinary = useCallback((data: ArrayBuffer) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(data);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  return {
    socket,
    isConnected,
    connect,
    disconnect,
    sendMessage,
    sendBinary,
  };
}; 