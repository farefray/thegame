/* global describe, it */
const assert = require('assert');
const should = require('should');
const rewire = require('rewire');

const ConnectedPlayers = rewire('../src/models/connectedPlayers.js');
const Customer = rewire('../src/objects/Customer.js');

describe('Core Modules', () => {
  describe('ConnectedPlayers Storage', () => {
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
});
