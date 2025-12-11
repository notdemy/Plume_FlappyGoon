import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { setCookie, getCookie } from '../lib/cookies';

interface UsernameInputProps {
  onUsernameSet: (username: string) => void;
}

export default function UsernameInput({ onUsernameSet }: UsernameInputProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if username already exists in cookie
    const existingUsername = getCookie('discordUsername');
    if (existingUsername) {
      onUsernameSet(existingUsername);
    }
  }, [onUsernameSet]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    
    if (!trimmedUsername) {
      setError('Username is required');
      return;
    }

    if (trimmedUsername.length > 50) {
      setError('Username must be 50 characters or less');
      return;
    }

    setError('');
    setCookie('discordUsername', trimmedUsername, 365); // Store for 1 year
    onUsernameSet(trimmedUsername);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center w-full h-full bg-[#ded895] p-4 sm:p-8"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-zinc-200 rounded-xl p-4 sm:p-8 max-w-md w-full border-2 sm:border-4 border-zinc-300"
      >
        <h1 className="text-xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 text-green-900 uppercase font-mono">
          Welcome to Flappy Bird
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label htmlFor="username" className="block text-xs sm:text-sm font-semibold text-green-900 mb-2 uppercase font-mono">
              Enter Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              placeholder="Your username"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border-2 border-zinc-400 focus:border-green-600 focus:outline-none text-base sm:text-lg font-mono touch-manipulation"
              autoFocus
              maxLength={50}
            />
            {error && (
              <p className="mt-2 text-xs sm:text-sm text-red-600 font-mono">{error}</p>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full bg-green-600 active:bg-green-700 hover:bg-green-700 text-white font-bold py-3 sm:py-3 px-6 rounded-lg uppercase font-mono text-base sm:text-lg transition-colors border-2 border-green-700 touch-manipulation min-h-[44px]"
          >
            Start Game
          </button>
        </form>
        
        <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-center text-zinc-600 font-mono">
          Username is optional but required to play
        </p>
      </motion.div>
    </motion.div>
  );
}

