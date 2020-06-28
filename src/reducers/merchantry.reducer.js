const defaults = {
  revealedCards: []
};

export default function merchantry(state = defaults, action) {
  switch (action.type) {
    case 'MERCHANTRY_UPDATE': {
      return {
        ...state,
        revealedCards: action.merchantry.revealedCards
      };
    }
    default:
      return state
  }
}