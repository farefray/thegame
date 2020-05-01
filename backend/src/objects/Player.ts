import Position from '../../../frontend/src/shared/Position';
import { MonsterInterface } from '../abstract/Monster';
import BattleUnit from './BattleUnit';
import AppError from './AppError';

const HAND_UNITS_LIMIT = 8;

export default class Player {
  public index: string;
  public health: number = 100;
  public mana: number = 0;
  public level: number = 1;
  public exp: number = 0;
  public gold: number = 1;
  public shopUnits: Array<MonsterInterface>;
  public hand: Object;
  public board: Object; // this must be an array in order to work in socketcontroller TODO P0 Session.ts:66

  constructor (id: string) {
    this.index = id;
    this.shopUnits = [];
    this.hand = {};
    this.board = {};
  }

  get availableHandPosition () {
    const hand = this.hand;
    for (let i = 0; i < 8; i++) {
      const pos = `${String(i)},-1`;
      if (hand[pos] === undefined) {
        return pos;
      }
    }

    return null;
  }

  get(property: string) {
    return this[property];
  }

  addToHand (unitName: string) {
    const availableHandPosition = this.availableHandPosition;
    if (availableHandPosition !== null) {
      const hand = this.hand;
      const pos = new Position(availableHandPosition);
      hand[availableHandPosition] = new BattleUnit({
        name: unitName,
        x: pos.x,
        y: pos.y,
        teamId: 0,
      });

      this.hand = hand;
      return availableHandPosition;
    }

    return null;
  }

  isDead () {
    return this.health <= 0;
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

  getAffortableShopUnits() {
    return this.shopUnits.filter(unit => unit.cost <= this.gold);
  }

  purchasePawn(pieceIndex): Boolean|AppError {
    if (this.isDead()) {
      return new AppError('warning', "Sorry, you're already dead");
    }

    const unit = this.shopUnits[pieceIndex];
    if (!unit || !unit.name || Object.keys(this.hand).length >= HAND_UNITS_LIMIT) {
      return new AppError('warning', 'Your hand is full');
    }

    if (this.gold < unit.cost) {
      return new AppError('warning', 'Not enough money');
    }

    this.addToHand(unit.name);
    delete this.shopUnits[pieceIndex];
    this.gold -= unit.cost;
    return true;
  }
}
