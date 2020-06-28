import BoardMatrix from './Battle/BoardMatrix';
import Position from '../shared/Position';
import BattleUnit from './BattleUnit';
import AppError from '../typings/AppError'; // refers to a value, but is being used as a type TODO[P0]. Theres full project of this
import { FirebaseUser } from '../services/ConnectedPlayers';
import { EventBusUpdater } from './abstract/EventBusUpdater';
import { EVENTBUS_MESSAGE_TYPE } from '../typings/EventBus';
import Deck from './Card/Deck';
import Card from './Card';
import CardsFactory from '../factories/CardsFactory';

export const BOARD_UNITS_LIMIT = 8;
const BASE_DECK_CONFIG = ['Gold_Coin', 'Gold_Coin', 'Gold_Coin', 'Gold_Coin', 'Gold_Coin', 'Gold_Coin', 'Gold_Coin', 'Gold_Coin', 'Knife', 'Knife'];

export default class Player extends EventBusUpdater {
  public userUID: FirebaseUser['uid'];
  public health: number = 50;
  public exp: number = 0;
  public gold: number = 1;
  public board: BoardMatrix = new BoardMatrix(8, 8);

  public hand = new Deck();
  public deck = new Deck();
  public discard = new Deck();

  constructor(id: FirebaseUser['uid']) {
    super(EVENTBUS_MESSAGE_TYPE.PLAYER_UPDATE, [id]);

    // fill starting deck
    const cardsFactory = new CardsFactory();
    for (let index = 0; index < BASE_DECK_CONFIG.length; index++) {
      this.deck.push(cardsFactory.createCard(BASE_DECK_CONFIG[index]))
    }

    this.userUID = id;
    this.invalidate(true);
  }

  getUID() {
    return this.userUID;
  }

  public addToDiscard(cards: Card[]) {
    this.discard.push(cards);
  }

  isDead () {
    return this.health <= 0;
  }

  allowedBoardSize() {
    return BOARD_UNITS_LIMIT;
  }

  isBoardFull() {
    return this.board.units().size >= this.allowedBoardSize();
  }

  /**
 * Board for player with playerIndex have too many units
 * Try to withdraw the cheapest unit
 * if hand is full, sell cheapest unit
 * Do this until board.size == level
 */
  beforeBattle (opponent: Player) {
    // REWORK THIS P0
    /*
    const board = this.board;
    const takenPositions = Object.keys(board);
    if (takenPositions.length > this.level) {
      let unitCost = Infinity;
      let cheapestUnitPosition = '';

      for (let index = 0; index < takenPositions.length; index++) {
        const pos = takenPositions[index];
        const unit = board[pos];
        // Todo check if this will be covered for leveled up units
        if (unit.cost < unitCost) {
          cheapestUnitPosition = pos;
          unitCost = unit.cost;
        }
      }

      console.log('TODO P0 widthawing for this unit:', cheapestUnitPosition);

      // P0 TODO THIS PART
      // Withdraw if possible unit, otherwise sell
      // TODO: Inform Client about update
      // if (Object.keys(this.hand).length < HAND_LIMIT) {
      //   await BoardController.withdrawPiece(state, playerIndex, cheapestUnitPosition);
      // } else {
      //   await BoardController.sellPiece(state, playerIndex, cheapestUnitPosition);
      // }

      // const newBoard = this.board;
      // const level = state.getIn(['players', playerIndex, 'level']);
      // if (newBoard.size > level) {
      //   await _mutateStateByFixingUnitLimit(state, playerIndex);
      // }

    }
    */
  }


  toSocket() {
    return {
      uid: this.userUID,
      health: this.health,
      gold: this.gold,
      hand: this.hand.toSocket(),
      board: this.board.toSocket()
    }
  }
}
