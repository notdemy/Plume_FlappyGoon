/**
 * API Route: Start Game Session
 * Creates a new game session with token and seed
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 } from 'uuid';
import connectDB from '../../../lib/mongodb';
import Session from '../../../models/Session';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username } = req.body;

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Connect to MongoDB
    await connectDB();

    // Generate session token and seed
    const token = v4();
    const seed = v4(); // Use UUID as seed for randomness

    // Create session in database
    const session = new Session({
      token,
      username: username.trim(),
      seed,
      createdAt: new Date(),
    });

    await session.save();

    return res.status(200).json({
      token,
      seed,
    });
  } catch (error: any) {
    console.error('Error starting game session:', error);
    return res.status(500).json({ 
      error: 'Failed to start game session',
      message: error.message 
    });
  }
}

