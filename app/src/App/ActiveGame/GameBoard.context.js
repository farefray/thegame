/**
 * React context in order to pass gameboard state down into children components without passing directly for every member
 */
import React, { createContext, useContext } from 'react';

const StateContext = createContext();

export const StateProvider = ({ initialState, children }) => {
  return <StateContext.Provider value={initialState}>{children}</StateContext.Provider>;
};

export const useStateValue = () => useContext(StateContext);
