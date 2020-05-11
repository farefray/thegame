import { Normalizer } from './normalizer';
import { Loader } from './loader';
import brain from 'brain.js';
import { percentage, almostEqual } from '../src/utils/math';

const trainData = new Loader().getData();

const normalizer = new Normalizer(trainData);

// setting required options and normalize the data
normalizer.setOutputProperties(['gandicap']);
normalizer.normalize();

// find useful information about your data
// to pass to your neural network
// check input and output lenghtes
const nbrInputs = normalizer.getInputLength();
console.log("nbrInputs", nbrInputs)
const nbrOutputs = normalizer.getOutputLength();
console.log("nbrOutputs", nbrOutputs)

const metadata = normalizer.getDatasetMetaData();

const useBINARY = true;
const trainingDataSet = useBINARY ? normalizer.getBinaryTrainingSet() : normalizer.getDataSet();

console.log('\n', '\x1b[37m\x1b[46m', 'METADATA:', '\x1b[0m');
console.log(metadata);
console.log('\n', '\x1b[37m\x1b[42m', 'trainingDataSet example:', '\x1b[0m');
console.log(trainingDataSet[0]);

console.time('TrainingTimer');
console.timeLog('TrainingTimer', 'Starting training up…');

// provide optional config object, defaults shown.
const config = {
  binaryThresh: 0.5,
  hiddenLayers: [nbrInputs, nbrInputs], // array of ints for the sizes of the hidden layers in the network
  activation: 'sigmoid', // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
  leakyReluAlpha: 0.01, // supported for activation type 'leaky-relu'
}

// create a simple recurrent neural network
const net = new brain.NeuralNetwork(config)

const trainingOptions = {
  iterations: 10000,
  log: (details) => {
    console.timeLog('TrainingTimer', details);
  },
  logPeriod: 100,
};

net.train(trainingDataSet, trainingOptions);

console.timeLog('TrainingTimer', 'AI is setup');
console.timeEnd('TrainingTimer');

console.log('=====================EXAM(same data)==========================');
let examResults = {
  passed: 0,
  failed: 0
};

trainingDataSet.forEach((examSet, index) => {
  const predictionResult = net.run(examSet.input);

  const [predictedGandicap] = predictionResult;
  const [actualGandicap] = examSet.output;

  if (!almostEqual(predictedGandicap, actualGandicap)) {
    examResults.failed++;
  } else {
    examResults.passed++;
  }
});


console.log(`Total tests: ${examResults.passed + examResults.failed}. Success rate: ${percentage(examResults.passed, examResults.passed + examResults.failed)}`);
console.log('=====================EXAM(with same data)==========================');


// our net is trained now, lets check how correct is that
const examData = new Loader('data', 'examData.json').getData();
const examinator = new Normalizer(examData);
examinator.setDatasetMetaData(metadata).setOutputProperties(['gandicap']).normalize();

console.log('=====================REAL EXAM==========================');
const examDataSet = useBINARY ? examinator.getBinaryTrainingSet() : examinator.getDataSet();

examResults.passed = 0;
examResults.failed = 0;

examDataSet.forEach((examSet, index) => {
  const predictionResult = net.run(examSet.input);
  console.log("predictionResult", predictionResult)

  const [predictedGandicap] = predictionResult;
  const [actualGandicap] = examSet.output;
  console.log("examSet.output", examSet.output)

  if (!almostEqual(predictedGandicap, actualGandicap)) {
    examResults.failed++;
  } else {
    examResults.passed++;
  }
});

console.log(`Total tests: ${examResults.passed + examResults.failed}. Success rate: ${percentage(examResults.passed, examResults.passed + examResults.failed)}`)
console.log('=====================EXAM==========================');


const exported = net.toJSON();
new Loader('network', 'trained.json').saveData(exported).then(() => {
  console.log(`Network was saved to JSON.`);
})

new Loader('network', 'metadata.json').saveData(metadata).then(() => {
  console.log(`Metadata was saved to JSON.`);
})