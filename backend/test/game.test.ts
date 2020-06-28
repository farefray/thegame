import { suite, test, only, skip } from '@testdeck/mocha';
import { expect } from 'chai';
import { Container } from 'typedi';

import CardsFactory from '../src/factories/CardsFactory';
import Card from '../src/structures/Card';
import MonstersFactory from '../src/factories/MonstersFactory';
import Merchantry from '../src/structures/Merchantry';
import State from '../src/structures/State';
import Customer from '../src/models/Customer';
import { FirebaseUser } from '../src/services/ConnectedPlayers';
import Player from '../src/structures/Player';
import { EVENTBUS_MESSAGE_TYPE } from '../src/typings/EventBus';


const useruid = 'test_userid';
const socketid = 'test_socketid';
const CUSTOMERS = [new Customer(socketid, { uid: useruid } as FirebaseUser)];

// state, player and merchantry after creation should be emitted
const events = [EVENTBUS_MESSAGE_TYPE.MERCHANTRY_UPDATE, EVENTBUS_MESSAGE_TYPE.STATE_UPDATE, EVENTBUS_MESSAGE_TYPE.PLAYER_UPDATE];

const mockedEventEmitter = {
  emitMessage: (type, recipient, message) => {
    expect(type).to.satisfy((eventName) => events.includes(eventName));
    expect(recipient).to.be.equal(useruid);
    expect(message).to.be.a('object');
  }
};

Container.set('event.bus', mockedEventEmitter);

@suite
class GameTestSuite {
  @test
  canBuildCardsFactory() {
    const cardsFactory = new CardsFactory();
    expect(cardsFactory).to.be.a('object');

    const randomCardName = cardsFactory.getRandomCardName();
    expect(randomCardName).to.be.a('string');
  }

  @test
  canConstructMonsterByFactory() {
    const cardsFactory = new CardsFactory();
    const randomCardName = cardsFactory.getRandomCardName();
    const monster = MonstersFactory.createUnit(randomCardName);
    expect(monster).to.be.a('object');
    expect(monster.lookType).to.be.a('number');
  }

  @test
  canCreateCard() {
    const cardsFactory = new CardsFactory();
    const randomCardName = cardsFactory.getRandomCardName();
    const card = cardsFactory.createCard(randomCardName);
    expect(card).to.be.an.instanceof(Card);
    expect(card).to.have.property('monster');
    expect(card).to.have.property('config');
  }

  @test
  canBuildMerchantry() {
    const merchantry = new Merchantry(new Map(CUSTOMERS.map(customer => [customer.ID, new Player(customer.ID)])).values());
    expect(merchantry).to.be.a('object');
    expect(merchantry).to.be.an.instanceof(Merchantry);
    expect(merchantry).to.have.property('deck');
    expect(merchantry.getDeck().size).to.be.equal(merchantry.DECK_SIZE - merchantry.REVEALED_CARDS_SIZE);
    expect(merchantry.getRevealedCards().size).to.be.equal(merchantry.REVEALED_CARDS_SIZE);
  }

  @test
  canCreateStateWithCards() {
    const state = new State(CUSTOMERS);
    expect(state).to.be.an.instanceof(State);
    expect(state.getPlayer(useruid)?.getUID()).to.be.equal(useruid);
  }

  @test
  canBuyCard() {
    const state = new State(CUSTOMERS);
    const player = state.getPlayer(useruid);
    expect(player).to.be.an.instanceof(Player);

    if (player) {
      player.gold = 100;
      state.purchaseCard(useruid, 0);
      expect(player.discard.size).to.be.above(0);
    }
  }
}
