/**
 * Hook for managing game session state and API interactions
 */

import { useState, useCallback } from 'react';
import { v4 } from 'uuid';
import { getCookie } from '../lib/cookies';

const PLAYER_ID_KEY = 'flappyPlayerId';

/**
 * Get or create player ID from localStorage
 */
function getPlayerId() {
  if (typeof window === 'undefined') return null;
  
  let playerId = localStorage.getItem(PLAYER_ID_KEY);
  if (!playerId) {
    playerId = v4();
    localStorage.setItem(PLAYER_ID_KEY, playerId);
  }
  return playerId;
}

export default function useGameState() {
  const [sessionToken, setSessionToken] = useState(null);
  const [gameSeed, setGameSeed] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [jumps, setJumps] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Start a new game session
   * Calls /api/game/start to get session token and seed
   */
  const startGame = useCallback(async () => {
    const username = getCookie('discordUsername');
    if (!username) {
      throw new Error('Username is required');
    }

    try {
      const response = await fetch('/api/game/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        throw new Error('Failed to start game session');
      }

      const data = await response.json();
      setSessionToken(data.token);
      setGameSeed(data.seed);
      setStartTime(Date.now());
      setJumps([]);
      return { token: data.token, seed: data.seed };
    } catch (error) {
      console.error('Error starting game:', error);
      throw error;
    }
  }, []);

  /**
   * Record a jump timestamp
   */
  const recordJump = useCallback(() => {
    const timestamp = Date.now();
    setJumps((prev) => [...prev, timestamp]);
  }, []);

  /**
   * Submit score to server
   * Calculates duration and sends game data for validation
   */
  const submitScore = useCallback(async (score) => {
    if (!sessionToken || !gameSeed || !startTime) {
      console.warn('Cannot submit score: missing session data');
      return { success: false, error: 'Missing session data' };
    }

    if (isSubmitting) {
      console.warn('Score submission already in progress');
      return { success: false, error: 'Submission in progress' };
    }

    setIsSubmitting(true);

    try {
      const username = getCookie('discordUsername');
      const playerId = getPlayerId();
      
      if (!username || !playerId) {
        throw new Error('Missing username or player ID');
      }

      const duration = Date.now() - startTime;
      const pipesPassed = score; // In this game, score equals pipes passed

      const response = await fetch('/api/game/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionToken,
          username,
          playerId,
          score,
          gameData: {
            seed: gameSeed,
            jumps: jumps,
            duration,
            pipesPassed,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit score');
      }

      const data = await response.json();
      return { success: true, ...data };
    } catch (error) {
      console.error('Error submitting score:', error);
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [sessionToken, gameSeed, startTime, jumps, isSubmitting]);

  /**
   * Reset game state (for new game)
   */
  const resetGameState = useCallback(() => {
    setSessionToken(null);
    setGameSeed(null);
    setStartTime(null);
    setJumps([]);
    setIsSubmitting(false);
  }, []);

  return {
    sessionToken,
    gameSeed,
    startTime,
    jumps,
    isSubmitting,
    startGame,
    recordJump,
    submitScore,
    resetGameState,
  };
}

