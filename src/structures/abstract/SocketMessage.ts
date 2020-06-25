/** Represents data structure which is supposed to be synced with frontend */
import { EventEmitter } from 'events';
import { Container } from 'typedi';

export abstract class SocketMessage {
  private _invalidated = false; // TODO P1 make it possible to invalidate/send objects partially
  private messageType: string;

  constructor(type: string) {
    this.messageType = type;
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
      const eventEmitter: EventEmitter = Container.get('event.emitter');
      eventEmitter.emit(this.messageType, this.toSocket());

      this._invalidated = false;
    } else {
      // this can be improved, in order to mark invalidated parts, so only they will be sent to frontend during sync update
      this._invalidated = true;
    }
  }

  abstract toSocket();
}