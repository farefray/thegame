import { Container } from 'typedi';
import BoardMatrix from '../utils/BoardMatrix';
import Position from '../shared/Position';
import BattleUnit from './BattleUnit';
import AppError from './AppError'; // refers to a value, but is being used as a type TODO[P0]. Theres full project of this
import Monsters from '../utils/monsters';
import { EventEmitter } from 'events';
import BattleUnitList from './BattleUnit/BattleUnitList';

export const BOARD_UNITS_LIMIT = 8;

const HAND_UNITS_LIMIT = 8;
const SHOP_UNITS = 4;

// TODO move logic to service/controller and data to model
export default class Player {
  public index: string;
  public health: number = 100;
  public mana: number = 0;
  public level: number = 1;
  public exp: number = 0;
  public gold: number = 1;
  public shopUnits: BattleUnitList = new BattleUnitList();
  public hand: BoardMatrix = new BoardMatrix(8, 1);
  public board: BoardMatrix = new BoardMatrix(8, 8);
  private _invalidated = true;

  constructor(id: string) {
    this.index = id;

    this.fillShop();
  }

  get socketID() {
    return this.index;
  }

  isSynced() {
    return !this._invalidated;
  }

  private fillShop() {
    const newShop = new BattleUnitList();
    for (let i = 0; i <= SHOP_UNITS; i++) {
      const shopUnit = Monsters.getRandomUnit({
        cost: this.getLevel()
      });

      newShop.push(new BattleUnit({
        name: shopUnit.name || 'Monster',
        x: i, // todo get rid of this for shop units
        y: -1, // todo get rid of this for shop units
        teamId: 0, // todo get rid of this for shop units
      }));
    }

    this.shopUnits = newShop;
  }

  refreshShop() {
    this.fillShop();
    this.update(true);
  }

  get availableHandPosition () {
    for (let i = 0; i < 8; i++) {
      if (this.hand.getCell(i) === null) {
        return i;
      }
    }

    return -1;
  }

  getLevel() {
    return this.level;
  }

  private addToHand (unitName: string): number|AppError {
    const availableHandPosition = this.availableHandPosition;
    if (availableHandPosition !== -1) {
      this.hand.setCell(availableHandPosition, 0, new BattleUnit({
        name: unitName,
        x: availableHandPosition,
        y: -1,
        teamId: 0, // this has to be revised. Its not always 0!! TODO [P0]
      }));

      return availableHandPosition;
    }

    return new AppError('warning', 'No free place');
  }

  isDead () {
    return this.health <= 0;
  }

  allowedBoardSize() {
    return Math.min(this.level, BOARD_UNITS_LIMIT);
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

  sellPawn(fromBoardPosition) {
    const fromPosition = Position.fromString(fromBoardPosition);
    const piece:BattleUnit|null = fromPosition.isHand()
      ? this.hand.getCell(fromPosition.x)
      : this.board.getCell(fromPosition.x, fromPosition.y); // TODO this can be optimized if we use unique positions ENUM

    if (piece) {
      this.gold += piece.cost;

      if (fromPosition.isHand()) {
        this.hand.setCell(fromPosition.x);
      } else {
        this.board.setCell(fromPosition.x, fromPosition.y);
      }
    } else {
      throw new Error('Trying to sell not existance pawn')
    }

    this.update(true);
  }

  getUnitFromPos(pos: Position) {
    const matrix = pos.isHand() ? this.hand : this.board;
    // hand position has y === -1, however handMatrix has y === 0. We need to consider this.
    return matrix.getCell(pos.x, pos.isHand() ? 0 : pos.y);
  }

  setUnitToPos(pos, unit) {
    unit.rearrangeToPos(pos);

    const matrix = pos.isHand() ? this.hand : this.board;
    // hand position has y === -1, however handMatrix has y === 0. We need to consider this.
    matrix.setCell(pos.x, pos.isHand() ? 0 : pos.y, unit);
  }

  removeUnitFromPos(pos) {
    const matrix = pos.isHand() ? this.hand : this.board;
    matrix.setCell(pos.x, pos.isHand() ? 0 : pos.y, null);
  }

  moveUnitBetweenPositions(fromPosition: Position, toPosition: Position) {
    const unit = this.getUnitFromPos(fromPosition);

    if (!unit) {
      throw new Error('Trying to move not existance pawn'); // ? todo backendError? validation? logging?
    }

    const swapUnit = this.getUnitFromPos(toPosition);
    if (swapUnit) {
      this.setUnitToPos(unit.position, swapUnit);
    } else {
      this.removeUnitFromPos(fromPosition);
    }

    this.setUnitToPos(toPosition, unit);

    this.update(true);
  }

  /**
   * TODO handle AppError differently, to not pass into SocketService
   */
  purchasePawn(pieceIndex): void|AppError {
    if (this.isDead()) {
      return new AppError('warning', "Sorry, you're already dead");
    }

    const unit = this.shopUnits.get(pieceIndex);
    if (!unit || !unit.name || this.hand.units().size >= HAND_UNITS_LIMIT) {
      return new AppError('warning', 'Your hand is full');
    }

    if (this.gold < unit.cost) {
      return new AppError('warning', 'Not enough money');
    }

    this.shopUnits.delete(pieceIndex);
    this.gold -= unit.cost;

    const addToHandResult = this.addToHand(unit.name);
    if (addToHandResult instanceof AppError) {
      return addToHandResult;
    }

    this.update(true);
  }

  /**
   * Emitting event to update this player via socket
   * @param {Boolean} sync should be transffered to socket instantly
   */
  public update(sync = false) {
    if (sync) {
      const eventEmitter: EventEmitter = Container.get('event.emitter');
      eventEmitter.emit('playerUpdate', this);

      this._invalidated = false;
    } else {
      // this can be improved, in order to mark invalidated parts, so only they will be sent to frontend during sync update
      this._invalidated = true;
    }
  }

  toSocket() {
    return {
      index: this.index,
      level: this.level,
      health: this.health,
      gold: this.gold,
      hand: this.hand.toJSON(),
      board: this.board.toJSON(),
      shopUnits: this.shopUnits.toJSON()
    }
  }
}
