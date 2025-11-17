
import React, { useState } from 'react';
import GameTab from './GameTab';
import ChatTab from './ChatTab';
import LeaderboardTab from './LeaderboardTab';
import { GamepadIcon, MessageCircleIcon, TrophyIcon } from './IconComponents';
import { AnimatePresence } from 'framer-motion';
import RoundWinnerModal from './RoundWinnerModal';
import ReconnectOverlay from './ReconnectOverlay';

type Tab = 'game' | 'chat' | 'leaderboard';

interface GameScreenProps {
  gameState: any; // Simplified for brevity
  isDisconnected: boolean;
  onReconnect: () => void;
  connectionError: string | null;
}

const GameScreen: React.FC<GameScreenProps> = ({ gameState, isDisconnected, onReconnect, connectionError }) => {
  const [activeTab, setActiveTab] = useState<Tab>('game');

  const navItems = [
    { id: 'game', label: 'Game', icon: GamepadIcon },
    { id: 'chat', label: 'Chat', icon: MessageCircleIcon },
    { id: 'leaderboard', label: 'Peringkat', icon: TrophyIcon },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-3xl">
      <header className="p-4 text-center border-b border-gray-700">
        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-teal-400">
          Tebak Bendera Negara
        </h1>
      </header>

      <main className="flex-grow overflow-y-auto relative">
        <AnimatePresence mode="wait">
            {activeTab === 'game' && <GameTab key="game" gameState={gameState} />}
            {activeTab === 'chat' && <ChatTab key="chat" messages={gameState.chatMessages} />}
            {activeTab === 'leaderboard' && <LeaderboardTab key="leaderboard" leaderboard={gameState.leaderboard} />}
        </AnimatePresence>
        <AnimatePresence>
          {gameState.showWinnerModal && <RoundWinnerModal winners={gameState.roundWinners} round={gameState.round} />}
        </AnimatePresence>
        <AnimatePresence>
          {isDisconnected && <ReconnectOverlay onReconnect={onReconnect} error={connectionError} />}
        </AnimatePresence>
      </main>

      <nav className="flex justify-around p-2 border-t border-gray-700 bg-gray-800 rounded-b-3xl">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as Tab)}
            className={`flex flex-col items-center justify-center w-20 h-16 rounded-lg transition-colors duration-200 ${
              activeTab === item.id ? 'text-sky-400 bg-sky-400/10' : 'text-gray-400 hover:bg-gray-700'
            }`}
          >
            <item.icon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default GameScreen;
