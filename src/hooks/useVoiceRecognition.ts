import { useState, useEffect, useCallback, useRef } from 'react';

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
}

interface SpeechRecognitionStatic {
  new(): SpeechRecognition;
}

interface UseVoiceRecognitionOptions {
  onResult?: (text: string) => void;
  onError?: (error: Error) => void;
  onStateChange?: (state: 'initializing' | 'ready' | 'recording' | 'error') => void;
  continuous?: boolean;
  interimResults?: boolean;
}

export function useVoiceRecognition({ 
  onResult, 
  onError, 
  onStateChange,
  continuous = false,
  interimResults = true
}: UseVoiceRecognitionOptions) {
  const [isReady, setIsReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const initializeRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      const error = new Error('Speech recognition not supported in this browser');
      onError?.(error);
      onStateChange?.('error');
      setIsInitializing(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      onStateChange?.('recording');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }

      if (finalTranscript) {
        onResult?.(finalTranscript.trim());
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const error = new Error(`Speech recognition error: ${event.error}`);
      onError?.(error);
      setIsRecording(false);
      onStateChange?.('error');
    };

    recognition.onend = () => {
      setIsRecording(false);
      onStateChange?.('ready');
    };

    recognitionRef.current = recognition;
    setIsReady(true);
    setIsInitializing(false);
    onStateChange?.('ready');
  }, [onResult, onError, onStateChange, continuous, interimResults]);

  const startRecording = useCallback(() => {
    if (recognitionRef.current && !isRecording) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to start recording');
        onError?.(err);
        onStateChange?.('error');
      }
    }
  }, [isRecording, onError, onStateChange]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  }, [isRecording]);

  useEffect(() => {
    initializeRecognition();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [initializeRecognition]);

  return {
    isReady,
    isRecording,
    isInitializing,
    startRecording,
    stopRecording,
    state: isRecording ? 'recording' : isReady ? 'ready' : isInitializing ? 'initializing' : 'error'
  };
}

// Extend the Window interface to include speech recognition
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}
