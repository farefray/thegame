import Position from '../../../frontend/src/shared/Position';
import { MonsterInterface } from '../abstract/Monster';
import BattleUnit from './BattleUnit';
import AppError from './AppError';
import monsterUtils from '../utils/monsterUtils';

const HAND_UNITS_LIMIT = 8;
const SHOP_UNITS = 4;

export default class Player {
  public index: string;
  public health: number = 100;
  public mana: number = 0;
  public level: number = 1;
  public exp: number = 0;
  public gold: number = 1;
  public shopUnits: Array<MonsterInterface>;
  public hand: Array<BattleUnit>;
  public board: Object; // this must be an array in order to work in socketcontroller TODO P0 Session.ts:66

  constructor (id: string) {
    this.index = id;
    this.shopUnits = [];
    this.hand = [];
    this.board = {};

    this.refreshShop();
  }

  refreshShop() {
    const newShop: Array<MonsterInterface> = [];
    for (let i = 0; i <= SHOP_UNITS; i++) {
      newShop.push(monsterUtils.getRandomUnit({
        cost: this.get('level'),
      }));
    }

    this.shopUnits = newShop;
  }

  get availableHandPosition () {
    for (let i = 0; i < 8; i++) {
      if (this.hand[i] === undefined) {
        return i;
      }
    }

    return -1;
  }

  get(property: string) {
    return this[property];
  }

  addToHand (unitName: string): number|AppError {
    const availableHandPosition = this.availableHandPosition;
    if (availableHandPosition !== null) {
      this.hand[availableHandPosition] = new BattleUnit({
        name: unitName,
        x: availableHandPosition,
        y: -1,
        teamId: 0,
      });

      return availableHandPosition;
    }

    return new AppError('warning', 'No free place');
  }

  isDead () {
    return this.health <= 0;
  }

  isBoardFull() {
    return Object.keys(this.board).length === this.level;
  }

  /**
 * Board for player with playerIndex have too many units
 * Try to withdraw the cheapest unit
 * if hand is full, sell cheapest unit
 * Do this until board.size == level
 */
  beforeBattle (opponent: Player) {
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
  }

  purchasePawn(pieceIndex): number|AppError {
    if (this.isDead()) {
      return new AppError('warning', "Sorry, you're already dead");
    }

    const unit = this.shopUnits[pieceIndex];
    if (!unit || !unit.name || this.hand.length >= HAND_UNITS_LIMIT) {
      return new AppError('warning', 'Your hand is full');
    }

    if (this.gold < unit.cost) {
      return new AppError('warning', 'Not enough money');
    }

    delete this.shopUnits[pieceIndex];
    this.gold -= unit.cost;
    return this.addToHand(unit.name);
  }
}
