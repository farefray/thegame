import {describe} from 'mocha';
import should from 'should';
import Battle from '../src/objects/Battle';
import State from '../src/objects/State';
import AppError from '../src/objects/AppError';
import Session from '../src/objects/Session';
import ConnectedPlayers from '../src/models/ConnectedPlayers';
import SessionsStore from '../src/models/SessionsStore';
import Customer from '../src/objects/Customer';
import Player from '../src/objects/Player';
import BattleUnitList from '../src/objects/BattleUnit/BattleUnitList';
import BattleUnit from '../src/objects/BattleUnit';
import Position from '../src/shared/Position';

import { Container } from 'typedi';

const mockedEventEmitter = {
  emit: (...args) => {
    // console.info("mockedEventEmitter args", args)
  }
};

Container.set('event.emitter', mockedEventEmitter);

describe('Core Modules', () => {
  const connectedPlayers = new ConnectedPlayers();
  const MOCK_SOCKETID_1 = 'MOCK_SOCKETID_1';
  const MOCK_SOCKETID_2 = 'MOCK_SOCKETID_2';
  const MOCK_SOCKETID_3 = 'MOCK_SOCKETID_3';

  const sessionsStore = new SessionsStore();
  const MOCK_CLIENTS = [MOCK_SOCKETID_1, MOCK_SOCKETID_2, MOCK_SOCKETID_3];

  let gameState:State;
  const firstHandPosition = 0;

  describe('ConnectedPlayers Storage and Game start', () => {
    it('Can add customer', () => {
      connectedPlayers.set(MOCK_SOCKETID_1, new Customer(MOCK_SOCKETID_1));
      const savedCustomer = connectedPlayers.get(MOCK_SOCKETID_1);
      savedCustomer.socketID.should.equal(MOCK_SOCKETID_1);
    });

    it('Can add second customer', () => {
      connectedPlayers.set(MOCK_SOCKETID_2, new Customer(MOCK_SOCKETID_2));
      const savedCustomer = connectedPlayers.get(MOCK_SOCKETID_2);
      savedCustomer.socketID.should.equal(MOCK_SOCKETID_2);
    });

    it('Can add third customer', () => {
      connectedPlayers.set(MOCK_SOCKETID_3, new Customer(MOCK_SOCKETID_3));
      const savedCustomer = connectedPlayers.get(MOCK_SOCKETID_3);
      savedCustomer.socketID.should.equal(MOCK_SOCKETID_3);
    });

    it('Can retrieve customer 1 sessionID', () => {
      const sessionID = connectedPlayers.getSessionID(MOCK_SOCKETID_1);
      should(sessionID).null();
    });
  });

  describe('Sessions and game init', () => {
    let session:Session;

    it('Can initialize game', () => {
      gameState = new State(MOCK_CLIENTS);
      gameState.should.be.an.Object();
      gameState.should.have.property('clients');
      gameState.should.have.property('players');
      gameState.players[MOCK_SOCKETID_1].index.should.be.equal(MOCK_SOCKETID_1);
    });

    it('Can create session', () => {
      session = new Session(MOCK_CLIENTS);
      session.should.have.property('ID');
      session.clients.length.should.be.equal(MOCK_CLIENTS.length);
    });

    it('Can store and retrieve session', () => {
      const sessID = session.ID;
      sessionsStore.store(session);
      const savedSession = sessionsStore.get(sessID);
      savedSession.ID.should.equal(sessID);
    });
  });

  describe.only('Game Mechanics', () => {
    it('can buy pawn', () => {
      const player = new Player(MOCK_SOCKETID_1);
      player.purchasePawn(0);
      should.exist(player.hand.getCell(0))
    });

    it('can refill shop', () => {
      const player = new Player(MOCK_SOCKETID_1);
      player.purchasePawn(0);
      player.refreshShop();
      player.shopUnits.unitNames.length.should.be.equal(5);
    });

    it('cannot buy pawn when no gold', () => {
      const player = new Player(MOCK_SOCKETID_1);
      player.gold = 0;
      player.gold.should.be.equal(0);
      const result = player.purchasePawn(0);
      should(result).instanceOf(AppError);
    });

    it('can buy second pawn pawn', () => {
      const player = new Player(MOCK_SOCKETID_1);
      player.gold = 10;
      player.purchasePawn(0);
      player.purchasePawn(1);
      should.exist(player.hand.getCell(0));
      should.exist(player.hand.getCell(1));
    });

    it('move pawn to board', () => {
      const player: Player = new Player(MOCK_SOCKETID_1);
      player.purchasePawn(0);
      player.moveUnitBetweenPositions(new Position({ x: 0, y: -1}), new Position({ x: 0, y: 1}));
      should.exist(player.board.getCell(0, 1))
    });

    it('can sell pawn', () => {
      const player:Player = new Player('test_sell');
      const result = player.purchasePawn(0);
      should(result).not.instanceOf(AppError);
      player.gold.should.be.equal(0);
      player.sellPawn('0,-1');
      player.gold.should.be.equal(1);
      should(player.hand.getCell(firstHandPosition)).null();
    });

    it('can swap pawn', () => {
      const player: Player = new Player('test_swap', false);
      player.gold = 10;
      player.shopUnits.push(new BattleUnit({
        name: 'minotaur',
        x: 0,
        y: -1,
        teamId: 0
      }));

      player.shopUnits.push(new BattleUnit({
        name: 'dwarf',
        x: 1,
        y: -1,
        teamId: 0
      }));

      const result = player.purchasePawn(0);
      should(result).not.instanceOf(AppError);

      const secondResult = player.purchasePawn(1);
      should(secondResult).not.instanceOf(AppError);

      player.hand.getCell(0)?.name.should.be.equal('minotaur');
      player.hand.getCell(1)?.name.should.be.equal('dwarf');

      // Hand to hand move
      player.moveUnitBetweenPositions(new Position({ x: 0, y: -1 }), new Position({ x: 1, y: -1 }));

      player.hand.getCell(0)?.name.should.be.equal('dwarf');
      player.hand.getCell(1)?.name.should.be.equal('minotaur');

      // move to board
      player.moveUnitBetweenPositions(new Position({ x: 0, y: -1 }), new Position({ x: 1, y: 1 }));
      player.board.getCell(1, 1)?.name.should.be.equal('dwarf');

      // swap with hand
      player.moveUnitBetweenPositions(new Position({ x: 1, y: -1 }), new Position({ x: 1, y: 1 }));
      player.board.getCell(1, 1)?.name.should.be.equal('minotaur');
      player.hand.getCell(1)?.name.should.be.equal('dwarf');

      // move all to board
      player.moveUnitBetweenPositions(new Position({ x: 1, y: -1 }), new Position({ x: 2, y: 1 }));
      player.board.getCell(1, 1)?.name.should.be.equal('minotaur');
      player.board.getCell(2, 1)?.name.should.be.equal('dwarf');

      // swap on board
      player.moveUnitBetweenPositions(new Position({ x: 1, y: 1 }), new Position({ x: 2, y: 1 }));
      player.board.getCell(1, 1)?.name.should.be.equal('dwarf');
      player.board.getCell(2, 1)?.name.should.be.equal('minotaur');
    });

  });

  describe('Battle', () => {
    it('whole battle can be executed', async () => {
      const npcBoard = new BattleUnitList([
        new BattleUnit({
          name: 'dwarf_geomancer',
          x: 0,
          y: 7,
          teamId: 1
        })
      ]);
      const playerBoard = new BattleUnitList([
        new BattleUnit({
          name: 'dwarf_geomancer',
          x: 0,
          y: 0,
          teamId: 0
        })
      ]);

      const battle = new Battle([{ units: playerBoard, owner: 'player_1' }, { units: npcBoard, owner: 'player_2' }]);
      const battleResult = await battle.proceedBattle();
      battleResult.should.be.ok();
      battleResult.actionStack.should.be.an.Array();
      battleResult.actionStack.length.should.be.above(0);
    });

    it('can handle battle with no units', async () => {
      const playerBoard = new BattleUnitList([
        new BattleUnit({
          name: 'minotaur',
          x: 0,
          y: 7,
          teamId: 0
        })
      ]);
      const npcBoard = new BattleUnitList([]);

      const battle = new Battle([{ units: playerBoard, owner: 'TEAM_A' }, { units: npcBoard, owner: 'TEAM_B' }]);
      const battleResult = await battle.proceedBattle();
      battleResult.should.be.ok();
      should.exist(battleResult.winner);
      battleResult.winner.should.equal('TEAM_A');
    });
  });
});
