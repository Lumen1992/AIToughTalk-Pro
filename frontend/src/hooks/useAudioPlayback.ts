'use client';

import { useCallback, useRef, useState } from 'react';

export interface UseAudioPlaybackReturn {
  isPlaying: boolean;
  setupPlayback: (audioContext: AudioContext) => Promise<void>;
  playAudio: (audioData: Int16Array) => void;
  clearAudio: () => void;
  cleanup: () => void;
}

export const useAudioPlayback = (
  onPlaybackStart: () => void,
  onPlaybackStop: () => void
): UseAudioPlaybackReturn => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [ttsWorkletNode, setTtsWorkletNode] = useState<AudioWorkletNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const setupPlayback = useCallback(async (audioContext: AudioContext) => {
    try {
      audioContextRef.current = audioContext;
      
      // 加载TTS播放处理器
      await audioContext.audioWorklet.addModule('/ttsPlaybackProcessor.js');
      
      const workletNode = new AudioWorkletNode(
        audioContext,
        'tts-playback-processor'
      );

      // 设置消息处理
      workletNode.port.onmessage = (event) => {
        const { type } = event.data;
        if (type === 'ttsPlaybackStarted') {
          if (!isPlaying) {
            setIsPlaying(true);
            onPlaybackStart();
          }
        } else if (type === 'ttsPlaybackStopped') {
          if (isPlaying) {
            setIsPlaying(false);
            onPlaybackStop();
          }
        }
      };

      // 连接到音频输出
      workletNode.connect(audioContext.destination);
      setTtsWorkletNode(workletNode);
    } catch (error) {
      console.error('Failed to setup audio playback:', error);
      throw error;
    }
  }, [isPlaying, onPlaybackStart, onPlaybackStop]);

  const playAudio = useCallback((audioData: Int16Array) => {
    if (ttsWorkletNode) {
      ttsWorkletNode.port.postMessage(audioData);
    }
  }, [ttsWorkletNode]);

  const clearAudio = useCallback(() => {
    if (ttsWorkletNode) {
      ttsWorkletNode.port.postMessage({ type: 'clear' });
      setIsPlaying(false);
    }
  }, [ttsWorkletNode]);

  const cleanup = useCallback(() => {
    if (ttsWorkletNode) {
      ttsWorkletNode.disconnect();
      setTtsWorkletNode(null);
    }
    setIsPlaying(false);
  }, [ttsWorkletNode]);

  return {
    isPlaying,
    setupPlayback,
    playAudio,
    clearAudio,
    cleanup,
  };
}; 