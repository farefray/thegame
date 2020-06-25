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
    const merchantry = new Merchantry();
    expect(merchantry).to.be.a('object');
    expect(merchantry).to.be.an.instanceof(Merchantry);
    expect(merchantry).to.have.property('deck');
    expect(merchantry.getDeck().length).to.be.equal(merchantry.DECK_SIZE - merchantry.REVEALED_CARDS_SIZE);
    expect(merchantry.getRevealedCards().length).to.be.equal(merchantry.REVEALED_CARDS_SIZE);
  }

  @test
  canCreateStateWithCards() {
    // state, as well as players after creation should be emitted
    const mockedEventEmitter = {
      emit: (...args) => {
        expect(args[0]).to.satisfy((eventName) => ['playerUpdate', 'stateUpdate'].includes(eventName));
      }
    };

    Container.set('event.emitter', mockedEventEmitter);

    const useruid = 'test_user';
    const socketid = 'socket_id';
    const state = new State([new Customer(socketid, { uid: useruid } as FirebaseUser)]);
    expect(state).to.be.an.instanceof(State);
    expect(state.getPlayer(useruid)?.getUID()).to.be.equal(useruid);
  }
}
