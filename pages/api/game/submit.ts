/**
 * API Route: Submit Score
 * Validates game session and score, runs anti-cheat checks
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/mongodb';
import Session from '../../../models/Session';
import Leaderboard from '../../../models/Leaderboard';

interface GameData {
  seed: string;
  jumps: number[];
  duration: number;
  pipesPassed: number;
}

/**
 * Basic anti-cheat validation
 */
function validateGameData(score: number, gameData: GameData): { valid: boolean; error?: string } {
  const { jumps, duration, pipesPassed } = gameData;

  // Check duration: should be at least score * 1500ms
  const minDuration = score * 1500;
  if (duration < minDuration) {
    return { valid: false, error: `Duration too short. Expected at least ${minDuration}ms, got ${duration}ms` };
  }

  // Check jump count bounds: between score * 0.8 and score * 10
  const minJumps = Math.floor(score * 0.8);
  const maxJumps = Math.floor(score * 10);
  if (jumps.length < minJumps) {
    return { valid: false, error: `Too few jumps. Expected at least ${minJumps}, got ${jumps.length}` };
  }
  if (jumps.length > maxJumps) {
    return { valid: false, error: `Too many jumps. Expected at most ${maxJumps}, got ${jumps.length}` };
  }

  // Check score limit
  if (score > 300) {
    return { valid: false, error: `Score exceeds maximum allowed (300)` };
  }

  // Check that jumps timestamps are strictly increasing
  for (let i = 1; i < jumps.length; i++) {
    if (jumps[i] <= jumps[i - 1]) {
      return { valid: false, error: 'Jump timestamps must be strictly increasing' };
    }
  }

  // Check that pipesPassed matches score
  if (pipesPassed !== score) {
    return { valid: false, error: `Pipes passed (${pipesPassed}) does not match score (${score})` };
  }

  // Simplified validation: check timing consistency
  // Average time between jumps should be reasonable (between 100ms and 5000ms)
  if (jumps.length > 1) {
    const timeDiffs: number[] = [];
    for (let i = 1; i < jumps.length; i++) {
      timeDiffs.push(jumps[i] - jumps[i - 1]);
    }
    const avgTimeDiff = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
    
    if (avgTimeDiff < 100) {
      return { valid: false, error: 'Jumps are too frequent (possible automation)' };
    }
    if (avgTimeDiff > 5000) {
      return { valid: false, error: 'Jumps are too infrequent (unusual pattern)' };
    }
  }

  return { valid: true };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionToken, username, playerId, score, gameData } = req.body;

    // Validate input
    if (!sessionToken || !username || !playerId || typeof score !== 'number' || !gameData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (score < 0 || !Number.isInteger(score)) {
      return res.status(400).json({ error: 'Invalid score' });
    }

    // Connect to MongoDB
    await connectDB();

    // Validate session token
    const session = await Session.findOne({ token: sessionToken });
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session token' });
    }

    // Verify username matches session
    if (session.username !== username.trim()) {
      return res.status(403).json({ error: 'Username does not match session' });
    }

    // Verify seed matches
    if (session.seed !== gameData.seed) {
      return res.status(403).json({ error: 'Game seed does not match session' });
    }

    // Run anti-cheat validation
    const validation = validateGameData(score, gameData);
    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Score validation failed',
        reason: validation.error 
      });
    }

    // Update or create leaderboard entry
    // Find by username so each username has one entry with their highest score
    const leaderboardEntry = await Leaderboard.findOne({ username: username.trim() });
    
    let newHighScore = false;
    if (leaderboardEntry) {
      // Update existing entry
      if (score > leaderboardEntry.highestScore) {
        leaderboardEntry.highestScore = score;
        newHighScore = true;
      }
      leaderboardEntry.lastScore = score;
      leaderboardEntry.updatedAt = new Date();
      // Update playerId in case same user plays from different device
      leaderboardEntry.playerId = playerId;
      await leaderboardEntry.save();
    } else {
      // Create new entry
      const newEntry = new Leaderboard({
        username: username.trim(),
        playerId,
        highestScore: score,
        lastScore: score,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await newEntry.save();
      newHighScore = true; // First score is always a high score
    }

    return res.status(200).json({
      success: true,
      newHighScore,
    });
  } catch (error: any) {
    console.error('Error submitting score:', error);
    return res.status(500).json({ 
      error: 'Failed to submit score',
      message: error.message 
    });
  }
}

