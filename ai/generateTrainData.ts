import Player from '../src/objects/Player';
import { Loader } from './loader';
import Session from '../src/objects/Session';
import AiPlayer from '../src/objects/AiPlayer';
import BattleUnit from '../src/objects/BattleUnit';
import { percentage } from '../src/utils/math';

const SIMULATIONS_AMOUNT = 2000;
class Simulation {
  private session: Session;
  private players: AiPlayer[]|Player[];

  constructor() {
    this.session = new Session([]);
    this.players = this.session.getState().getPlayers();
  }

  async run() {
    const simulationResults:Array<any> = [];

    while (this.session.hasNextRound()) {
      const roundResult: {
        gandicap: number,
        firstUnits: string[],
        secondUnits: string[]
      } = {
        gandicap: 0,
        firstUnits: [],
        secondUnits: []
      };

      const roundResults = await this.session.nextRound();
      let winner = parseInt(roundResults.winners[0].split('_')[2], 2);
      winner = isNaN(winner) ? -1 : winner;

      roundResult.firstUnits = this.players[0] ? this.players[0].board.units().reduce((prev:string[], cur) => {
        prev.push(cur.name)
        return prev;
      }, []) : [];

      roundResult.secondUnits = this.players[1] ? this.players[1].board.units().reduce((prev:string[], cur) => {
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

      roundResult.gandicap = gandicaps.reduce((avg, value, _, { length }) => avg + value / length, 0);

      if (winner === 0) {
        roundResult.gandicap *= -1;
      }

      simulationResults.push({
        ...roundResult
      });
    }

    return simulationResults;
  }
}

console.log('Generating train data ...');

(async function() {
  const records: any = [];
  for (let iteration = 0; iteration < SIMULATIONS_AMOUNT; iteration++) {
    const test = new Simulation();
    const results = await test.run();
    console.log(`${iteration + 1} simulation is done.`)
    records.push(...results);
  }

  new Loader().saveData(records).then(() => {
    console.log(`${records.length} amount of train battles were saved`);
  });


  const examRecords: any = [];
  for (let iteration = 0; iteration < Math.floor(SIMULATIONS_AMOUNT / 10); iteration++) {
    const test = new Simulation();
    const results = await test.run();
    console.log(`${iteration + 1} exam simulation is done.`)
    examRecords.push(...results);
  }

  new Loader('data', 'examData.json').saveData(examRecords).then(() => {
    console.log(`${records.length} amount of examination data battles were saved`);
  });
})();
