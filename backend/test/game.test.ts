import { suite, test, only, skip } from '@testdeck/mocha';
import { expect } from 'chai';
import { Container } from 'typedi';

import CardsFactory from '../src/factories/CardsFactory';
import Card from '../src/structures/Card';
import MonstersFactory from '../src/factories/MonstersFactory';
// import Merchantry from '../src/structures/Merchantry';

const mockedEventEmitter = {
  emit: (...args) => {
    // console.info("mockedEventEmitter args", args)
  }
};

Container.set('event.emitter', mockedEventEmitter);

@suite
class Game {
  @test
  canBuildCardsFactory() {
    const cardsFactory = CardsFactory.getInstance();
    expect(cardsFactory).to.be.a('object');

    const randomCardName = cardsFactory.getRandomCardName();
    expect(randomCardName).to.be.a('string');
  }

  @test
  canConstructMonsterByFactory() {
    const cardsFactory = CardsFactory.getInstance();
    const randomCardName = cardsFactory.getRandomCardName();
    const monster = MonstersFactory.createUnit(randomCardName);
    expect(monster).to.be.a('object');
    expect(monster.lookType).to.be.a('number');
  }

  @test
  canCreateCard() {
    const cardsFactory = CardsFactory.getInstance();
    const randomCardName = cardsFactory.getRandomCardName();
    const card = cardsFactory.createCard(randomCardName);
    expect(card).to.be.an.instanceof(Card);
    expect(card).to.have.property('monster');
    expect(card).to.have.property('config');
  }
  // @test
  // canBuildMerchantry() {
  //   const merchantry = new Merchantry();
  //   expect(merchantry).to.be.a('object');
  //   expect(merchantry).to.have.property('deck');
  // }
}
