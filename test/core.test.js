/* global describe, it */
import Battle from '../src/objects/Battle';
import State from '../src/objects/State';
import GameService from '../src/services/GameService';
import BoardController from '../src/services/BoardController';
import AppError from '../src/objects/AppError';
import Session from '../src/objects/Session';

const should = require('should');
const rewire = require('rewire');

const ConnectedPlayers = rewire('../src/models/ConnectedPlayers');
const SessionsStore = rewire('../src/models/SessionsStore');

const Customer = rewire('../src/objects/Customer');

const Container = require("typedi").Container;
const gameService = GameService(Container);

describe('Core Modules', () => {
  const connectedPlayers = new ConnectedPlayers();
  const MOCK_SOCKETID_1 = 'MOCK_SOCKETID_1';
  const MOCK_SOCKETID_2 = 'MOCK_SOCKETID_2';
  const MOCK_SOCKETID_3 = 'MOCK_SOCKETID_3';

  const sessionsStore = new SessionsStore();
  const MOCK_CLIENTS = [MOCK_SOCKETID_1, MOCK_SOCKETID_2, MOCK_SOCKETID_3];

  let gameState = null;
  const firstHandPosition = '0,-1';
  const secondHandPosition = '1,-1';

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

  describe('Game Mechanics', () => {
    it('can buy pawn', async () => {
      gameState.purchasePawn(MOCK_SOCKETID_1, 0);
      gameState.should.be.an.Object();
      gameState.players[MOCK_SOCKETID_1].hand[firstHandPosition].should.be.an.Object();
      gameState.players[MOCK_SOCKETID_1].hand[firstHandPosition].should.have.property('lookType');
    });

    it('can refill shop', async () => {
      gameState.refreshShopForPlayers();
      gameState.should.be.an.Object();
      gameState.players[MOCK_SOCKETID_1].hand[firstHandPosition].should.be.an.Object();
      gameState.players[MOCK_SOCKETID_1].shopUnits[0].should.be.an.Object();
    });

    it('cannot buy pawn when no gold', async () => {
      gameState.players[MOCK_SOCKETID_1].gold.should.be.equal(0); // this all gonna go wrong when more expensive units will appear
      const result = gameState.purchasePawn(MOCK_SOCKETID_1, 0);
      should(result).instanceOf(AppError);
    });

    it('can buy second pawn pawn', async () => {
      gameState.players[MOCK_SOCKETID_1].gold = 1;
      gameState.purchasePawn(MOCK_SOCKETID_1, 1);
      gameState.should.be.an.Object();
      gameState.players[MOCK_SOCKETID_1].hand[firstHandPosition].should.be.an.Object();
      gameState.players[MOCK_SOCKETID_1].hand[firstHandPosition].should.have.property('lookType');
      gameState.players[MOCK_SOCKETID_1].hand[secondHandPosition].should.be.an.Object();
      gameState.players[MOCK_SOCKETID_1].hand[secondHandPosition].should.have.property('lookType');
    });

    it('can sell pawn', async () => {
      gameState.purchasePawn(MOCK_SOCKETID_2, 0);
      gameState.players[MOCK_SOCKETID_2].gold.should.be.equal(0);
      await BoardController.mutateStateByPawnSelling(gameState, MOCK_SOCKETID_2, firstHandPosition);
      gameState.players[MOCK_SOCKETID_2].gold.should.be.equal(1);
      should(gameState.players[MOCK_SOCKETID_2].hand[firstHandPosition]).Undefined();
    });

    it('move pawn to board', async () => {
      const toPosition = '0,2';
      await BoardController.mutateStateByPawnPlacing(gameState, MOCK_SOCKETID_1, firstHandPosition, toPosition);
      should(gameState.players[MOCK_SOCKETID_1].hand[firstHandPosition]).undefined();
      gameState.players[MOCK_SOCKETID_1].board[toPosition].should.be.an.Object();
      gameState.players[MOCK_SOCKETID_1].hand[secondHandPosition].should.be.an.Object();
      gameState.players[MOCK_SOCKETID_1].hand[secondHandPosition].should.have.property('lookType');
    });

  });

  describe('Battle', () => {
    let battle;
    it('whole battle can be executed', async () => {
      const npcBoard = [
        {
          name: 'dwarf_geomancer',
          x: 0,
          y: 7
        }
      ];
      const playerBoard = [
        {
          name: 'dwarf_geomancer',
          x: 0,
          y: 0
        }
      ];

      battle = new Battle({ units: playerBoard }, { units: npcBoard });
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

      battle = new Battle({ units: playerBoard, owner: 'TEAM_A' }, { units: npcBoard, owner: 'TEAM_B' });
      battle.should.be.ok();
      should.exist(battle.winner);
      battle.winner.should.equal('TEAM_A');
    });
  });
});
