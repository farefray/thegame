import { Container } from 'typedi';
import { v4 as uuidv4 } from 'uuid';
import ConnectedPlayers from './ConnectedPlayers';
import { EVENTBUS_MESSAGE_TYPE } from '../typings/EventBus';
import { FirebaseUserUID } from '../utils/types';

const connectedPlayers = ConnectedPlayers.getInstance();

/** TODO P0 how will this work with multiple customers
 * Shall we point this emitted to socket? Should it be singletone?
 */
export default class EventBus {
  private uid = uuidv4();
  constructor() {
    console.log('Eventbus with uid ' + this.uid + ' is constructed');
  }

  // emitting message from somewhere, to be sent to frontend recipients
  public emitMessage(event: EVENTBUS_MESSAGE_TYPE, recipient: FirebaseUserUID, message) {
    return this.on(event, {
      recipient,
      message
    });
  }

  // sending message to frontend recipients
  private on(event: EVENTBUS_MESSAGE_TYPE, params) {
    const { recipient, message } = params;
    const customer = connectedPlayers.getByID(recipient);
    if (customer) {
      const io: SocketIO.Server = Container.get('socket.io');
      io.to(customer.getSocketID()).emit(event, message);
    }
  }
}

// TODO
// const io: SocketIO.Server = Container.get('socket.io');
// io.to(`${this.id}`).emit('NOTIFICATION', result);
