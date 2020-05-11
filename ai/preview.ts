import { Normalizer } from './normalizer';
import { Loader } from './loader';
import brain, { INeuralNetworkJSON } from 'brain.js';
import { percentage, almostEqual } from '../src/utils/math';
import json from './network/trained.json';

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

console.log('\n', '\x1b[37m\x1b[46m', 'METADATA:', '\x1b[0m');
console.log(metadata);

console.time('TrainingTimer');
console.timeLog('TrainingTimer', 'Checking trained network');

// create a simple recurrent neural network

const net = new brain.NeuralNetwork()

net.fromJSON(json as INeuralNetworkJSON)


// our net is trained now, lets check how correct is that
const examData = new Loader('data', 'examData.json').getData();
const examinator = new Normalizer(examData);
examinator.setDatasetMetaData(metadata).setOutputProperties(['gandicap']).normalize();

console.log('=====================REAL EXAM==========================');
const examDataSet = useBINARY ? examinator.getBinaryTrainingSet() : examinator.getDataSet();

const examResults = {passed: 0, failed: 0};

examDataSet.forEach((examSet, index) => {
  const predictionResult = net.run(examSet.input);
  

  if (!almostEqual(predictionResult, examSet.output)) {
    console.log("predictionResult", predictionResult)
    console.log("examSet.output", examSet.output)
    examResults.failed++;
  } else {
    examResults.passed++;
  }
});

console.log(`Total tests: ${examResults.passed + examResults.failed}. Success rate: ${percentage(examResults.passed, examResults.passed + examResults.failed)}`)
console.log('=====================EXAM==========================');

