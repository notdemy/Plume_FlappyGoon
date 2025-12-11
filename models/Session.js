/**
 * Session model for game sessions
 * Sessions expire after 10 minutes
 */

import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  username: {
    type: String,
    required: true,
  },
  seed: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // 10 minutes in seconds
  },
});

// Ensure indexes
SessionSchema.index({ token: 1 });
SessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

const Session = mongoose.models.Session || mongoose.model('Session', SessionSchema);

export default Session;

