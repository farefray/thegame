
import BattleUnit from "../objects/BattleUnit";

import { BOARD_UNITS_LIMIT as BUCKETS} from '../objects/Player';
import { Normalizer } from "../../ai/Normalizer";

export default class AIService {
  private static instance: AIService;

  private neurals;
  private dataNormalizers: Array<Normalizer>;

  // todo get rid of dynamic imports. Preload those buckets and neurals!
  private constructor() {
    console.log('AIService', 'is being constructed.')

    this.neurals = [];
    this.dataNormalizers = [];

    for (let bucket = 1; bucket <= BUCKETS; bucket++) {
      // each bucket represents amount of units used in simulation. Thats the simpliest way for handling base logic
      this.neurals[bucket] = require(`../../ai/trained/${bucket}.js`);
      this.dataNormalizers[bucket] = new Normalizer().setDatasetMetaData(require(`../../ai/metadata/${bucket}.json`));
    }

    console.log('AIService', 'is constructed.')
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }

    return AIService.instance;
  }

  /** TODO? Maybe consider having some utility class for BattleUnit[] */
  public mostSuitableUnit(currentUnits: BattleUnit[], availableUnits: BattleUnit[], bucket: number) {
    // prepare data
    const current = currentUnits.reduce((prev: string[], cur) => {
      prev.push(cur.name)
      return prev;
    }, []);

    const available = availableUnits.reduce((prev: string[], cur) => {
      prev.push(cur.name)
      return prev;
    }, []);

    const unitsToPick = Math.min(bucket - current.length, available.length);
    if (unitsToPick > 0) {
      // score all possible units to figure out best ones
      const scoredResults = available.map((value) => {
        const possibleCombination = [...current, value];
        const bucketSize = possibleCombination.length;
        const neuralInputData = this.dataNormalizers[bucketSize].dataToBinary([{
          units: possibleCombination
        }]);

        const [neuralScore] = this.neurals[bucketSize].default(...neuralInputData);
        return {
          name: value,
          score: neuralScore
        }
      }).sort((a, b) => b.score - a.score);


      // Todo make it output array of units
      return availableUnits.find(({ name }) => name === scoredResults[0].name);
    }

    // todo pick combination with biggest predicted output
    return availableUnits[Math.floor(Math.random() * availableUnits.length)]; // temp sol
  }
}
