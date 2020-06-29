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
import { ABILITY_PHASE } from '../src/typings/Card';


const useruid = 'test_userid';
const socketid = 'test_socketid';
const monsterCardExample = 'Dwarf';
const CUSTOMERS = [new Customer(socketid, { uid: useruid } as FirebaseUser), new Customer(socketid + '_2', { uid: useruid + '_2' } as FirebaseUser)];

// state, player and merchantry after creation should be emitted
const events = [EVENTBUS_MESSAGE_TYPE.MERCHANTRY_UPDATE, EVENTBUS_MESSAGE_TYPE.STATE_UPDATE, EVENTBUS_MESSAGE_TYPE.PLAYER_UPDATE];

const mockedEventEmitter = {
  emitMessage: (type, recipient, message) => {
    expect(type).to.satisfy((eventName) => events.includes(eventName));
    expect(recipient).to.be.a('string');
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
    const monster = MonstersFactory.createUnit(monsterCardExample);
    expect(monster).to.be.a('object');
    expect(monster.lookType).to.be.a('number');
  }

  @test
  canCreateCard() {
    const cardsFactory = new CardsFactory();
    const randomCardName = cardsFactory.getRandomCardName();
    const card = cardsFactory.createCard(randomCardName);
    expect(card).to.be.an.instanceof(Card);
    expect(card).to.have.property('cost');
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
  canCreateStateWithCardsAndPlayerWithDeck() {
    const state = new State(CUSTOMERS);
    expect(state).to.be.an.instanceof(State);
    const player = state.getPlayer(useruid);
    expect(player).to.be.an.instanceof(Player);

    if (player) {
      expect(player?.getUID()).to.be.equal(useruid);
      expect(player?.deck.size).to.be.above(0);
    }
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

    const merchantry = state.getMerchantry();
    expect(merchantry.getRevealedCards().size).to.be.equal(merchantry.REVEALED_CARDS_SIZE);
    expect(merchantry.getDeck().size).to.be.equal(merchantry.DECK_SIZE - merchantry.REVEALED_CARDS_SIZE - 1);
  }

  @test
  canDealCards() {
    const state = new State(CUSTOMERS);
    const player = state.getPlayer(useruid);
    expect(player).to.be.an.instanceof(Player);

    if (player) {
      player.dealCards();
      expect(player.hand.size).to.be.equal(5);
    }
  }
}


@suite
class CardsTestSuite {
  @test
  cardsArePlayedInstant() {
    const state = new State(CUSTOMERS);
    const player = state.getPlayer(useruid);
    expect(player).to.be.an.instanceof(Player);

    if (player) {
      player.dealCards();
      state.playCards(ABILITY_PHASE.INSTANT);

      // first round, all cards are instantly played and moved to discard
      expect(player.hand.size).to.be.equal(0);
      expect(player.discard.size).to.be.equal(5);
    }
  }

  @test
  everyCardFunctionalityTest() {
    const state = new State(CUSTOMERS);
    const cardsFactory = new CardsFactory();
    const allCards = cardsFactory.getAllCards()
    allCards.forEach(cardName => {
      const card = cardsFactory.createCard(cardName);
      card.applyAbilities(state.firstPlayer, state.secondPlayer, ABILITY_PHASE.INSTANT);
    })
  }
}