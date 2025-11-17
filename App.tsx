
import React, { useState, useCallback, useEffect } from 'react';
import SetupScreen from './components/SetupScreen';
import GameScreen from './components/GameScreen';
import GameOverScreen from './components/GameOverScreen';
import ChampionScreen from './components/ChampionScreen';
import { useGameLogic } from './hooks/useGameLogic';
import { useTikTokLive } from './hooks/useTikTokLive';
import { GameState } from './types';
import { AnimatePresence, motion } from 'framer-motion';
import { CHAMPION_SCREEN_TIMEOUT_MS, FINAL_LEADERBOARD_TIMEOUT_MS } from './constants';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.Setup);
  const [username, setUsername] = useState<string>('');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isDisconnected, setIsDisconnected] = useState(false);

  const game = useGameLogic();
  
  const { connectionStatus, connect, disconnect, error } = useTikTokLive(game.processComment);

  const handleStart = useCallback((tiktokUsername: string) => {
    setConnectionError(null);
    setIsDisconnected(false);
    setUsername(tiktokUsername);
    setGameState(GameState.Connecting);
    connect(tiktokUsername);
  }, [connect]);

  const handleReconnect = useCallback(() => {
    setConnectionError(null);
    setIsDisconnected(false);
    connect(username);
  }, [connect, username]);

  const resetForNewGame = useCallback(() => {
    disconnect();
    game.resetGame();
    setGameState(GameState.Setup);
    setUsername('');
    setConnectionError(null);
    setIsDisconnected(false);
  }, [disconnect, game]);

  useEffect(() => {
    if (connectionStatus === 'connected') {
      if (gameState === GameState.Connecting) {
        setGameState(GameState.Playing);
        game.startGame();
      }
      setIsDisconnected(false);
    }
    
    if (connectionStatus === 'error' || connectionStatus === 'disconnected') {
      const errorMessage = error || "Koneksi terputus. Silakan coba lagi.";
      setConnectionError(errorMessage);
      
      if (gameState === GameState.Playing) {
        setIsDisconnected(true);
      } else if (gameState === GameState.Connecting) {
        setGameState(GameState.Setup);
        disconnect(); // Full cleanup if initial connection fails
      }
    }
  }, [connectionStatus, gameState, error, game, disconnect]);


  useEffect(() => {
    if (game.state.isGameOver && gameState === GameState.Playing) {
      setGameState(GameState.Champion);
      
      const toLeaderboardTimeout = setTimeout(() => {
        setGameState(GameState.Finished);
      }, CHAMPION_SCREEN_TIMEOUT_MS);

      const toSetupTimeout = setTimeout(() => {
        resetForNewGame();
      }, CHAMPION_SCREEN_TIMEOUT_MS + FINAL_LEADERBOARD_TIMEOUT_MS);

      return () => {
        clearTimeout(toLeaderboardTimeout);
        clearTimeout(toSetupTimeout);
      };
    }
  }, [game.state.isGameOver, gameState, resetForNewGame]);


  const champion = game.state.leaderboard.length > 0 ? game.state.leaderboard[0] : undefined;

  return (
    <div className="w-full min-h-screen bg-gray-900 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-sm h-[80vh] min-h-[600px] max-h-[800px] bg-gray-800 rounded-3xl shadow-2xl shadow-sky-500/10 border border-gray-700 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {(gameState === GameState.Setup) && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full"
            >
              <SetupScreen onStart={handleStart} error={connectionError} />
            </motion.div>
          )}

          {gameState === GameState.Connecting && (
             <motion.div
              key="connecting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center text-center p-4"
            >
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-400"></div>
                <p className="mt-4 text-sky-300">Menghubungkan ke live @{username}...</p>
                <p className="text-xs text-gray-400 mt-2">Pastikan username benar dan streamer sedang live.</p>
            </motion.div>
          )}

          {gameState === GameState.Playing && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="h-full"
            >
              <GameScreen 
                gameState={game.state} 
                isDisconnected={isDisconnected}
                onReconnect={handleReconnect}
                connectionError={connectionError}
              />
            </motion.div>
          )}

          {gameState === GameState.Champion && (
            <motion.div
              key="champion"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="h-full"
            >
              <ChampionScreen champion={champion} />
            </motion.div>
          )}

          {gameState === GameState.Finished && (
            <motion.div
              key="finished"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="h-full"
            >
              <GameOverScreen leaderboard={game.state.leaderboard} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;
