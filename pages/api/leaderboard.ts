/**
 * API Route: Get Leaderboard
 * Returns top players sorted by highest score
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../lib/mongodb';
import Leaderboard from '../../models/Leaderboard';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Connect to MongoDB
    await connectDB();

    // Fetch leaderboard entries, sorted by highestScore descending
    const entries = await Leaderboard.find({})
      .sort({ highestScore: -1 })
      .limit(100) // Limit to top 100
      .select('username highestScore')
      .lean();

    // Add rank to each entry
    const entriesWithRank = entries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    return res.status(200).json(entriesWithRank);
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch leaderboard',
      message: error.message 
    });
  }
}

