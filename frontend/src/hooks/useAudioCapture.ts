'use client';

import { useCallback, useRef, useState } from 'react';

export interface UseAudioCaptureReturn {
  isCapturing: boolean;
  startCapture: () => Promise<void>;
  stopCapture: () => void;
  audioContext: AudioContext | null;
  micWorkletNode: AudioWorkletNode | null;
}

export const useAudioCapture = (
  onAudioData: (data: ArrayBuffer) => void
): UseAudioCaptureReturn => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [micWorkletNode, setMicWorkletNode] = useState<AudioWorkletNode | null>(null);
  
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const startCapture = useCallback(async () => {
    try {
      // 获取音频流
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: { ideal: 24000 },
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      mediaStreamRef.current = stream;

      // 创建AudioContext
      const context = new AudioContext();
      setAudioContext(context);

      // 加载音频工作处理器
      await context.audioWorklet.addModule('/pcmWorkletProcessor.js');
      
      const workletNode = new AudioWorkletNode(context, 'pcm-worklet-processor');
      setMicWorkletNode(workletNode);

      // 设置消息处理
      workletNode.port.onmessage = ({ data }) => {
        onAudioData(data);
      };

      // 连接音频流
      const source = context.createMediaStreamSource(stream);
      source.connect(workletNode);

      setIsCapturing(true);
    } catch (error) {
      console.error('Failed to start audio capture:', error);
      throw error;
    }
  }, [onAudioData]);

  const stopCapture = useCallback(() => {
    if (micWorkletNode) {
      micWorkletNode.disconnect();
      setMicWorkletNode(null);
    }

    if (audioContext) {
      audioContext.close();
      setAudioContext(null);
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    setIsCapturing(false);
  }, [micWorkletNode, audioContext]);

  return {
    isCapturing,
    startCapture,
    stopCapture,
    audioContext,
    micWorkletNode,
  };
}; 