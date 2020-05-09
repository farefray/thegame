import { Loader } from './loader';
import { Normalizer } from './normalizer';
import { Architect, Trainer } from 'synaptic';

const trainData = new Loader().getData();

const normalizer = new Normalizer(trainData);

// setting required options and normalize the data
normalizer.setOutputProperties(['winner'/**, 'winnerPower' */]);
normalizer.normalize();

// find useful information about your data
// to pass to your neural network
// check input and output lenghtes
const nbrInputs = normalizer.getInputLength();
const nbrOutputs = normalizer.getOutputLength();

const metadata = normalizer.getDatasetMetaData();

const dataSet = normalizer.getBinaryTrainingSet();

console.log('\n', '\x1b[37m\x1b[46m', 'METADATA:', '\x1b[0m');
console.log(metadata);
// console.log('\n', '\x1b[37m\x1b[42m', 'DATASET:', '\x1b[0m');
// console.log(dataSet);

console.time('TrainingTimer');
console.timeLog('TrainingTimer', 'Starting training up…');
const myNetwork = new Architect.Perceptron(nbrInputs, 10, 10, nbrOutputs);
const trainer = new Trainer(myNetwork);

const trainConfig = {
  rate: 0.3,
  iterations: 100,
  error: 0.05,
  shuffle: true,
  log: 1,
	cost: Trainer.cost.CROSS_ENTROPY
};

console.log("trainConfig", trainConfig)

trainer.train(dataSet, trainConfig);

console.timeLog('TrainingTimer', 'AI is setup');
console.timeEnd('TrainingTimer');

// our net is trained now, lets check how correct is that
const examData = new Loader('data', 'examData.json').getData();
const examinator = new Normalizer(examData);
examinator.setDatasetMetaData(metadata).setOutputProperties(['winner'/*, 'winnerPower'*/]).normalize();

console.log('=====================EXAM==========================');
const examDataSet = examinator.getBinaryTrainingSet();

const examResults = {
  passed: 0,
  failed: 0
};

function almostEqual(a, b, absoluteError = 0.1, relativeError = 0.2) {
  const d = Math.abs(a - b);

  if (d <= absoluteError) {
    return true;
  }

  if (d <= relativeError * Math.min(Math.abs(a), Math.abs(b))) {
    return true;
  }

  return a === b;
}

examDataSet.forEach((examSet) => {
  const [predictedWinner/**, predictedPower */] = myNetwork.activate(examSet.input);
  const [actualWinner/**, actualPower */] = examSet.output;

  if (Math.round(predictedWinner) !== actualWinner) {
    examResults.failed++;
  /**
   } else if (!almostEqual(predictedPower, actualPower)) {
    examResults.failed++;
   */
  } else {
    examResults.passed++;
  }
});


function percentage(partialValue, totalValue) {
  return (100 * partialValue) / totalValue;
}

console.log(`Total tests: ${examResults.passed + examResults.failed}. Success rate: ${percentage(examResults.passed, examResults.passed + examResults.failed)}`)
console.log('=====================EXAM==========================');


const exported = myNetwork.toJSON();
new Loader('network', 'trained.json').saveData(exported).then(() => {
  console.log(`Network was saved to JSON.`);
})