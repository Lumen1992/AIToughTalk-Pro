export interface Message {
  role: 'user' | 'assistant';
  content: string;
  type: 'final' | 'partial';
}

export interface WebSocketMessage {
  type: string;
  content?: string;
  speed?: number;
}

export interface AudioWorkletMessage {
  type?: string;
  data?: ArrayBuffer;
} 