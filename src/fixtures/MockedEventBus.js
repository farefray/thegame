import { Container } from '../../../backend/node_modules/typedi';

export const MOCKED_CUSTOMER_UID = 'MOCK_SOCKETID_1';

const mockedEventBus = (store) => {
  const mockedEventEmitter = {
    emitMessage: (type, recipient, payload) => {
      if (recipient !== MOCKED_CUSTOMER_UID) {
        return;
      }

      const storeActions = store.getActions();
      switch (type) {
        case 'MERCHANTRY_UPDATE': {
          storeActions.merchantry.revealCards(payload)
          break;
        }

        case 'CARD_PLAY': {
          storeActions.player.playCard(payload);
          break;
        }

        case 'UPDATE_PLAYER': {
          if (payload.subtype === 'PLAYER_CARDS_DEALED') {
            storeActions.player.updatePlayer({ ...payload });
            break;
          } else if (payload.subtype === 'PLAYER_CARD_TO_BOARD') {
            storeActions.player.updatePlayer({ ...payload });
            break;
          }
        }

        default: {
          console.log("mockedEventBus -> payload", payload)
          console.log("mockedEventBus -> recipient", recipient)
          console.log("mockedEventBus -> type", type)
          console.warn('Unhandled mock action');
          break;
        }
      }
    }
  };

  Container.set('event.bus', mockedEventEmitter);
}

export default mockedEventBus;
