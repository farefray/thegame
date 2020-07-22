/**
 * Class handling the socket emitted events from backend.
 * Made in order to have store actions in some abstract class which can be also used for testing purpouses without the real socket connection and actually take some business logic from our dispatched store
 */
export default class SocketHandler {
  private storeActions;

  constructor(storeActions) {
    console.log('SocketHandler constructed');
    this.storeActions = storeActions;
  }

  handle(type, ...args) {
    console.log("SocketHandler -> handle -> type, ...args", type, ...args)
    return this[type.toUpperCase()](...args);
  }

  GAME_IS_LIVE(playerUUID) {
    this.storeActions.app.setGameLive(true);
    this.storeActions.players.setCurrentPlayerUUID(playerUUID);
  }

  PLAYER_UPDATE(playerModelUpdate) {
    // since player updates have few different subtypes, we process them separately here
    const { subtype } = playerModelUpdate;

    switch (subtype) {
      case 'PLAYER_CARDS_UPDATED': {
        this.storeActions.players.cardsDealed(playerModelUpdate);
        break;
      }

      case 'PLAYER_SYNC':
      default: {
        this.storeActions.players.updatePlayer(playerModelUpdate);
      }
    }
  }

  MERCHANTRY_UPDATE(merchantry) {
    this.storeActions.merchantry.revealCards(merchantry);
  }

  TIMER_UPDATE(countdown) {
    this.storeActions.app.setCountdown(0); // to re-init component todo better way
    this.storeActions.app.setCountdown(countdown);
  }

  CARD_PLAY(cardAction) {
    console.log("SocketHandler -> CARD_PLAY -> cardAction", cardAction)
    this.storeActions.players.playCard(cardAction);
  }

  NOTIFICATION(notification) {
    this.storeActions.app.setNotification(notification);
  }

  START_BATTLE({ actionStack, startBoard }) {
    this.storeActions.gameboard.startBattle({
      actionStack,
      startBoard
    });
  }

  END_BATTLE() {
    this.storeActions.gameboard.endBattle();
    this.storeActions.players.setBoard([]);
  }
}
