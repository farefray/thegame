import { EventEmitter } from 'events';
import { Container } from 'typedi';
import { v4 as uuidv4 } from 'uuid';
import Player from '../structures/Player';
import State from '../structures/State';
import { BattleResult } from '../structures/Battle';
import ConnectedPlayers, { FirebaseUser } from './ConnectedPlayers';
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

  public emit(event: string, ...args: any[]) {
    return super.emit(event, args)
  }
}

const eventEmitter: EventEmitter = new EventBus();
Container.set('event.emitter', eventEmitter);

eventEmitter.on('stateUpdate', (uid: FirebaseUser['uid'], state: State) => {
  const customer = connectedPlayers.getByID(uid);
  if (customer) {
    const io: SocketIO.Server = Container.get('socket.io');
    io.to(customer.getSocketID()).emit('UPDATED_STATE', state.toSocket());
  }

  // if we are sending whole state, thats game start or round update.
  // We need to deliver all the changes to our players
  state.syncPlayers();
});

eventEmitter.on('playerUpdate', (player: Player) => {
  const customer = connectedPlayers.getByID(player.getUID());
  if (customer) {
    const io: SocketIO.Server = Container.get('socket.io');
    io.to(customer.getSocketID()).emit('UPDATE_PLAYER', player.toSocket());
  }
});


eventEmitter.on('roundBattleStarted', (uid: FirebaseUser['uid'], playerBattleResult: BattleResult) => {
  const customer = connectedPlayers.getByID(uid);
  if (customer) {
    const io: SocketIO.Server = Container.get('socket.io');
    io.to(customer.getSocketID()).emit('START_BATTLE', playerBattleResult);
  }
});