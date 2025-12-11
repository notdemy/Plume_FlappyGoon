/**
 * Leaderboard Page
 * Displays top players by highest score
 */

import type { NextPage } from 'next';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import useWindowSize from '../hooks/useWindowSize';
import Link from 'next/link';

interface LeaderboardEntry {
  username: string;
  highestScore: number;
  rank?: number;
}

const Leaderboard: NextPage = () => {
  const { height } = useWindowSize();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/leaderboard');
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      const data = await response.json();
      setEntries(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load leaderboard');
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed w-full flex bg-zinc-800 p-2 sm:p-5"
      style={{
        height: `${height}px`,
      }}
    >
      <Head>
        <title>Leaderboard - Flappy Bird</title>
        <link rel="icon" href="favicon.ico" />
      </Head>

      <div className="m-auto max-w-2xl w-full bg-[#ded895] rounded-lg sm:rounded-xl border-4 sm:border-8 border-zinc-200 p-3 sm:p-6 overflow-auto max-h-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
          <h1 className="text-xl sm:text-3xl font-bold text-green-900 uppercase font-mono">
            Leaderboard
          </h1>
          <Link href="/">
            <a className="bg-green-600 active:bg-green-700 hover:bg-green-700 text-white font-bold py-2 px-3 sm:px-4 rounded-lg uppercase font-mono text-xs sm:text-sm transition-colors border-2 border-green-700 touch-manipulation min-h-[44px] inline-flex items-center justify-center">
              Back to Game
            </a>
          </Link>
        </div>

        {loading && (
          <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-green-900 font-mono">
            Loading leaderboard...
          </div>
        )}

        {error && (
          <div className="text-center py-6 sm:py-8 text-xs sm:text-sm text-red-600 font-mono">
            {error}
            <button
              onClick={fetchLeaderboard}
              className="block mt-4 mx-auto bg-green-600 active:bg-green-700 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg uppercase font-mono text-xs sm:text-sm transition-colors touch-manipulation min-h-[44px]"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {entries.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-green-900 font-mono">
                No scores yet. Be the first to play!
              </div>
            ) : (
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <table className="w-full border-collapse text-xs sm:text-base">
                  <thead>
                    <tr className="bg-green-600 text-white">
                      <th className="border-2 border-green-700 px-2 sm:px-4 py-2 sm:py-3 text-left font-mono uppercase text-[10px] sm:text-sm">
                        Rank
                      </th>
                      <th className="border-2 border-green-700 px-2 sm:px-4 py-2 sm:py-3 text-left font-mono uppercase text-[10px] sm:text-sm">
                        Username
                      </th>
                      <th className="border-2 border-green-700 px-2 sm:px-4 py-2 sm:py-3 text-left font-mono uppercase text-[10px] sm:text-sm">
                        High Score
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? 'bg-zinc-100' : 'bg-zinc-50'}
                      >
                        <td className="border-2 border-green-300 px-2 sm:px-4 py-2 sm:py-3 font-mono font-semibold text-green-900">
                          {entry.rank || index + 1}
                        </td>
                        <td className="border-2 border-green-300 px-2 sm:px-4 py-2 sm:py-3 font-mono text-green-900 truncate max-w-[120px] sm:max-w-none">
                          {entry.username}
                        </td>
                        <td className="border-2 border-green-300 px-2 sm:px-4 py-2 sm:py-3 font-mono font-bold text-green-900">
                          {entry.highestScore}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;

