
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TOTAL_ROUNDS } from '../constants';

interface GameTabProps {
  gameState: any; // Simplified
}

const GameTab: React.FC<GameTabProps> = ({ gameState }) => {
  const { round, currentCountry, scrambledCountryName, roundWinners, roundTimer } = gameState;
  const progressPercentage = (round / TOTAL_ROUNDS) * 100;
  const firstWinner = roundWinners.length > 0 ? roundWinners[0] : null;

  return (
    <motion.div 
      key={round}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="p-4 flex flex-col h-full"
    >
      <div className="flex justify-between items-center mb-2 text-sm text-gray-400">
        <span>Ronde {round} / {TOTAL_ROUNDS}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
        <motion.div
          className="bg-gradient-to-r from-sky-500 to-teal-400 h-2.5 rounded-full"
          initial={{ width: `${((round - 1) / TOTAL_ROUNDS) * 100}%` }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      <div className="flex-grow flex flex-col items-center justify-center">
        {currentCountry && (
          <motion.img
            key={currentCountry.code}
            src={`https://flagcdn.com/w320/${currentCountry.code}.png`}
            alt={`Bendera ${currentCountry.name}`}
            className="w-48 sm:w-64 border-4 border-gray-600 rounded-lg shadow-lg shadow-black/30"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
          />
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
            {scrambledCountryName.map((letter: string, index: number) => (
                <motion.div
                    key={index}
                    className="w-10 h-12 bg-gray-800 border-2 border-gray-600 rounded-md flex items-center justify-center text-2xl font-bold text-amber-400"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                >
                    {letter}
                </motion.div>
            ))}
        </div>
      </div>
      
      <div className="h-20 text-center flex flex-col justify-center">
        <AnimatePresence>
            {firstWinner && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center"
                >
                    <div className="flex items-center gap-2 bg-amber-500/10 p-2 rounded-lg">
                        <img src={firstWinner.profilePictureUrl} alt={firstWinner.nickname} className="w-8 h-8 rounded-full"/>
                        <p className="text-amber-300 font-semibold">{firstWinner.nickname} menemukan jawaban!</p>
                    </div>
                    <p className="text-sky-300 mt-2">Sisa waktu: {roundTimer} detik</p>
                </motion.div>
            )}
        </AnimatePresence>
        {!firstWinner && <p className="text-gray-400 text-sm">Ketik jawaban di kolom komentar live!</p>}
      </div>
    </motion.div>
  );
};

export default GameTab;
