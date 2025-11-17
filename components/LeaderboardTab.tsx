
import React from 'react';
import { LeaderboardEntry } from '../types';
import { motion } from 'framer-motion';

interface LeaderboardTabProps {
  leaderboard: LeaderboardEntry[];
}

const getMedal = (rank: number) => {
  if (rank === 0) return '🥇';
  if (rank === 1) return '🥈';
  if (rank === 2) return '🥉';
  return `${rank + 1}.`;
};

const LeaderboardTab: React.FC<LeaderboardTabProps> = ({ leaderboard }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="p-4"
    >
      <h2 className="text-lg font-semibold mb-4 text-center">Papan Peringkat Global</h2>
      <div className="space-y-2">
        {leaderboard.map((entry, index) => (
          <motion.div
            key={entry.nickname}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center p-3 bg-gray-800 rounded-lg"
          >
            <div className="w-8 font-bold text-lg text-center text-amber-400">{getMedal(index)}</div>
            <img
              src={entry.profilePictureUrl || 'https://i.pravatar.cc/40'}
              alt={entry.nickname}
              className="w-10 h-10 rounded-full mx-3"
            />
            <div className="flex-1">
              <p className="font-semibold text-white">{entry.nickname}</p>
            </div>
            <div className="text-sky-400 font-bold">{entry.score.toLocaleString()}</div>
          </motion.div>
        ))}
        {leaderboard.length === 0 && (
            <p className="text-center text-gray-500 pt-10">Papan peringkat masih kosong. Mainkan ronde untuk mendapatkan skor!</p>
        )}
      </div>
    </motion.div>
  );
};

export default LeaderboardTab;
