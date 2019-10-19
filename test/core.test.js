/* global describe, it */
import Battle from '../src/objects/Battle';
import createBattleBoard from '../src/utils/createBattleBoard';
import GameController from '../src/controllers/GameController';
import BattleController from '../src/controllers/BattleController';
import BoardController from '../src/controllers/BoardController';
import ShopController from '../src/controllers/ShopController';

const should = require('should');
const rewire = require('rewire');

const ConnectedPlayers = rewire('../src/models/ConnectedPlayers.js');
const SessionsStore = rewire('../src/models/SessionsStore.js');

const Customer = rewire('../src/objects/Customer.js');
const Session = rewire('../src/objects/Session.js');

const { TEAM } = rewire('../app/src/shared/constants');

describe('Core Modules', () => {
  const connectedPlayers = new ConnectedPlayers();
  const MOCK_SOCKETID_1 = 'MOCK_SOCKETID_1';
  const MOCK_SOCKETID_2 = 'MOCK_SOCKETID_2';
  const MOCK_SOCKETID_3 = 'MOCK_SOCKETID_3';

  const sessionsStore = new SessionsStore();
  const MOCK_CLIENTS = [MOCK_SOCKETID_1, MOCK_SOCKETID_2, MOCK_SOCKETID_3];

  let gameState = null;
  const firstHandPosition = '0,-1';

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
    let session = null;

    it('Can initialize game', async () => {
      gameState = await GameController.initialize(MOCK_CLIENTS);
      gameState.should.be.an.Object();
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

  });

  describe('Game Mechanics', () => {
    it('can buy pawn', async () => {
      gameState = await GameController.purchasePawn(gameState, MOCK_SOCKETID_1, 0);
      gameState.should.be.an.Object();
      gameState.players[MOCK_SOCKETID_1].hand[firstHandPosition].should.be.an.Object();
      gameState.players[MOCK_SOCKETID_1].hand[firstHandPosition].should.have.property('lookType');
    });

    it('can refill shop', async () => {
      ShopController.mutateStateByShopRefreshing(gameState, MOCK_SOCKETID_1);
      gameState.should.be.an.Object();
      gameState.players[MOCK_SOCKETID_1].hand[firstHandPosition].should.be.an.Object();
      gameState.players[MOCK_SOCKETID_1].shopUnits[0].should.be.an.Object();
    });

    it('cannot buy pawn when no gold', async () => {
      gameState.players[MOCK_SOCKETID_1].gold.should.be.equal(0); // this all gonna go wrong when more expensive units will appear
      const state = await GameController.purchasePawn(gameState, MOCK_SOCKETID_1, 0);
      should(state).Null();
    });

    it('can sell pawn', async () => {
      await GameController.purchasePawn(gameState, MOCK_SOCKETID_2, 0);
      gameState.players[MOCK_SOCKETID_2].gold.should.be.equal(0);
      await BoardController.mutateStateByPawnSelling(gameState, MOCK_SOCKETID_2, firstHandPosition);
      gameState.players[MOCK_SOCKETID_2].gold.should.be.equal(1);
      should(gameState.players[MOCK_SOCKETID_2].hand[firstHandPosition]).Undefined();
    });

    it('player 1 can move pawn to board', async () => {
      const toPosition = '0,2';
      await BoardController.mutateStateByPawnPlacing(gameState, MOCK_SOCKETID_1, firstHandPosition, toPosition);
      should(gameState.players[MOCK_SOCKETID_1].hand[firstHandPosition]).undefined();
      gameState.players[MOCK_SOCKETID_1].board[toPosition].should.be.an.Object();
    });

    it('can setup whole round', async () => {
      const battleRoundResult = await BattleController.setup(gameState);
      battleRoundResult.should.be.ok();
      battleRoundResult.battles[MOCK_SOCKETID_1].winner.should.be.above(TEAM.NONE);
    });
  });

  describe('Battle', () => {
    let battle;
    it('whole battle can be executed', async () => {
      const npcBoard = [
        {
          name: 'dwarf',
          x: 0,
          y: 7
        }
      ];
      const playerBoard = [
        {
          name: 'minotaur',
          x: 0,
          y: 0
        }
      ];

      const combinedBoard = createBattleBoard(playerBoard, npcBoard);
      battle = new Battle(combinedBoard);
      battle.should.be.ok();
      battle.actionStack.should.be.an.Array();
      battle.actionStack.length.should.be.above(0);
    });

    it('can handle battle with no units', async () => {
      const playerBoard = [
        {
          name: 'minotaur',
          x: 0,
          y: 7
        }
      ];
      const npcBoard = [];

      const combinedBoard = createBattleBoard(playerBoard, npcBoard);
      battle = new Battle(combinedBoard);
      battle.should.be.ok();
      should.exist(battle.winner);
      battle.winner.should.equal(TEAM.A);
    });
  });
});
