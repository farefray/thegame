/* global describe, it */
const assert = require('assert');
const should = require('should');
const rewire = require('rewire');

const ConnectedPlayers = rewire('../src/models/connectedPlayers.js');
const Customer = rewire('../src/objects/Customer.js');

describe('Core Modules', () => {
  describe('ConnectedPlayers Storage', () => {
    const connectedPlayers = new ConnectedPlayers();
    it('Can add customer session', () => {
      const socketID = 'socketID_1';
      connectedPlayers.set(socketID, new Customer(socketID));
      const savedCustomer = connectedPlayers.get(socketID);
      savedCustomer.socketID.should.equal(socketID);
    });

    it('Can add second customer session', () => {
      const socketID = 'socketID_2';
      connectedPlayers.set(socketID, new Customer(socketID));
      const savedCustomer = connectedPlayers.get(socketID);
      savedCustomer.socketID.should.equal(socketID);
    });

    it('Can update ready status', () => {
      const status = connectedPlayers.updateReadyStatus();
      status.allReady.should.equal(false);
      status.totalCustomers.should.equal(2);
    });
  });
});
