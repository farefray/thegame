/** Represents data structure which is supposed to be synced with frontend */
import { Container } from 'typedi';
import { EVENTBUS_MESSAGE_TYPE } from '../../typings/EventBus';
import { FirebaseUser } from '../../services/ConnectedPlayers';
import EventBus from '../../services/EventBus';

/**
 * Abstract class which represents some data structure which sometimes need to be synchronized with frontend, by delivering its short representation via socket.
 * TODO P2 make it possible to invalidate/send objects partially
 */
export abstract class EventBusUpdater {
  private _invalidated = false; // if structure is dirty and need to be synced with subscribers
  private subscribers: Array<FirebaseUser['uid']>; // list of players who are supposed to receive updates for this structure
  private messageType: EVENTBUS_MESSAGE_TYPE;

  constructor(messageType: EVENTBUS_MESSAGE_TYPE, subscribers: Array<FirebaseUser['uid']> = []) {
    this.messageType = messageType;
    this.subscribers = subscribers;
  }

  isSynced() {
    return !this._invalidated;
  }

  /**
   * Emitting event to update this player via socket
   * @param {Boolean} instant should be transfered to socket instantly
   */
  public invalidate(sendInstantly = false) {
    if (sendInstantly) {
      this.emitEventBusMessage();
      this._invalidated = false;
    } else {
      // this can be improved, in order to mark invalidated parts, so only they will be sent to frontend during sync update
      this._invalidated = true;
    }
  }

  private emitEventBusMessage() {
    const eventBus: EventBus = Container.get('event.bus');
    this.subscribers.forEach(recipient => {
      eventBus.emitMessage(this.messageType, recipient, this.toSocket());
    });
  }

  abstract toSocket();
}