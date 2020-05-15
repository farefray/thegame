import Player from '../src/objects/Player';
import { Loader } from './Loader';
import Session from '../src/objects/Session';
import AiPlayer from '../src/objects/AiPlayer';
import BattleUnit from '../src/objects/BattleUnit';
import { percentage } from '../src/utils/math';

const TRAIN_DATA_AMOUNT = 100;

interface SimulationResult {
  gandicap: number;
  firstUnits: string[];
  secondUnits: string[];
  bucket: number;
}

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