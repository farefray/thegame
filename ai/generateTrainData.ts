import Player from '../src/objects/Player';
import { Loader } from './loader';
import Session from '../src/objects/Session';
import AiPlayer from '../src/objects/AiPlayer';

const SIMULATIONS_AMOUNT = 150;

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
        winner: number,
        firstUnits: string[],
        secondUnits: string[]
      } = {
        winner: -1,
        firstUnits: [],
        secondUnits: []
      };

      const roundResults = await this.session.nextRound();
      roundResult.winner = parseInt(roundResults.winners[0].split('_')[2], 2);

      roundResult.winner = isNaN(roundResult.winner) ? -1 : roundResult.winner;

      roundResult.firstUnits = this.players[0].board.units().reduce((prev:string[], cur) => {
        prev.push(cur.name)
        return prev;
      }, []);

      roundResult.secondUnits = this.players[1].board.units().reduce((prev:string[], cur) => {
        prev.push(cur.name)
        return prev;
      }, []);

      simulationResults.push(roundResult);
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
    console.log(`${iteration} simulation is done.`)
    records.push(...results);
  }

  new Loader().saveData(records).then(() => {
    console.log(`${records.length} amount of train battles were saved`);
  });


  const examRecords: any = [];
  for (let iteration = 0; iteration < SIMULATIONS_AMOUNT / 10; iteration++) {
    const test = new Simulation();
    const results = await test.run();
    console.log(`${iteration} exam simulation is done.`)
    examRecords.push(...results);
  }

  new Loader('data', 'examData.json').saveData(examRecords).then(() => {
    console.log(`${records.length} amount of examination data battles were saved`);
  });
})();
