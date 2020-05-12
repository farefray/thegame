import should from 'should';
import Battle from '../src/objects/Battle';
import State from '../src/objects/State';
import AppError from '../src/objects/AppError';
import Session from '../src/objects/Session';
import ConnectedPlayers from '../src/models/ConnectedPlayers';
import SessionsStore from '../src/models/SessionsStore';
import Customer from '../src/objects/Customer';
import Player from '../src/objects/Player';

describe('Core Modules', () => {
  const connectedPlayers = new ConnectedPlayers();
  const MOCK_SOCKETID_1 = 'MOCK_SOCKETID_1';
  const MOCK_SOCKETID_2 = 'MOCK_SOCKETID_2';
  const MOCK_SOCKETID_3 = 'MOCK_SOCKETID_3';

  const sessionsStore = new SessionsStore();
  const MOCK_CLIENTS = [MOCK_SOCKETID_1, MOCK_SOCKETID_2, MOCK_SOCKETID_3];

  let gameState:State;
  const firstHandPosition = 0;
  const secondHandPosition = 1;

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

  describe('Game Mechanics', () => {
    it('can buy pawn', (done) => {
      const player = gameState.getPlayer(MOCK_SOCKETID_1);
      player.purchasePawn(0);
      gameState.should.be.an.Object();
      gameState.players[MOCK_SOCKETID_1].hand.getCell(firstHandPosition).should.be.an.Object();
      gameState.players[MOCK_SOCKETID_1].hand.getCell(firstHandPosition).should.have.property('lookType');
      done();
    });

    it('can refill shop', (done) => {
      gameState.refreshShopForPlayers();
      gameState.should.be.an.Object();
      gameState.players[MOCK_SOCKETID_1].hand.getCell(firstHandPosition).should.be.an.Object();
      gameState.players[MOCK_SOCKETID_1].shopUnits[0].should.be.an.Object();
      done();
    });

    it('cannot buy pawn when no gold', (done) => {
      gameState.players[MOCK_SOCKETID_1].gold.should.be.equal(0); // this all gonna go wrong when more expensive units will appear
      const player = gameState.getPlayer(MOCK_SOCKETID_1);
      const result = player.purchasePawn(0);
      should(result).instanceOf(AppError);
      done();
    });

    it('can buy second pawn pawn', (done) => {
      gameState.players[MOCK_SOCKETID_1].gold = 1;
      const player = gameState.getPlayer(MOCK_SOCKETID_1);
      player.purchasePawn(1);
      gameState.should.be.an.Object();
      (gameState.players[MOCK_SOCKETID_1].hand.getCell(firstHandPosition)).should.be.an.Object();
      (gameState.players[MOCK_SOCKETID_1].hand.getCell(firstHandPosition)).should.have.property('lookType');
      (gameState.players[MOCK_SOCKETID_1].hand.getCell(secondHandPosition)).should.be.an.Object();
      (gameState.players[MOCK_SOCKETID_1].hand.getCell(secondHandPosition)).should.have.property('lookType');
      done();
    });

    it('move pawn to board', async (done) => {
      const player:Player = gameState.getPlayer(MOCK_SOCKETID_1); // TODO replace all with new Player();
      player.movePawn({ x: 0, y: -1}, { x: 0, y: 1});
      should(gameState.players[MOCK_SOCKETID_1].hand.getCell(firstHandPosition)).null();
      gameState.players[MOCK_SOCKETID_1].board.getCell(0, 1).should.be.an.Object();
      gameState.players[MOCK_SOCKETID_1].board.getCell(0, 1).should.have.property('lookType');
      done();
    });

    it('can sell pawn', () => {
      const player:Player = new Player('test_sell');
      const result = player.purchasePawn(0);
      should(result).not.instanceOf(AppError);
      player.gold.should.be.equal(0);
      player.sellPawn({ x: 0, y: -1});
      player.gold.should.be.equal(1);
      should(player.hand.getCell(firstHandPosition)).null();
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

      battle = new Battle({ units: playerBoard, owner: 'player_1' }, { units: npcBoard, owner: 'player_2' });
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