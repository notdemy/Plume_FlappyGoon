import { useState, useEffect } from 'react';
import useWindowSize from './useWindowSize';

// Fixed game dimensions - these are the "logical" game size
// All game physics and rendering use these dimensions
export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 800;

interface GameScale {
  scale: number;
  scaledWidth: number;
  scaledHeight: number;
}

export default function useGameScale(padding: number = 0): GameScale {
  const { width: viewportWidth, height: viewportHeight } = useWindowSize();
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (viewportWidth === 0 || viewportHeight === 0) {
      return;
    }

    // Calculate available space (viewport minus padding)
    const availableWidth = viewportWidth - padding * 2;
    const availableHeight = viewportHeight - padding * 2;

    // Calculate scale factors for both dimensions
    const scaleX = availableWidth / GAME_WIDTH;
    const scaleY = availableHeight / GAME_HEIGHT;

    // Use the smaller scale to ensure the game fits in both dimensions
    // Don't cap at 1x - allow scaling up on mobile if needed, but prefer downscaling on desktop
    let newScale = Math.min(scaleX, scaleY);
    
    // Ensure minimum scale for visibility (0.1 = 10% of original size)
    // This prevents the game from becoming completely invisible
    newScale = Math.max(newScale, 0.1);

    setScale(newScale);
  }, [viewportWidth, viewportHeight, padding]);

  return {
    scale,
    scaledWidth: GAME_WIDTH * scale,
    scaledHeight: GAME_HEIGHT * scale,
  };
}

