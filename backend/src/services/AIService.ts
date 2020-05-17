
import { BOARD_UNITS_LIMIT as BUCKETS} from '../objects/Player';
import { Normalizer } from "../../ai/normalizer";
import { AIFlags, StrategyFlags } from "../objects/AiPlayer";
import BattleUnitList from "../objects/BattleUnit/BattleUnitList";

const neurals: Array<Function> = [];
const dataNormalizers: Array<Normalizer> = [];

for (let bucket = 1; bucket <= BUCKETS; bucket++) {
  // each bucket represents amount of units used in simulation. Thats the simpliest way for handling base logic
  neurals[bucket] = require(`../../ai/trained/${bucket}.js`);
  dataNormalizers[bucket] = new Normalizer().setDatasetMetaData(require(`../../ai/metadata/${bucket}.json`));
}

interface mostSuitableInterface {
  current: BattleUnitList;
  proposed: BattleUnitList;
  amount: number;
}

export default class AIService {
  private static instance: AIService;

  private neurals;
  private dataNormalizers: Array<Normalizer>;

  // todo get rid of dynamic imports. Preload those buckets and neurals!
  private constructor() {
    this.neurals = neurals;
    this.dataNormalizers = dataNormalizers;
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }

    return AIService.instance;
  }

  public mostSuitableUnit(mostSuitableInterface: mostSuitableInterface, flags: AIFlags) {
    if (flags.hasStrategyFlags(StrategyFlags.PICK_BEST_UNITS)) {
      const current = mostSuitableInterface.current.unitNames;
      const proposed = mostSuitableInterface.proposed.unitNames;

      if (mostSuitableInterface.amount > 0) {
        // score all possible units to figure out best ones
        const scoredResults = proposed.map((value) => {
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
        return mostSuitableInterface.proposed.findByName(scoredResults[0].name);
      }
    }

    // todo pick combination with biggest predicted output
    return mostSuitableInterface.proposed.random;
  }
}
