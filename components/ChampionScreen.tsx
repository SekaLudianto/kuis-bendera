
import React from 'react';
import { motion } from 'framer-motion';
import { LeaderboardEntry } from '../types';
import { TrophyIcon } from './IconComponents';

interface ChampionScreenProps {
  champion: LeaderboardEntry | undefined;
}

const ChampionScreen: React.FC<ChampionScreenProps> = ({ champion }) => {
  return (
    <div className="flex flex-col h-full p-6 bg-gradient-to-b from-gray-900 to-gray-800 rounded-3xl items-center justify-center text-center">
      {champion ? (
        <>
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 150, delay: 0.2 }}
          >
            <TrophyIcon className="w-24 h-24 text-amber-400" />
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-4xl font-bold mt-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500"
          >
            Pemenang Utama!
          </motion.h1>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 flex flex-col items-center"
          >
            <img 
              src={champion.profilePictureUrl} 
              alt={champion.nickname} 
              className="w-28 h-28 rounded-full border-4 border-amber-400 shadow-lg shadow-amber-500/30"
            />
            <p className="mt-4 text-2xl font-bold text-white">{champion.nickname}</p>
            <p className="mt-1 text-xl text-sky-400 font-semibold">{champion.score.toLocaleString()} Poin</p>
          </motion.div>
        </>
      ) : (
        <p className="text-2xl text-gray-400">Tidak ada pemenang di permainan ini.</p>
      )}
    </div>
  );
};

export default ChampionScreen;
