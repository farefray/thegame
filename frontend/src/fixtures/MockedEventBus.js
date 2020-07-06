import { Container } from '../../../backend/node_modules/typedi';

const mockedEventEmitter = {
  emitMessage: (type, recipient, message) => {

  }
};

Container.set('event.bus', mockedEventEmitter);