/**
 * Leaderboard model for storing player scores
 */

import mongoose from 'mongoose';

const LeaderboardSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    index: true,
  },
  playerId: {
    type: String,
    required: true,
    index: true,
  },
  highestScore: {
    type: Number,
    required: true,
    default: 0,
  },
  lastScore: {
    type: Number,
    required: true,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update updatedAt on save
LeaderboardSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for efficient queries
LeaderboardSchema.index({ highestScore: -1 }); // Descending for leaderboard queries
LeaderboardSchema.index({ playerId: 1 });
LeaderboardSchema.index({ username: 1 });

const Leaderboard = mongoose.models.Leaderboard || mongoose.model('Leaderboard', LeaderboardSchema);

export default Leaderboard;

