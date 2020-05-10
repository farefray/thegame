import { Loader } from './loader';
import { Normalizer } from './normalizer';
import * as brain from './brain/browser';

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

const binaryDataSet = normalizer.getBinaryTrainingSet();
const trainingDataSet = normalizer.getDataSet();

console.log('\n', '\x1b[37m\x1b[46m', 'METADATA:', '\x1b[0m');
console.log(metadata);
console.log('\n', '\x1b[37m\x1b[42m', 'binaryDataSet example:', '\x1b[0m');
console.log(binaryDataSet[0]);
console.log('\n', '\x1b[37m\x1b[42m', 'trainingDataSet example:', '\x1b[0m');
console.log(trainingDataSet[0]);

console.time('TrainingTimer');
console.timeLog('TrainingTimer', 'Starting training up…');

const RNNconfig = {
  inputSize: nbrInputs,
  hiddenLayers: [nbrInputs, nbrInputs],
  outputSize: nbrOutputs,
  learningRate: 0.01,
  decayRate: 0.999,
};

const net = new brain.recurrent.LSTM()

const trainingOptions = {
  iterations: 1000,
  log: details => {
    console.timeLog('TrainingTimer', '... training');
    return console.log(details)
  }
};
net.train(binaryDataSet, trainingOptions);

console.timeLog('TrainingTimer', 'AI is setup');
console.timeEnd('TrainingTimer');

// our net is trained now, lets check how correct is that
const examData = new Loader('data', 'examData.json').getData();
const examinator = new Normalizer(examData);
examinator.setDatasetMetaData(metadata).setOutputProperties(['winner'/*, 'winnerPower'*/]).normalize();

console.log('=====================EXAM==========================');
const examDataSet = examinator.getBinaryTrainingSet();
const dataSet = examinator.getDataSet();
console.log(dataSet[0]);
console.log(examDataSet[0]);
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

examDataSet.forEach((examSet, index) => {
  const predictionResult = net.run(examSet.input);

  const [predictedWinner/**, predictedPower */] = predictionResult;
  const [actualWinner/**, actualPower */] = examSet.output;

  if (!almostEqual(predictedWinner, actualWinner)) {
    //console.log(dataSet[index])
    //console.log("predictionResult", predictionResult)
    //console.log("actualWinner", actualWinner)

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


const exported = net.toJSON();
new Loader('network', 'trained.json').saveData(exported).then(() => {
  console.log(`Network was saved to JSON.`);
})