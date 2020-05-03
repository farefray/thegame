import Position from '../../../frontend/src/shared/Position';
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
  public shopUnits: Array<BattleUnit>;
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
    const newShop: Array<BattleUnit> = [];
    for (let i = 0; i <= SHOP_UNITS; i++) {
      const shopUnit = monsterUtils.getRandomUnit({
        cost: this.get('level'),
      });

      newShop.push(new BattleUnit({
        name: shopUnit.name || 'Monster',
        x: i,
        y: -1,
        teamId: 0,
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
    if (availableHandPosition !== -1) {
      this.hand[availableHandPosition] = new BattleUnit({
        name: unitName,
        x: availableHandPosition,
        y: -1,
        teamId: 0, // this has to be revised. Its not always 0!! TODO [P0]
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

  sellPawn(fromBoardPosition) {
    const fromPosition = new Position(fromBoardPosition);
    const piece:BattleUnit = fromPosition.isMyHandPosition()
      ? this.hand[fromBoardPosition]
      : this.board[fromBoardPosition]; // TODO this can be optimized if we use unique positions ENUM

    this.gold += piece.cost;

    if (fromPosition.isMyHandPosition()) {
      delete this.hand[fromBoardPosition];
    } else {
      delete this.board[fromBoardPosition];
    }
  }

  movePawn(fromBoardPosition, toBoardPosition) {
    const fromPosition = new Position(fromBoardPosition);
    const toPosition = new Position(toBoardPosition);

    // todo validate positions

    let battleUnit:BattleUnit;
    // remove from old position
    if (fromPosition.isMyHandPosition()) {
      battleUnit = this.hand[fromPosition.x];
      delete this.hand[fromPosition.x];
    } else {
      battleUnit = this.board[fromBoardPosition];
      delete this.board[fromBoardPosition];
    }

    battleUnit.rearrange(toPosition);

    let unitToSwap:BattleUnit;
    // place on new position
    if (toPosition.isMyHandPosition()) {
      unitToSwap = this.hand[toPosition.x];
      this.hand[toPosition.x] = battleUnit;
    } else {
      unitToSwap = this.board[toBoardPosition];
      this.board[toBoardPosition] = battleUnit;
    }

    if (unitToSwap) {
      unitToSwap.rearrange(fromPosition);

      if (fromPosition.isMyHandPosition()) {
        this.hand[fromPosition.x] = unitToSwap;
      } else {
        this.board[fromBoardPosition] = unitToSwap;
      }
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
