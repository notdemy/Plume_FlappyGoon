import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import FlappyBird from "./FlappyBird";
import Footer from "./Footer";
import Background from "./Background";
import GameOverModal from "./GameOverModal";
import useGame from "../hooks/useGame";
import Pipes from "./Pipes";
import useElementSize from "../hooks/useElementSize";
import { GAME_WIDTH, GAME_HEIGHT } from "../hooks/useGameScale";
import _ from "lodash";
import Link from "next/link";

interface GameProps {
  username: string;
  onUsernameChange: () => void;
}

export default function Game({ username, onUsernameChange }: GameProps) {
  const { handleWindowClick, startGame, isReady, rounds, isStarted } = useGame();
  const [ref, window] = useElementSize();
  const [showGameOver, setShowGameOver] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [dbHighestScore, setDbHighestScore] = useState(0);
  const prevIsStarted = React.useRef(isStarted);

  // Fetch highest score from database
  useEffect(() => {
    const fetchHighestScore = async () => {
      try {
        const response = await fetch(`/api/user/score?username=${encodeURIComponent(username)}`);
        if (response.ok) {
          const data = await response.json();
          setDbHighestScore(data.highestScore || 0);
        }
      } catch (error) {
        console.error('Failed to fetch highest score:', error);
      }
    };

    if (username) {
      fetchHighestScore();
    }
  }, [username]);

  useEffect(() => {
    if (window.width > 0 && window.height > 0) {
      startGame(window);
    }
  }, [window, ref]);

  // Detect game over
  useEffect(() => {
    // Game just ended (was started, now not started)
    if (prevIsStarted.current && !isStarted && rounds.length > 0) {
      const currentRound = _.last(rounds);
      if (currentRound) {
        const currentScore = currentRound.score;
        
        // Check if this is a new high score compared to database
        const isNewHigh = currentScore > dbHighestScore;
        
        setLastScore(currentScore);
        setIsNewHighScore(isNewHigh);
        
        // Refresh highest score from database after score submission
        // The score submission happens asynchronously in useGame hook
        // We'll refresh after a delay to ensure the database is updated
        const refreshHighestScore = async () => {
          try {
            const response = await fetch(`/api/user/score?username=${encodeURIComponent(username)}`);
            if (response.ok) {
              const data = await response.json();
              const newHighestScore = data.highestScore || 0;
              setDbHighestScore(newHighestScore);
              // Update new high score status based on refreshed data
              if (currentScore > newHighestScore) {
                setIsNewHighScore(true);
              }
            }
          } catch (error) {
            console.error('Failed to refresh highest score:', error);
          }
        };
        
        // Refresh immediately and again after submission delay
        refreshHighestScore();
        setTimeout(refreshHighestScore, 1000);
        
        setShowGameOver(true);
      }
    }
    prevIsStarted.current = isStarted;
  }, [isStarted, rounds, dbHighestScore, username]);

  const handlePlayAgain = () => {
    setShowGameOver(false);
    // Click will trigger new game start
    handleWindowClick();
  };

  return (
    <motion.main
      layout
      className="overflow-hidden flex flex-col border-8 border-zinc-200 rounded-xl bg-[#ded895] relative"
      style={{
        width: `${GAME_WIDTH}px`,
        height: `${GAME_HEIGHT}px`,
      }}
    >
      <Background />
      {/* Playing as and buttons */}
      <div className="absolute top-2 left-2 right-2 z-50 flex items-center justify-between gap-2">
        <div className="bg-zinc-200 bg-opacity-90 px-3 py-1 rounded-lg border-2 border-zinc-400">
          <span className="text-xs font-mono text-green-900 font-semibold">
            Playing as: {username.length > 10 ? `${username.substring(0, 10)}...` : username}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onUsernameChange}
            className="bg-green-600 active:bg-green-700 hover:bg-green-700 text-white text-xs font-bold py-1 px-2 rounded uppercase font-mono transition-colors border-2 border-green-700 touch-manipulation"
          >
            Change
          </button>
          <Link href="/leaderboard">
            <a className="bg-blue-600 active:bg-blue-700 hover:bg-blue-700 text-white text-xs font-bold py-1 px-2 rounded uppercase font-mono transition-colors border-2 border-blue-700 touch-manipulation inline-flex items-center justify-center">
              Leaderboard
            </a>
          </Link>
        </div>
      </div>
      <motion.div
        ref={ref} 
        key={_.last(rounds)?.key || "initial"}
        onTap={handleWindowClick}
        className="h-[calc(100%-7rem)] z-10 flex relative overflow-hidden cursor-pointer touch-manipulation"
      >
        {isReady && (
          <>
            <Pipes />
            <FlappyBird />
          </>
        )}
      </motion.div>
      <Footer username={username} dbHighestScore={dbHighestScore} />
      
      {/* Game Over Modal */}
      <GameOverModal
        isOpen={showGameOver}
        username={username}
        currentScore={lastScore}
        highestScore={dbHighestScore}
        isNewHighScore={isNewHighScore}
        onPlayAgain={handlePlayAgain}
      />
    </motion.main>
  );
}
