import { Container } from 'typedi';
import Session from './Session';
import Customer from './Customer';
import EventBus from '../services/EventBus';
import { ABILITY_PHASE } from '../typings/Card';
import Battle from '../structures/Battle';
import State from '../structures/State';
import Player from '../structures/Player';
import { waitFor } from '../utils/async';
import { EVENT_TYPE } from '../typings/EventBus';
import { BattleBoard } from '../typings/Battle';
import { timeStamp } from 'console';

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
  }

  private notifyGameIsLive() {
    const eventBus:EventBus = Container.get('event.bus');
    this.players.forEach(player => {
      // informs that game is live and setting UID for player frontend,
      // so frontend app will know player uid / opponent
      eventBus.emitMessage(EVENT_TYPE.GAME_IS_LIVE, player.getUID(), player.getUID());
    });
  }

  async countdown(duration) {
    const eventBus:EventBus = Container.get('event.bus');
    this.players.forEach(player => {
      eventBus.emitMessage(EVENT_TYPE.TIMER_UPDATE, player.getUID(), Math.round(duration / 1000));
    });

    await waitFor(duration);
  }

  notifyBattleEnded() {
    const eventBus:EventBus = Container.get('event.bus');
    this.players.forEach(player => {
      eventBus.emitMessage(EVENT_TYPE.END_BATTLE, player.getUID(), {});
    });
  }

  async processBattle() {
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
      await battle.proceedBattle();

      await this.countdown(battle.battleTime);

      this.notifyBattleEnded();

      return [true, battle.winner];
    }

    return [false, ];
  }

  async runRoundsFlow() {
    await this.countdown(COUNTDOWN_BETWEEN_ROUNDS);

    while (this.state.getRound() < this.state.MAX_ROUND) {

      this.players[0].dealCards();
      this.players[1].dealCards();

      await this.countdown(COUNTDOWN_BETWEEN_ROUNDS);
      await this.state.playCards(ABILITY_PHASE.INSTANT);

      const [hadBattle, winner]: any = await this.processBattle(); // got any, to not mess with ts array type
      if (hadBattle) {
        this.state.playCards(ABILITY_PHASE.VICTORY, winner);

        this.state.tradeRound(this.state.getRound() === 1);

        await this.countdown(COUNTDOWN_BETWEEN_ROUNDS);

        this.state.tradeRound();

        await this.countdown(COUNTDOWN_BETWEEN_ROUNDS);
      }

      this.state.nextRound();
    }
  }
}
