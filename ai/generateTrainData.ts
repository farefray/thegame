import Player from '../src/objects/Player';
import { Loader } from './loader';
import Session from '../src/objects/Session';
import AiPlayer from '../src/objects/AiPlayer';
import BattleUnit from '../src/objects/BattleUnit';
import { percentage } from '../src/utils/math';

interface SimulationResult {
  gandicap: number;
  firstUnits: string[];
  secondUnits: string[];
  round: number;
}

const SIMULATIONS_AMOUNT = 100;
class Simulation {
  private session: Session;
  private players: AiPlayer[]|Player[];

  constructor() {
    this.session = new Session([]);
    this.players = this.session.getState().getPlayers();
  }

  async run() {
    const simulationResults:Array<SimulationResult> = [];

    while (this.session.hasNextRound()) {
      const round = this.session.getState().round;
      const roundResults = await this.session.nextRound();
      let winner = parseInt(roundResults.winners[0].split('_')[2], 2);
      winner = isNaN(winner) ? -1 : winner;

      const firstUnits = this.players[0] ? this.players[0].board.units().reduce((prev:string[], cur) => {
        prev.push(cur.name)
        return prev;
      }, []) : [];

      const secondUnits = this.players[1] ? this.players[1].board.units().reduce((prev:string[], cur) => {
        prev.push(cur.name)
        return prev;
      }, []) : [];

      const gandicaps:number[] = [];
      if (this.players[winner]) {
        this.players[winner].board.units().map((myUnit: BattleUnit) => {
          // we iterate battle units for our winner and finding out how much health is left after battle
          const bUnit = roundResults.battles[0].finalBoard.find(unit => unit.id === myUnit.id);
          if (bUnit) {
            gandicaps.push(percentage(bUnit.health, bUnit.maxHealth));
          } else {
            gandicaps.push(0); // unit is dead
          }
        });
      }

      let gandicap = gandicaps.reduce((avg, value, _, { length }) => avg + value / length, 0);

      if (winner === 1) {
        gandicap *= -1;
      }

      simulationResults.push({
        firstUnits,
        secondUnits,
        gandicap,
        round
      });
    }

    return simulationResults;
  }
}

console.log('Generating train data ...');

(async function() {
  const records: any = {};
  for (let iteration = 0; iteration < SIMULATIONS_AMOUNT; iteration++) {
    const simulation = new Simulation();
    const results = await simulation.run();
    console.log(`${iteration + 1} simulation is done.`)

    results.forEach(res => {
      if (!records[res.round]) {
        records[res.round] = [];
      }

      // if (res.round === 1) {
      //   console.log("res", res)
      // }

      records[res.round].push({
        units: [...res.firstUnits],
        gandicap: [ res.gandicap ]
      })
    });
  }

  Object.keys(records).forEach((round) => {
    new Loader('data/perRound', round).saveData(records[round]).then(() => {
      console.log(`${records[round].length} amount of ${round} round were saved`);
    });
  })
})();
