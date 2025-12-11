/**
 * API Route: Get User's Highest Score
 * Returns the highest score for a given username
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/mongodb';
import Leaderboard from '../../../models/Leaderboard';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username } = req.query;

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Connect to MongoDB
    await connectDB();

    // Find leaderboard entry by username
    const leaderboardEntry = await Leaderboard.findOne({ username: username.trim() })
      .select('highestScore')
      .lean();

    if (!leaderboardEntry) {
      // User doesn't have a score yet
      return res.status(200).json({
        highestScore: 0,
      });
    }

    return res.status(200).json({
      highestScore: leaderboardEntry.highestScore || 0,
    });
  } catch (error: any) {
    console.error('Error fetching user score:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch user score',
      message: error.message 
    });
  }
}

