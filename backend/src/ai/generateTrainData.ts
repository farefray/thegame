import { Loader } from './loader';
import Session from '../models/Session';
import AiPlayer, { StrategyFlags } from '../structures/AiPlayer';
import { percentage } from '../utils/math';

const TRAIN_DATA_AMOUNT = 100;

interface SimulationResult {
  gandicap: number;
  firstUnits: string[];
  secondUnits: string[];
  bucket: number;
}

class Simulation {
  private session: Session;
  private players: AiPlayer[];

  constructor() {
    this.session = new Session([]);
    this.players  = this.session.getState().getPlayers() as AiPlayer[];

    /**
     * first player has to be random, second player will pick best opponents.
     * This way it would give quite good overall information rate for random picks
     */
    this.players[0].AIFlags.removeStrategyFlags(StrategyFlags.PICK_BEST_UNITS);
  }

  async run() {
    const simulationResults:Array<SimulationResult> = [];

    while (this.session.hasNextRound()) {
      const roundResults = await this.session.nextRound();
      let winner = parseInt(roundResults.winners[0].split('_')[2], 2);
      winner = isNaN(winner) ? -1 : winner;

      const firstUnits = this.players[0].board.units().unitNames;

      const secondUnits = this.players[1].board.units().unitNames;

      const gandicaps:number[] = [];
      if (this.players[winner]) {
        for (const myUnit of this.players[winner].board.units()) {
          // we iterate battle units for our winner and finding out how much health is left after battle
          const bUnit = roundResults.battles[0].finalBoard.find(unit => unit.id === myUnit.id);
          if (bUnit) {
            gandicaps.push(percentage(bUnit.health, bUnit.maxHealth));
          } else {
            gandicaps.push(0); // unit is dead
          }
        }
      }

      let gandicap = gandicaps.reduce((avg, value, _, { length }) => avg + value / length, 0);

      if (winner === 1) {
        gandicap *= -1;
      }

      simulationResults.push({
        firstUnits,
        secondUnits,
        gandicap: +(gandicap/100).toFixed(2),
        bucket: firstUnits.length
      });
    }

    return simulationResults;
  }
}

console.log('Generating train data ...');

const generate = async function(folderName, dataAmount) {
  const records: any = {};
  for (let iteration = 0; iteration < dataAmount; iteration++) {
    const simulation = new Simulation();
    const simulationResults = await simulation.run();
    console.log(`${iteration + 1} simulation is done.`)

    simulationResults.forEach(res => {
      if (!records[res.bucket]) {
        records[res.bucket] = [];
      }

      // if (res.round === 1) {
      //   console.log("res", res)
      // }

      records[res.bucket].push({
        units: [...res.firstUnits],
        output: res.gandicap
      })
    });
  }

  Object.keys(records).forEach((bucket) => {
    new Loader(`${folderName}`, bucket).cleanup().saveData(records[bucket]).then(() => {
      console.log(`${records[bucket].length} amount of ${bucket} bucket were saved`);
    });
  })
};

generate('trainData', TRAIN_DATA_AMOUNT);
generate('examData', Math.round(TRAIN_DATA_AMOUNT / 100));