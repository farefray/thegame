import { suite, test, only, skip } from '@testdeck/mocha';
import { expect } from 'chai';
import { Container } from 'typedi';

import CardsFactory from '../src/factories/Cards';
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
    expect(cardsFactory).to.have.property('instance');
  }
  // @test
  // canBuildMerchantry() {
  //   const merchantry = new Merchantry();
  //   expect(merchantry).to.be.a('object');
  //   expect(merchantry).to.have.property('deck');
  // }
}
