import { Container } from 'typedi';
import Session from './Session';
import Customer from './Customer';
import EventBus from '../services/EventBus';
import { ABILITY_PHASE } from '../typings/Card';
import Battle from '../structures/Battle';
import State from '../structures/State';
import Player from '../structures/Player';
import sleep from '../utils/sleep';
import { EVENT_TYPE } from '../typings/EventBus';
import { BattleBoard } from '../typings/Battle';

const COUNTDOWN_BETWEEN_ROUNDS = 15 * 1000;
export default class Game {
  private customers: Array<Customer>
  private session: Session;
  private state: State;
  private players: Player[];

  constructor(firstCustomer: Customer, secondCustomer?: Customer) {
    this.customers = [firstCustomer];
    if (secondCustomer) {
      this.customers.push(secondCustomer);
    }

    this.session = new Session(this.customers);
    this.state = this.session.getState();
    this.players = [this.state.firstPlayer, this.state.secondPlayer];

    this.notifyGameIsLive();
    this.roundsFlow();
  }

  hasNextRound() {
    return this.state.getRound() < this.state.MAX_ROUND;
  }

  private notifyGameIsLive() {
    const eventBus:EventBus = Container.get('event.bus');
    this.players.forEach(player => {
      eventBus.emitMessage(EVENT_TYPE.GAME_IS_LIVE, player.getUID(), true);
    });
  }

  async countdown(duration) {
    const eventBus:EventBus = Container.get('event.bus');
    this.players.forEach(player => {
      eventBus.emitMessage(EVENT_TYPE.TIMER_UPDATE, player.getUID(), Math.round(duration / 1000));
    });

    await sleep(duration);
  }

  async roundsFlow() {
    await this.countdown(COUNTDOWN_BETWEEN_ROUNDS);

    while (this.hasNextRound()) {

      this.players[0].dealCards();
      this.players[1].dealCards();

      this.state.playCards(ABILITY_PHASE.INSTANT);
      throw new Error('TEST');
      await this.countdown(COUNTDOWN_BETWEEN_ROUNDS);

      // check if battle state is required
      if (this.players[0].board.units().size > 0 || this.players[1].board.units().size > 0) { // :(
        const battleBoards: Array<BattleBoard> = [];
        battleBoards.push({
          owner: this.state.firstPlayer.getUID(),
          units: this.state.firstPlayer.board.units()
        });

        battleBoards.push({
          owner: this.state.secondPlayer.getUID(),
          units: this.state.secondPlayer.board.reverse().units()
        });

        const battle = new Battle(battleBoards);
        await battle.proceedBattle(); // actually is a sync function. TODO

        await this.countdown(battle.battleTime);

        this.state.playCards(ABILITY_PHASE.VICTORY, battle.winner);

        await this.countdown(COUNTDOWN_BETWEEN_ROUNDS);
      }
    }
  }
}
