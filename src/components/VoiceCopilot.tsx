import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, Settings, Loader2, Volume2, VolumeX, Send, Keyboard } from 'lucide-react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  action?: {
    type: 'navigate';
    path: string;
    label: string;
  };
}

export const VoiceCopilot = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your dynamic Tender Tracker assistant. I can help you with navigation and answer questions. How can I assist you today?',
      timestamp: new Date(),
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [textInput, setTextInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  const { speak, stop: stopSpeaking, isSpeaking } = useTextToSpeech({
    rate: 0.9,
    pitch: 1,
    volume: 0.8,
    onError: (error) => {
      console.error('Text-to-speech error:', error);
    }
  });

  const handleUserMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      // Call the Zepth AI API for all queries
      const response = await fetch('https://workflow.zepth.ai/api/v1/run/eede8533-6407-4a3a-8e7e-b1b4972f4a98?stream=false', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ZEPTH_API_KEY || 'your-api-key-here',
        },
        body: JSON.stringify({
          input_value: text,
          output_type: 'chat',
          input_type: 'chat',
          tweaks: {
            'ChatInput-mAKQz': {},
            'ChatOutput-Gq9Mp': {},
            'Agent-OWru0': {},
            'APIRequest-zbMzn': {}
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Enhanced console logging for debugging API response
      console.log('🤖 FULL ChatBot API Response:', JSON.stringify(data, null, 2));
      
      // Extract the response text from the API response based on the actual structure
      let botResponseText = '';
      
      try {
        // Try multiple paths to find the message text in the response structure
        let messageText = null;
        
        // Path 1: data.outputs[0].outputs[0].results.message.text
        messageText = data?.outputs?.[0]?.outputs?.[0]?.results?.message?.text;
        
        // Path 2: data.outputs[0].outputs[0].results.message.data.text
        if (!messageText) {
          messageText = data?.outputs?.[0]?.outputs?.[0]?.results?.message?.data?.text;
        }
        
        // Path 3: data.outputs[0].outputs[0].artifacts.message
        if (!messageText) {
          messageText = data?.outputs?.[0]?.outputs?.[0]?.artifacts?.message;
        }
        
        // Path 4: data.outputs[0].outputs[0].messages[0].message
        if (!messageText) {
          messageText = data?.outputs?.[0]?.outputs?.[0]?.messages?.[0]?.message;
        }
        
        console.log('🔍 Found message text at:', messageText ? 'success' : 'not found');
        
        if (messageText) {
          console.log('📝 Raw Message:', messageText);
          
          // Clean the JSON string by removing extra newlines and whitespace
          const cleanedMessageText = messageText.replace(/\n/g, '').replace(/\s+/g, ' ').trim();
          console.log('🧹 Cleaned Message:', cleanedMessageText);
          
          // Parse the JSON response from the text field
          const parsedResponse = JSON.parse(cleanedMessageText);
          console.log('✅ Parsed Response:', parsedResponse);
          
          // Handle navigation vs response based on tonavigate flag
          if (parsedResponse.tonavigate === "1") {
            // Navigation mode - check for both 'navto' (new) and 'url' (old) keys
            const navigationPath = parsedResponse.navto || parsedResponse.url;
            const responseMessage = parsedResponse.rsp || parsedResponse.message;
            
            console.log('🧭 Navigation Debug:');
            console.log('  - navto:', parsedResponse.navto);
            console.log('  - url:', parsedResponse.url);
            console.log('  - final navigationPath:', navigationPath);
            console.log('  - navigationPath type:', typeof navigationPath);
            console.log('  - navigationPath length:', navigationPath?.length);
            console.log('  - responseMessage:', responseMessage);
            
            if (navigationPath && navigationPath.trim() !== '') {
              if (navigationPath.startsWith('http://') || navigationPath.startsWith('https://')) {
                // External URL - open in new tab
                console.log('🌐 Opening external URL:', navigationPath);
                window.open(navigationPath, '_blank');
                botResponseText = responseMessage || `Opening ${navigationPath} in a new tab!`;
              } else {
                // Internal path - navigate within app
                console.log('🏠 Attempting internal navigation to:', navigationPath);
                console.log('🏠 Current location before navigation:', location.pathname);
                console.log('🏠 Navigate function available:', typeof navigate);
                
                try {
                  // Try React Router navigation first
                  navigate(navigationPath);
                  console.log('✅ React Router navigation call completed');
                  
                  // Add a small delay to check if navigation actually happened
                  setTimeout(() => {
                    console.log('🏠 Current location after navigation:', window.location.pathname);
                    
                    // If React Router navigation didn't work, try window.location
                    if (window.location.pathname !== navigationPath) {
                      console.log('🔄 React Router navigation failed, trying window.location');
                      window.location.pathname = navigationPath;
                    }
                  }, 200);
                  
                  botResponseText = responseMessage || `Navigated to ${navigationPath}`;
                } catch (navError) {
                  console.error('❌ Navigation failed:', navError);
                  console.log('🔄 Trying fallback navigation with window.location');
                  
                  try {
                    window.location.pathname = navigationPath;
                    botResponseText = responseMessage || `Navigated to ${navigationPath}`;
                  } catch (fallbackError) {
                    console.error('❌ Fallback navigation also failed:', fallbackError);
                    botResponseText = `Failed to navigate to ${navigationPath}. Error: ${navError instanceof Error ? navError.message : 'Unknown error'}`;
                  }
                }
              }
            } else {
              console.log('⚠️ No valid navigation path found');
              botResponseText = responseMessage || 'Navigation requested but no valid URL provided.';
            }
          } else {
            // Response mode (tonavigate === "0" or default) - check for both 'rsp' (new) and 'message' (old) keys
            botResponseText = parsedResponse.rsp || parsedResponse.message || 'No response provided.';
          }
        } else {
          throw new Error('No message text found in response');
        }
      } catch (parseError) {
        console.error('❌ Error parsing API response:', parseError);
        
        // Try to extract any available message as fallback
        const fallbackMessage = data?.outputs?.[0]?.outputs?.[0]?.results?.message?.text || 
                               data?.outputs?.[0]?.outputs?.[0]?.artifacts?.message ||
                               'I apologize, but I couldn\'t process the response properly.';
        
        botResponseText = fallbackMessage;
      }

      console.log('✅ Final bot response:', botResponseText);

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: botResponseText,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botResponse]);
      setIsProcessing(false);

      // Speak the response if auto-speak is enabled
      if (autoSpeak) {
        setTimeout(() => {
          speak(botResponseText);
        }, 500);
      }

    } catch (error) {
      console.error('❌ Error calling Zepth AI API:', error);
      
      // Fallback response on error
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error while processing your request. Please try again.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botResponse]);
      setIsProcessing(false);
    }
  }, [navigate, autoSpeak, speak]);

  const { isReady, isRecording, startRecording, stopRecording, state } = useVoiceRecognition({
    onResult: handleUserMessage,
    onError: (error) => {
      console.error('Voice recognition error:', error);
    }
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleRecordToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      handleUserMessage(textInput.trim());
      setTextInput('');
    }
  };

  const handleInputModeToggle = () => {
    setInputMode(inputMode === 'voice' ? 'text' : 'voice');
    if (inputMode === 'voice' && textInputRef.current) {
      setTimeout(() => textInputRef.current?.focus(), 100);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        className={clsx(
          "fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-lg transition-all duration-300",
          "bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 hover:from-blue-500 hover:via-indigo-600 hover:to-purple-700",
          "flex items-center justify-center backdrop-blur-sm",
          isOpen ? "scale-0" : "scale-100"
        )}
      >
        <Mic className="w-8 h-8 text-white" />
      </button>

      {/* Copilot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-40 w-[500px] bg-gradient-to-b from-slate-50 to-white shadow-2xl flex flex-col backdrop-blur-xl"
            style={{
              backgroundImage: 'radial-gradient(circle at 100% 100%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 0% 0%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <Mic className="w-6 h-6" />
                <h2 className="text-lg font-semibold">AI Co-pilot</h2>
                {(isProcessing || isSpeaking) && (
                  <div className="flex items-center space-x-2">
                    {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSpeaking && <Volume2 className="w-4 h-4 animate-pulse" />}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setAutoSpeak(!autoSpeak)}
                  className={clsx(
                    "p-2 rounded-full transition-colors",
                    autoSpeak ? "bg-white/20 hover:bg-white/30" : "hover:bg-white/10"
                  )}
                  title={autoSpeak ? "Disable auto-speak" : "Enable auto-speak"}
                >
                  {autoSpeak ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
                <button
                  onClick={handleToggle}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="mb-8">
                    <motion.button
                      onClick={handleRecordToggle}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={!isReady}
                      className={clsx(
                        "w-32 h-32 rounded-full transition-all duration-300 transform relative",
                        !isReady && "opacity-50 cursor-not-allowed",
                        isRecording
                          ? "bg-gradient-to-br from-red-400 to-red-600 text-white"
                          : "bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 text-white",
                        "flex items-center justify-center"
                      )}
                    >
                      <div className="absolute inset-0 rounded-full bg-white/20 backdrop-blur-sm" />
                      {!isReady ? (
                        <Loader2 className="w-16 h-16 relative z-10 animate-spin" />
                      ) : (
                        <Mic className="w-16 h-16 relative z-10" />
                      )}
                      {isRecording && (
                        <motion.div
                          className="absolute inset-0 rounded-full border-4 border-white/30"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </motion.button>
                  </div>
                  <p className="text-xl text-gray-700 font-medium mb-8">
                    {!isReady ? 'Initializing voice recognition...' : 'Click the microphone to start a conversation'}
                  </p>
                  <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                    {[
                      "What can you help me with?",
                      "Tell me about voice recognition",
                      "Show me some information",
                      "How does this work?"
                    ].map((text, i) => (
                      <motion.button
                        key={i}
                        onClick={() => handleUserMessage(text)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-4 text-sm bg-gradient-to-br from-slate-50 to-white shadow-lg rounded-xl hover:shadow-xl transition-all text-left border border-slate-100"
                      >
                        {text}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={message.id}
                      className={clsx(
                        "flex",
                        message.type === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={clsx(
                          "max-w-[80%] rounded-2xl px-6 py-4 shadow-lg",
                          message.type === 'user'
                            ? "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white"
                            : "bg-white text-gray-900"
                        )}
                      >
                        {message.content}
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            {messages.length > 0 && (
              <div className="p-6 border-t border-slate-100 bg-white/50 backdrop-blur-sm space-y-4">
                {/* Input Mode Toggle */}
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={handleInputModeToggle}
                    className={clsx(
                      "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200",
                      inputMode === 'voice'
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    <Mic className="w-4 h-4" />
                    <span className="text-sm font-medium">Voice</span>
                  </button>
                  <button
                    onClick={handleInputModeToggle}
                    className={clsx(
                      "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200",
                      inputMode === 'text'
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    <Keyboard className="w-4 h-4" />
                    <span className="text-sm font-medium">Type</span>
                  </button>
                </div>

                {/* Voice Input */}
                {inputMode === 'voice' && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleRecordToggle}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!isReady}
                    className={clsx(
                      "w-full py-4 rounded-xl transition-all duration-300 shadow-lg",
                      !isReady && "opacity-50 cursor-not-allowed",
                      isRecording
                        ? "bg-gradient-to-r from-red-400 to-red-600 text-white"
                        : "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white",
                      "flex items-center justify-center space-x-2"
                    )}
                  >
                    {!isReady ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Mic className="w-6 h-6" />
                    )}
                    <span className="font-medium">
                      {!isReady ? 'Initializing...' : isRecording ? "Tap to stop" : "Tap to speak"}
                    </span>
                  </motion.button>
                )}

                {/* Text Input */}
                {inputMode === 'text' && (
                  <motion.form
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleTextSubmit}
                    className="flex space-x-3"
                  >
                    <input
                      ref={textInputRef}
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200 bg-white"
                      disabled={isProcessing}
                    />
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={!textInput.trim() || isProcessing}
                      className={clsx(
                        "px-4 py-3 rounded-xl transition-all duration-200 shadow-lg",
                        !textInput.trim() || isProcessing
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700"
                      )}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </motion.button>
                  </motion.form>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
