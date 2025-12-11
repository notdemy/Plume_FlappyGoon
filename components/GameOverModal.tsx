import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameOverModalProps {
  isOpen: boolean;
  username: string;
  currentScore: number;
  highestScore: number;
  isNewHighScore: boolean;
  onPlayAgain: () => void;
}

export default function GameOverModal({
  isOpen,
  username,
  currentScore,
  highestScore,
  isNewHighScore,
  onPlayAgain,
}: GameOverModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-60 z-50 rounded-xl"
            onClick={onPlayAgain}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#ded895] border-4 border-zinc-200 rounded-xl p-4 max-w-[360px] w-[90%] shadow-2xl">
              {/* GAME OVER Title */}
              <motion.h2
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="text-4xl font-bold text-center mb-6 text-orange-600 uppercase font-mono"
                style={{
                  textShadow: '2px 2px 0px white, -2px -2px 0px white, 2px -2px 0px white, -2px 2px 0px white',
                }}
              >
                GAME OVER
              </motion.h2>

              {/* Score Panel */}
              <div className="bg-green-100 border-4 border-green-600 rounded-lg p-4 mb-4">
                {/* Player Name */}
                <div className="text-center mb-3">
                  <div className="text-xs uppercase font-mono text-green-800 mb-1">Player</div>
                  <div className="text-lg font-bold font-mono text-green-900">{username}</div>
                </div>

                <div className="flex justify-between items-center mb-3">
                  {/* Current Score */}
                  <div className="text-center flex-1">
                    <div className="text-xs uppercase font-mono text-green-800 mb-1">Score</div>
                    <div className="text-2xl font-bold font-mono text-green-900">{currentScore}</div>
                  </div>

                  {/* Highest Score */}
                  <div className="text-center flex-1 border-l-2 border-green-600">
                    <div className="text-xs uppercase font-mono text-green-800 mb-1">Best</div>
                    <div className="text-2xl font-bold font-mono text-green-900">{highestScore}</div>
                  </div>
                </div>

                {/* New High Score Badge */}
                {isNewHighScore && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                    className="text-center mt-2"
                  >
                    <span className="inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase font-mono">
                      🎉 New High Score! 🎉
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Play Again Button */}
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={onPlayAgain}
                className="w-full bg-green-600 hover:bg-green-700 active:bg-green-700 text-white font-bold py-3 px-6 rounded-lg uppercase font-mono text-lg transition-colors border-4 border-green-700 shadow-lg touch-manipulation"
              >
                Play Again
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

