import type { NextPage } from "next";
import Head from "next/head";
import { useState, useEffect } from "react";
import Game from "../components/Game";
import { GameProvider } from "../hooks/useGame";
import useWindowSize from "../hooks/useWindowSize";
import useGameScale, { GAME_WIDTH, GAME_HEIGHT } from "../hooks/useGameScale";
import UsernameInput from "../components/UsernameInput";
import { getCookie } from "../lib/cookies";

const Home: NextPage = () => {
  const { height } = useWindowSize();
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Calculate scale for game container (with padding for mobile/desktop)
  const { width } = useWindowSize();
  const isMobile = width > 0 && width < 640;
  const padding = isMobile ? 8 : 40; // 8px on mobile, 40px on desktop
  const { scale, scaledWidth, scaledHeight } = useGameScale(padding);

  useEffect(() => {
    // Check for username cookie on client side
    if (typeof window !== "undefined") {
      const cookieUsername = getCookie("discordUsername");
      setUsername(cookieUsername);
      setIsLoading(false);
    }
  }, []);

  const handleUsernameSet = (newUsername: string) => {
    setUsername(newUsername);
  };

  const handleUsernameChange = () => {
    if (typeof window !== "undefined") {
      // Clear cookie and reset username
      document.cookie = "discordUsername=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
      setUsername(null);
    }
  };

  if (isLoading) {
    return (
      <div
        className="fixed w-full flex bg-zinc-800 p-2 sm:p-5 items-center justify-center"
        style={{
          height: `${height}px`,
        }}
      >
        <Head>
          <title>Flappy Bird</title>
          <link rel="icon" href="favicon.ico" />
        </Head>
        <div className="text-white text-sm sm:text-base">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 w-full h-full flex bg-zinc-800 overflow-hidden"
      style={{
        padding: isMobile ? '8px' : '40px',
      }}
    >
      <Head>
        <title>Flappy Bird</title>
        <link rel="icon" href="favicon.ico" />
      </Head>

      {!username ? (
        <div className="w-full h-full">
          <UsernameInput onUsernameSet={handleUsernameSet} />
        </div>
      ) : (
        <div
          className="flex items-center justify-center w-full h-full"
          style={{
            position: 'relative',
          }}
        >
          <div
            style={{
              width: `${GAME_WIDTH}px`,
              height: `${GAME_HEIGHT}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
              position: 'relative',
            }}
          >
            <GameProvider>
              <Game onUsernameChange={handleUsernameChange} username={username} />
            </GameProvider>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
