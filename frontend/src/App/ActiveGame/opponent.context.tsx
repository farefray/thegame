import React, { createContext } from 'react';
import { useStoreState } from '@/store/hooks';
import { defaultAnyPlayerState } from '@/store/models/players';

const OpponentContext = createContext(defaultAnyPlayerState);

export { OpponentContext };

const OpponentContextProvider = ({ children }) => {
  const opponent = useStoreState((state) => state.players.opponent);
  return <OpponentContext.Provider value={opponent}>{children}</OpponentContext.Provider>;
};

export default OpponentContextProvider;

export const OpponentContextConsumer = ({ children }) => <OpponentContext.Consumer>{children}</OpponentContext.Consumer>;
