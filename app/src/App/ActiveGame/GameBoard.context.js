import React, { createContext, useContext } from 'react';

const StateContext = createContext();

export const StateProvider = ({ initialState, children }) => {
  return <StateContext.Provider value={initialState}>{children}</StateContext.Provider>;
};

export const useStateValue = () => useContext(StateContext);
