
import React from 'react';
import { motion } from 'framer-motion';
import { RoundWinner } from '../types';
import { PartyPopperIcon } from './IconComponents';

interface RoundWinnerModalProps {
  winners: RoundWinner[];
  round: number;
}

const getRankDisplay = (rank: number) => {
    if (rank === 0) return '🥇';
    if (rank === 1) return '🥈';
    if (rank === 2) return '🥉';
    return `${rank + 1}.`;
};

const RoundWinnerModal: React.FC<RoundWinnerModalProps> = ({ winners, round }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="absolute inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
    >
      <div className="w-full max-w-sm bg-gray-800 border-2 border-sky-500 rounded-2xl p-6 text-center shadow-2xl shadow-sky-500/30">
        <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [-5, 5, 0]}}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: "mirror" }}
            className="text-amber-400 mx-auto w-fit"
        >
            <PartyPopperIcon className="w-12 h-12" />
        </motion.div>
        <h2 className="text-2xl font-bold mt-2 text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-teal-400">
          Pemenang Ronde {round}!
        </h2>
        <div className="mt-4 space-y-2">
            {winners.sort((a,b) => a.time - b.time).map((winner, index) => (
                <motion.div 
                    key={winner.nickname}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex items-center p-2 bg-gray-700/50 rounded-lg text-left"
                >
                    <div className="w-8 font-bold text-center">{getRankDisplay(index)}</div>
                    <img src={winner.profilePictureUrl} alt={winner.nickname} className="w-8 h-8 rounded-full mx-2"/>
                    <div className="flex-1">
                        <p className="font-semibold text-sm text-white">{winner.nickname}</p>
                        <p className="text-xs text-gray-400">{winner.time.toFixed(1)} detik</p>
                    </div>
                    <div className="font-bold text-green-400">+{winner.score}</div>
                </motion.div>
            ))}
             {winners.length === 0 && (
                <p className="text-gray-400 pt-4">Tidak ada pemenang di ronde ini.</p>
             )}
        </div>
      </div>
    </motion.div>
  );
};

export default RoundWinnerModal;
