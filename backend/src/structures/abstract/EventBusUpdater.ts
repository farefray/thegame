/** Represents data structure which is supposed to be synced with frontend */
import { Container } from 'typedi';
import { EVENT_TYPE, EVENT_SUBTYPE } from '../../typings/EventBus';
import EventBus from '../../services/EventBus';
import { FirebaseUserUID } from '../../utils/types';

/**
 * Abstract class which represents some data structure which sometimes need to be synchronized with frontend, by delivering its short representation via socket.
 */
export abstract class EventBusUpdater {
  /** if structure is dirty and need to be synced with subscribers */
  private _invalidated = false;
  /** list of players who are supposed to receive updates for this structure, same this can be used to determine customers invlolved into current instance */
  protected subscribers: Array<FirebaseUserUID>;
  /** message type which will be dispatched to frontend */
  private messageType: EVENT_TYPE;

  constructor(messageType: EVENT_TYPE, subscribers: Array<FirebaseUserUID> = []) {
    this.messageType = messageType;
    this.subscribers = subscribers;
  }

  isSynced() {
    return !this._invalidated;
  }

  /**
   * Emitting event to update this player via socket
   */
  public invalidate(eventSubtype?: EVENT_SUBTYPE) {
    this._invalidated = false;

    const eventBus: EventBus = Container.get('event.bus');
    this.subscribers.forEach(recipient => {
      eventBus.emitMessage(this.messageType, recipient, {
        subtype: eventSubtype,
        ...this.toSocket(eventSubtype)
      });
    });
  }

  abstract toSocket(eventSubtype?: EVENT_SUBTYPE);
}