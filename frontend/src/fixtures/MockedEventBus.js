import { Container } from '../../../backend/node_modules/typedi';
import SocketHandler from '@/SocketHandler';

export const MOCKED_CUSTOMER_UID = 'MOCK_SOCKETID_1';

const mockedEventBus = (store) => {
  const mockedEventEmitter = {
    emitMessage: (type, recipient, payload) => {
      // filter only messagest to our mocked customer
      if (recipient !== MOCKED_CUSTOMER_UID) {
        return;
      }

      const storeActions = store.getActions();
      const socketHandler = new SocketHandler(storeActions);
      socketHandler.handle(type, payload);
    }
  };

  Container.set('event.bus', mockedEventEmitter);
}

export default mockedEventBus;
