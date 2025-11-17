
import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { motion } from 'framer-motion';

interface ChatTabProps {
  messages: ChatMessage[];
}

const ChatTab: React.FC<ChatTabProps> = ({ messages }) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = 0;
    }
  }, [messages]);
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="p-4 flex flex-col h-full"
    >
      <div className="flex items-center mb-4">
        <h2 className="text-lg font-semibold">Live Chat</h2>
        <div className="ml-2 flex items-center gap-1.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="text-red-500 text-sm font-bold">LIVE</span>
        </div>
      </div>
      <div ref={chatContainerRef} className="flex-grow overflow-y-auto flex flex-col-reverse">
        <div>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              layout
              className={`p-2 rounded-lg mb-2 flex items-start gap-3 ${
                msg.isWinner ? 'bg-amber-500/20 border border-amber-500/50' : 'bg-gray-800'
              }`}
            >
              <img
                src={msg.profilePictureUrl || 'https://i.pravatar.cc/40'}
                alt={msg.nickname}
                className="w-8 h-8 rounded-full mt-1"
              />
              <div className="flex-1">
                <p className={`font-semibold text-sm ${msg.isWinner ? 'text-amber-300' : 'text-sky-300'}`}>
                  {msg.nickname}
                </p>
                <p className="text-white break-words">{msg.comment}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatTab;
