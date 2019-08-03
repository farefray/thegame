/* global describe, it */
const assert = require('assert');
const should = require('should');
const rewire = require('rewire');

const ConnectedPlayers = rewire('../src/models/ConnectedPlayers.js');
const SessionsStore = rewire('../src/models/SessionsStore.js');

const GameController = rewire('../src/game.js');

const Customer = rewire('../src/objects/Customer.js');
const Session = rewire('../src/objects/Session.js');

describe('Core Modules', () => {
  describe('ConnectedPlayers Storage and Game start', () => {
    const connectedPlayers = new ConnectedPlayers();
    const socketID_1 = 'socketID_1';
    const socketID_2 = 'socketID_2';

    it('Can add customer session', () => {
      connectedPlayers.set(socketID_1, new Customer(socketID_1));
      const savedCustomer = connectedPlayers.get(socketID_1);
      savedCustomer.socketID.should.equal(socketID_1);
    });

    it('Can add second customer session', () => {
      connectedPlayers.set(socketID_2, new Customer(socketID_2));
      const savedCustomer = connectedPlayers.get(socketID_2);
      savedCustomer.socketID.should.equal(socketID_2);
    });

    it('Can update ready status', () => {
      const status = connectedPlayers.getWaitingRoomStatus();
      status.allReady.should.equal(false);
      status.totalCustomers.should.equal(2);
    });

    it('Customer 2 can disconnect', () => {
      connectedPlayers.disconnect(socketID_2);
      const status = connectedPlayers.getWaitingRoomStatus();
      status.allReady.should.equal(false);
      status.totalCustomers.should.equal(1);
    });

    it('Customer 1 can toggle ready', () => {
      connectedPlayers.setIn(socketID_1, ['isReady', true]);
      const status = connectedPlayers.getWaitingRoomStatus();
      status.allReady.should.equal(true);
      status.totalCustomers.should.equal(1);
    });
  });

  describe('Sessions and SessionStore', () => {
    const sessionsStore = new SessionsStore();
    let session = null;
    it('Can create session', () => {
      session = new Session();
      session.should.have.property('ID');
    });

    it('Can store and retrieve session', () => {
      sessionsStore.store(session);
      const sessID = session.get('ID');
      const savedSession = sessionsStore.get(sessID);
      savedSession.ID.should.equal(sessID);
    });
  });

  describe('Game Controller', () => {
    it('Can initialize game', async () => {
      const gameState = await GameController.initialize(['socket1', 'socket2']);
      gameState.should.be.an.Object();
      gameState.should.have.property('pieces');
      gameState.should.have.property('players');
      gameState.players['socket1']['index'].should.be.equal('socket1');
    });
  });
});
