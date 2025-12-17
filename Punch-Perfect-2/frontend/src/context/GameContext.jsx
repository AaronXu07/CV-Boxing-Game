import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
  const [isMiniviewEnabled, setIsMiniviewEnabled] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [gameKey, setGameKey] = useState(0);

  const toggleMiniview = useCallback(() => setIsMiniviewEnabled(val => !val), []);

  const value = useMemo(() => ({
    isMiniviewEnabled, setIsMiniviewEnabled, toggleMiniview,
    isFullScreen, setIsFullScreen,
    gameKey, setGameKey
  }), [
    isMiniviewEnabled,
    isFullScreen,
  ]);

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGameContext must be used within GameProvider');
  return ctx;
};