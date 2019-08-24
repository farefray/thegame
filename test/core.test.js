/* global describe, it */
const should = require('should');
const rewire = require('rewire');

const ConnectedPlayers = rewire('../src/models/ConnectedPlayers.js');
const SessionsStore = rewire('../src/models/SessionsStore.js');

const GameController = rewire('../src/game.js');
const BattleJS = rewire('../src/game/battle.js');
const BoardJS = rewire('../src/game/board.js');

const Customer = rewire('../src/objects/Customer.js');
const Session = rewire('../src/objects/Session.js');
const Battle = rewire('../src/objects/Battle.js');

const gameConstantsJS = rewire('../src/game_constants.js');
const {
  TEAM
} = rewire('../app/src/shared/constants');

describe('Core Modules', () => {
  const connectedPlayers = new ConnectedPlayers();
  const MOCK_SOCKETID_1 = 'MOCK_SOCKETID_1';
  const MOCK_SOCKETID_2 = 'MOCK_SOCKETID_2';
  const MOCK_SOCKETID_3 = 'MOCK_SOCKETID_3';

  const sessionsStore = new SessionsStore();
  const MOCK_CLIENTS = [MOCK_SOCKETID_1, MOCK_SOCKETID_2, MOCK_SOCKETID_3];

  let gameState = null;

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

    it('Can update ready status', () => {
      const status = connectedPlayers.getWaitingRoomStatus();
      status.allReady.should.equal(false);
      status.totalCustomers.should.equal(MOCK_CLIENTS.length);
    });

    it('Customer 1 can toggle ready', () => {
      connectedPlayers.setIn(MOCK_SOCKETID_1, ['isReady', true]);
      const status = connectedPlayers.getWaitingRoomStatus();
      status.allReady.should.equal(false);
      status.totalCustomers.should.equal(MOCK_CLIENTS.length);
    });

    it('Can retrieve customer 1 sessionID', () => {
      const sessionID = connectedPlayers.getSessionID(MOCK_SOCKETID_1);
      should(sessionID).null();
    });
  });

  describe('Sessions and game init', () => {
    let session = null;

    it('Can initialize game', async () => {
      gameState = await GameController.initialize(MOCK_CLIENTS);
      gameState.should.be.an.Object();
      gameState.should.have.property('pieces');
      gameState.should.have.property('players');
      gameState.players[MOCK_SOCKETID_1].index.should.be.equal(MOCK_SOCKETID_1);
    });

    it('Can create session', () => {
      session = new Session(MOCK_CLIENTS, gameState);
      session.should.have.property('ID');
      session.clients.length.should.be.equal(MOCK_CLIENTS.length);
    });

    it('Can store and retrieve session', () => {
      const sessID = session.get('ID');
      sessionsStore.store(session);
      const savedSession = sessionsStore.get(sessID);
      savedSession.ID.should.equal(sessID);
    });

    it('Customer 2 can disconnect', () => {
      connectedPlayers.disconnect(MOCK_SOCKETID_3);
      session.disconnect(MOCK_SOCKETID_3);
      const status = connectedPlayers.getWaitingRoomStatus();
      status.allReady.should.equal(false);
      status.totalCustomers.should.equal(MOCK_CLIENTS.length - 1);
      session.clients.length.should.be.equal(MOCK_CLIENTS.length - 1);
    });
  });

  describe('Game Mechanics', () => {
    it('can buy pawn', async () => {
      gameState = await GameController.purchasePawn(gameState, MOCK_SOCKETID_1, 0);
      gameState.should.be.an.Object();
      gameState.players[MOCK_SOCKETID_1].hand[0].should.be.an.Object();
      gameState.players[MOCK_SOCKETID_1].hand[0].should.have.property('looktype');
    });

    it('cannot buy pawn when no gold', async () => {
      gameState.players[MOCK_SOCKETID_1].gold.should.be.equal(0);
      const state = await GameController.purchasePawn(gameState, MOCK_SOCKETID_1, 0);
      should(state).Null();
    });

    it('player 1 can move pawn to board', async () => {
      const fromPosition = '0';
      const toPosition = '1,1';
      const result = await GameController.mutateStateByPawnPlacing(gameState, MOCK_SOCKETID_1, fromPosition, toPosition);
      result.upgradeOccured.should.be.false();
      should(gameState.players[MOCK_SOCKETID_1].hand[fromPosition]).undefined();
      gameState.players[MOCK_SOCKETID_1].board[toPosition].should.be.an.Object();
    });

    // todo test for mutateStateByFixingUnitLimit
  });

  describe('Battle', () => {
    let battle;
    it('can find target and measure distance', async () => {
      const npcBoard = await BoardJS.createBoard([{
        name: 'minotaur',
        x: 1,
        y: 8
      }]);
      const playerBoard = await BoardJS.createBoard([{
        name: 'minotaur',
        x: 3,
        y: 4
      }]);

      const combinedBoard = await BoardJS.createBattleBoard(playerBoard, npcBoard);
      battle = new Battle(combinedBoard);

      const units = battle.getNextUnitsToAction();
      units.should.be.ok();
      const result = await battle.getClosestTarget(units[0]);
      result.should.be.ok();
    });

    it('whole battle can be executed', async () => {
      const battleResult = await battle.execute();
      battleResult.should.be.ok();
      battleResult.isOver.should.be.true();
      battleResult.actionStack.should.be.an.Array();
      battleResult.actionStack.length.should.be.above(0);

      let battleTime = 0;
      if (battleResult.actionStack[battleResult.actionStack.length - 1].time > battleTime) {
        battleTime = battleResult.actionStack[battleResult.actionStack.length - 1].time;
      }
      battleTime.should.be.above(0);
    });

    it('can handle battle with no units', async () => {
      const playerBoard = await BoardJS.createBoard([]);
      const npcBoard = await BoardJS.createBoard([{
        name: 'minotaur',
        x: 1,
        y: 8
      }]);

      const combinedBoard = await BoardJS.createBattleBoard(playerBoard, npcBoard);
      battle = new Battle(combinedBoard);

      const battleResult = await battle.execute();
      battleResult.should.be.ok();
      battleResult.winner.should.equal(TEAM.B);
    });
  });
});