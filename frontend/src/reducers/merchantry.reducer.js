const defaults = {
  revealedCards: []
};

export default function merchantry(state = defaultCustomer, action) {
  switch (action.type) {
    case 'MERCHANTRY_UPDATE': {
      return {
        ...state,
        revealedCards: action.revealedCards
      };
    }
    default:
      return state
  }
}