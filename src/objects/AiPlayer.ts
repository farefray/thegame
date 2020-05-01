
import AIService from '../services/AIService';
import Player from './Player';

const Container = require('typedi').Container;

export default class AiPlayer extends Player {
  constructor(id: string) {
    super(id);

    Container.set('player.one', this);
  }

  beforeBattle(opponent: Player) {
    super.beforeBattle(opponent);

    Container.set('player.two', opponent);
    AIService(Container).roundPrepare();
  }
}
