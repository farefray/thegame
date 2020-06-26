import { EventEmitter } from 'events';
import { Container } from 'typedi';
import { v4 as uuidv4 } from 'uuid';
import { BattleResult } from '../structures/Battle';
import ConnectedPlayers, { FirebaseUser } from './ConnectedPlayers';
import { EVENTBUS_MESSAGE_TYPE } from '../typings/EventBus';
const connectedPlayers = ConnectedPlayers.getInstance();

/** TODO P0 how will this work with multiple customers
 * Shall we point this emitted to socket? Should it be singletone?
 */
export default class EventBus extends EventEmitter {
  private uid = uuidv4();
  constructor() {
    super();
    console.log('Eventbus with uid ' + this.uid + ' is constructed');
  }

  public emitMessage(event: EVENTBUS_MESSAGE_TYPE, recipient: FirebaseUser['uid'], message) {
    return super.emit(event, {
      recipient,
      message
    });
  }

  /** block calls to native emit method */
  emit(event, args) {
    throw new Error('Strict calls to EventBus.emit are fobidden!');
    return false;
  }

  static registerEvents(eventBus: EventBus) {
    // todo simplify all those events to one. Maybe we dont need event emitter at all
    eventBus.on(EVENTBUS_MESSAGE_TYPE.STATE_UPDATE, ({ recipient, message }) => {
      const customer = connectedPlayers.getByID(recipient);
      if (customer) {
        const io: SocketIO.Server = Container.get('socket.io');
        io.to(customer.getSocketID()).emit('UPDATED_STATE', message);
      }
    });

    eventBus.on(EVENTBUS_MESSAGE_TYPE.PLAYER_UPDATE, ({ recipient, message }) => {
      const customer = connectedPlayers.getByID(recipient);
      if (customer) {
        const io: SocketIO.Server = Container.get('socket.io');
        io.to(customer.getSocketID()).emit('UPDATE_PLAYER', message);
      }
    });

    eventBus.on(EVENTBUS_MESSAGE_TYPE.MERCHANTRY_UPDATE, ({ recipient, message }) => {
      const customer = connectedPlayers.getByID(recipient);
      if (customer) {
        const io: SocketIO.Server = Container.get('socket.io');
        io.to(customer.getSocketID()).emit('MERCHANTRY_UPDATE', message);
      }
    });

    eventBus.on(EVENTBUS_MESSAGE_TYPE.BATTLE, ({ recipient, message }) => {
      const customer = connectedPlayers.getByID(recipient);
      if (customer) {
        const io: SocketIO.Server = Container.get('socket.io');
        io.to(customer.getSocketID()).emit('START_BATTLE', message);
      }
    });
  }
}
