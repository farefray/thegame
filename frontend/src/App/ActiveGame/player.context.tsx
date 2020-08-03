import React, { createContext } from 'react';
import { useStoreState } from '@/store/hooks';
import { defaultAnyPlayerState } from '@/store/models/players';

const PlayerContext = createContext(defaultAnyPlayerState);

export { PlayerContext };

const PlayerContextProvider = ({ children }) => {
  const currentPlayer = useStoreState((state) => state.players.currentPlayer);
  return <PlayerContext.Provider value={currentPlayer}>{children}</PlayerContext.Provider>;
};

export default PlayerContextProvider;

export const PlayerContextConsumer = ({children}) => <PlayerContext.Consumer>{children}</PlayerContext.Consumer>;
