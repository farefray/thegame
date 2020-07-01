import BoardMatrix from './Battle/BoardMatrix';
import Position from '../shared/Position';
import BattleUnit from './BattleUnit';
import AppError from '../typings/AppError'; // refers to a value, but is being used as a type TODO[P0]. Theres full project of this
import { EventBusUpdater } from './abstract/EventBusUpdater';
import { EVENTBUS_MESSAGE_TYPE } from '../typings/EventBus';
import Deck from './Card/Deck';
import Card from './Card';
import CardsFactory from '../factories/CardsFactory';
import MonstersFactory from '../factories/MonstersFactory';
import { FirebaseUserUID } from '../utils/types';

const BASE_DECK_CONFIG = ['Dwarf', 'Gold_Coin', 'Gold_Coin', 'Gold_Coin', 'Gold_Coin', 'Gold_Coin', 'Gold_Coin', 'Gold_Coin', 'Knife', 'Knife'];
const HAND_SIZE = 5;

export const BOARD_UNITS_LIMIT = 8;

export default class Player extends EventBusUpdater {
  public userUID: FirebaseUserUID;
  public health: number = 50;
  public exp: number = 0;
  public gold: number = 0;
  public board: BoardMatrix = new BoardMatrix(8, 8);

  public hand = new Deck();
  public deck = new Deck();
  public discard = new Deck();

  constructor(id: FirebaseUserUID) {
    super(EVENTBUS_MESSAGE_TYPE.PLAYER_UPDATE, [id]);

    // fill starting deck
    const cardsFactory = new CardsFactory();
    for (let index = 0; index < BASE_DECK_CONFIG.length; index++) {
      this.deck.push(cardsFactory.createCard(BASE_DECK_CONFIG[index]))
    }

    this.userUID = id;
    this.invalidate();
  }

  getUID() {
    return this.userUID;
  }

  public cardPurchase(card: Card) {
    this.gold -= card.cost;
    this.addToDiscard(card);
  }

  public addToBoard(card) {
    const unit = MonstersFactory.createBattleUnit(card.monster.name);
    const position = unit.getPreferablePosition(this.board.freeSpots())
    unit.rearrangeToPos(position);
    this.board.setCell(position.x, position.y, unit);

    this.invalidate();
  }

  public moveToDiscard(card) {
    this.discard.push(card);
    const handCardIndex = this.hand.findIndex(handCard => handCard.name === card.name);
    if (handCardIndex !== -1) {
      this.hand.eject(handCardIndex);
    }
  }

  public addToDiscard(card: Card) {
    this.discard.push(card);

    this.invalidate();
  }

  public dealCards() {
    while (this.hand.size < HAND_SIZE && (!this.deck.isEmpty() || this.discard.size > 0)) {
      if (!this.deck.isEmpty()) {
        this.hand.push(this.deck.eject(0));
      } else if (this.discard.size > 0) {
        this.deck.pushAll(this.discard.values()).shuffle();
        this.discard.clean();
      }
    }

    this.invalidate();
  }


  /////// OLD

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
      board: this.board.toSocket(),

      hand: this.hand.toSocket(),
      deck: this.deck.toSocket(),
      discard: this.discard.toSocket()
    }
  }
}
