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
  public shopUnits: BattleUnitList;
  public hand: BoardMatrix;
  public board: BoardMatrix;

  constructor (id: string) {
    this.index = id;
    this.shopUnits = new BattleUnitList();
    this.hand = new BoardMatrix(8, 1);
    this.board = new BoardMatrix(8, 8);

    this.refreshShop();
  }

  refreshShop() {
    const newShop = new BattleUnitList();
    for (let i = 0; i <= SHOP_UNITS; i++) {
      const shopUnit = Monsters.getRandomUnit({
        cost: this.getLevel()
      });

      newShop.push(new BattleUnit({
        name: shopUnit.name || 'Monster',
        x: i,
        y: -1,
        teamId: 0,
      }));
    }

    this.shopUnits = newShop;
    this.sendUpdate();
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
    const fromPosition = new Position(fromBoardPosition);
    const piece:BattleUnit|null = fromPosition.isMyHandPosition()
      ? this.hand.getCell(fromPosition.x)
      : this.board.getCell(fromPosition.x, fromPosition.y); // TODO this can be optimized if we use unique positions ENUM

    if (piece) {
      this.gold += piece.cost;

      if (fromPosition.isMyHandPosition()) {
        this.hand.setCell(fromPosition.x);
      } else {
        this.board.setCell(fromPosition.x, fromPosition.y);
      }
    } else {
      throw new Error('Trying to sell not existance pawn')
    }

    this.sendUpdate();
  }

  movePawn(fromBoardPosition, toBoardPosition) {
    const fromPosition = new Position(fromBoardPosition);
    const toPosition = new Position(toBoardPosition);

    // todo validate positions and actually move to boardMatrix maybe?

    let battleUnit:BattleUnit|null = null;
    // retrieve units from positions
    if (fromPosition.isMyHandPosition()) {
      battleUnit = this.hand.getCell(fromPosition.x);
    } else {
      battleUnit = this.board.getCell(fromPosition.x, fromPosition.y);
    }

    if (battleUnit) {
      battleUnit.rearrange(toPosition);
    } else {
      throw new Error('Trying to move not existance pawn');
    }

    let unitToSwap:BattleUnit|null = null; // todo test this
    // place on new position
    if (toPosition.isMyHandPosition()) {
      unitToSwap = this.hand.getCell(toBoardPosition.x);
      this.hand.setCell(toPosition.x, 0, battleUnit);
    } else {
      unitToSwap = this.board.getCell(toBoardPosition.x, toBoardPosition.y);
      this.board.setCell(toPosition.x, toPosition.y, battleUnit);
    }

    if (unitToSwap) {
      unitToSwap.rearrange(fromPosition);

      if (fromPosition.isMyHandPosition()) {
        this.board.setCell(fromPosition.x, 0, unitToSwap);
      } else {
        this.board.setCell(fromPosition.x, fromPosition.y, unitToSwap);
      }
    }

    // clean from old position
    if (fromPosition.isMyHandPosition()) {
      this.hand.setCell(fromPosition.x);
    } else {
      this.board.setCell(fromPosition.x, fromPosition.y, null);
    }

    this.sendUpdate();
  }

  /**
   * TODO handle AppError differently, to not pass into SocketController
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

    this.sendUpdate();
  }

  /**
   * Emitting event to update this player via socket
   */
  private sendUpdate() {
    const eventEmitter: EventEmitter = Container.get('event.emitter');
    eventEmitter.emit('playerUpdate', this.index, this.toSocket());
  }

  toSocket() {
    return {
      index: this.index,
      level: this.level,
      health: this.health,
      hand: this.hand.toJSON(),
      board: this.board.toJSON(),
      shopUnits: this.shopUnits.toJSON()
    }
  }
}
