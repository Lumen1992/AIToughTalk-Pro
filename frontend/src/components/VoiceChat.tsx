'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Message, WebSocketMessage } from '@/types';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAudioCapture } from '@/hooks/useAudioCapture';
import { useAudioPlayback } from '@/hooks/useAudioPlayback';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ControlBar } from './ControlBar';

// 音频批处理常量
const BATCH_SAMPLES = 2048;
const HEADER_BYTES = 8;
const FRAME_BYTES = BATCH_SAMPLES * 2;
const MESSAGE_BYTES = HEADER_BYTES + FRAME_BYTES;

export const VoiceChat: React.FC = () => {
  const [status, setStatus] = useState('未连接');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [typingUser, setTypingUser] = useState('');
  const [typingAssistant, setTypingAssistant] = useState('');
  const [speed, setSpeed] = useState(0);
  const [ignoreIncomingTTS, setIgnoreIncomingTTS] = useState(false);

  // 音频批处理状态
  const bufferPoolRef = useRef<ArrayBuffer[]>([]);
  const batchBufferRef = useRef<ArrayBuffer | null>(null);
  const batchViewRef = useRef<DataView | null>(null);
  const batchInt16Ref = useRef<Int16Array | null>(null);
  const batchOffsetRef = useRef(0);

  // Base64解码函数
  const base64ToInt16Array = useCallback((b64: string): Int16Array => {
    const raw = atob(b64);
    const buf = new ArrayBuffer(raw.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < raw.length; i++) {
      view[i] = raw.charCodeAt(i);
    }
    return new Int16Array(buf);
  }, []);

  // WebSocket消息处理
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    const { type, content } = message;

    switch (type) {
      case 'partial_user_request':
        setTypingUser(content?.trim() || '');
        break;
      case 'final_user_request':
        if (content?.trim()) {
          setChatHistory(prev => [...prev, { role: 'user', content, type: 'final' }]);
        }
        setTypingUser('');
        break;
      case 'partial_assistant_answer':
        setTypingAssistant(content?.trim() || '');
        break;
      case 'final_assistant_answer':
        if (content?.trim()) {
          setChatHistory(prev => [...prev, { role: 'assistant', content, type: 'final' }]);
        }
        setTypingAssistant('');
        break;
      case 'tts_chunk':
        if (!ignoreIncomingTTS && content) {
          const int16Data = base64ToInt16Array(content);
          playAudio(int16Data);
        }
        break;
      case 'tts_interruption':
        clearAudio();
        setIgnoreIncomingTTS(false);
        break;
      case 'stop_tts':
        clearAudio();
        setIgnoreIncomingTTS(true);
        sendMessage({ type: 'tts_stop' });
        break;
    }
  }, [ignoreIncomingTTS, base64ToInt16Array]);

  // WebSocket Hook
  const { isConnected, connect, disconnect, sendMessage, sendBinary } = useWebSocket(handleWebSocketMessage);

  // 音频播放Hook
  const { isPlaying, setupPlayback, playAudio, clearAudio, cleanup: cleanupPlayback } = useAudioPlayback(
    () => {
      console.log('TTS playback started');
      sendMessage({ type: 'tts_start' });
    },
    () => {
      console.log('TTS playback stopped');
      sendMessage({ type: 'tts_stop' });
    }
  );

  // 音频批处理函数
  const initBatch = useCallback(() => {
    if (!batchBufferRef.current) {
      batchBufferRef.current = bufferPoolRef.current.pop() || new ArrayBuffer(MESSAGE_BYTES);
      batchViewRef.current = new DataView(batchBufferRef.current);
      batchInt16Ref.current = new Int16Array(batchBufferRef.current, HEADER_BYTES);
      batchOffsetRef.current = 0;
    }
  }, []);

  const flushBatch = useCallback(() => {
    if (batchBufferRef.current && batchViewRef.current) {
      const ts = Date.now() & 0xFFFFFFFF;
      batchViewRef.current.setUint32(0, ts, false);
      const flags = isPlaying ? 1 : 0;
      batchViewRef.current.setUint32(4, flags, false);

      sendBinary(batchBufferRef.current);

      bufferPoolRef.current.push(batchBufferRef.current);
      batchBufferRef.current = null;
      batchViewRef.current = null;
      batchInt16Ref.current = null;
    }
  }, [isPlaying, sendBinary]);

  const flushRemainder = useCallback(() => {
    if (batchOffsetRef.current > 0 && batchInt16Ref.current) {
      for (let i = batchOffsetRef.current; i < BATCH_SAMPLES; i++) {
        batchInt16Ref.current[i] = 0;
      }
      flushBatch();
    }
  }, [flushBatch]);

  // 处理音频数据
  const handleAudioData = useCallback((data: ArrayBuffer) => {
    const incoming = new Int16Array(data);
    let read = 0;
    
    while (read < incoming.length) {
      initBatch();
      
      if (batchInt16Ref.current) {
        const toCopy = Math.min(
          incoming.length - read,
          BATCH_SAMPLES - batchOffsetRef.current
        );
        
        batchInt16Ref.current.set(
          incoming.subarray(read, read + toCopy),
          batchOffsetRef.current
        );
        
        batchOffsetRef.current += toCopy;
        read += toCopy;
        
        if (batchOffsetRef.current === BATCH_SAMPLES) {
          flushBatch();
        }
      }
    }
  }, [initBatch, flushBatch]);

  // 音频捕获Hook
  const { isCapturing, startCapture, stopCapture, audioContext } = useAudioCapture(handleAudioData);

  // 开始录音
  const handleStart = useCallback(async () => {
    if (isConnected) {
      setStatus('已在录音中');
      return;
    }

    try {
      setStatus('正在初始化连接...');
      connect();
      
      // 等待连接建立
      await new Promise((resolve) => {
        const checkConnection = () => {
          if (isConnected) {
            resolve(undefined);
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });

      setStatus('连接成功，正在激活麦克风和TTS...');
      
      await startCapture();
      
      if (audioContext) {
        await setupPlayback(audioContext);
      }
      
      setStatus('录音中...');
    } catch (error) {
      console.error('启动失败:', error);
      setStatus('启动失败');
    }
  }, [isConnected, connect, startCapture, audioContext, setupPlayback]);

  // 停止录音
  const handleStop = useCallback(() => {
    flushRemainder();
    disconnect();
    stopCapture();
    cleanupPlayback();
    setStatus('已停止');
  }, [flushRemainder, disconnect, stopCapture, cleanupPlayback]);

  // 清除历史
  const handleClear = useCallback(() => {
    setChatHistory([]);
    setTypingUser('');
    setTypingAssistant('');
    sendMessage({ type: 'clear_history' });
  }, [sendMessage]);

  // 设置速度
  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
    sendMessage({ type: 'set_speed', speed: newSpeed });
  }, [sendMessage]);

  // 复制对话
  const handleCopy = useCallback(() => {
    const text = chatHistory
      .map(msg => `${msg.role.charAt(0).toUpperCase() + msg.role.slice(1)}: ${msg.content}`)
      .join('\n');
    
    navigator.clipboard.writeText(text)
      .then(() => console.log('对话已复制到剪贴板'))
      .catch(err => console.error('复制失败:', err));
  }, [chatHistory]);

  // 清理资源
  useEffect(() => {
    return () => {
      stopCapture();
      cleanupPlayback();
      disconnect();
    };
  }, [stopCapture, cleanupPlayback, disconnect]);

  return (
    <div id="app">
      <div className="chat-container">
        <ChatHeader status={status} />
        <MessageList 
          messages={chatHistory}
          typingUser={typingUser}
          typingAssistant={typingAssistant}
        />
        <ControlBar
          isConnected={isConnected}
          speed={speed}
          onStart={handleStart}
          onStop={handleStop}
          onClear={handleClear}
          onSpeedChange={handleSpeedChange}
          onCopy={handleCopy}
        />
      </div>
    </div>
  );
}; 