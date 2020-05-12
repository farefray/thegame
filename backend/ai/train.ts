import { tensor } from '@tensorflow/tfjs';

import {
  createSmp,
  getInputLayerShape,
  getOutputUnits,
  smpEarlyStoppingTraining,
  smpPredict
} from './smp';

import { Loader } from "./loader";
import { Normalizer } from "./normalizer";

const trainData = new Loader('data/perRound', '1').getData();
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

const useBINARY = false;
const netInput = useBINARY ? normalizer.getBinaryInput() : normalizer.getDataInput();
const netOutput = useBINARY ? normalizer.getBinaryOutput() : normalizer.getDataOutput();

console.log('\n', '\x1b[37m\x1b[46m', 'METADATA:', '\x1b[0m');
console.log(metadata);
console.log('\n', '\x1b[37m\x1b[42m', 'netInput example:', '\x1b[0m');
console.log(netInput[0]);
console.log('\n', '\x1b[37m\x1b[42m', 'netOutput example:', '\x1b[0m');
console.log(netOutput[0]);

console.time('TrainingTimer');
console.timeLog('TrainingTimer', 'Starting training up…');

const inputTensor = tensor([[0], [1], [2], [3], [4]]);
const targetTensor = tensor([[1, 2, 3, 4, 5]]);

console.log(getOutputUnits(targetTensor));

const inputShape = getInputLayerShape(inputTensor);

if (inputShape && inputShape.length) {
  const smp = createSmp({
    inputLayerShape: inputShape,
    outputUnits: getOutputUnits(targetTensor),
    hiddenUnits: 5,
    training: 'sgd'
  });

  smpEarlyStoppingTraining({
    smp,
    trainingIterations: 2000,
    threshold: 0.000001,
    validationSplit: 0,
    getInputForTrainingIteration: (trainingIterationNum: number) =>
      inputTensor,
    getTargetForTrainingIteration: (trainingIterationNum: number) =>
      targetTensor
  }).then(h => {
    smpPredict({ smp, inputTensorLike: [[0]] });
    smpPredict({ smp, inputTensorLike: [[1]] });
    smpPredict({ smp, inputTensorLike: [[2]] });
    smpPredict({ smp, inputTensorLike: [[3]] });
    console.log(smpPredict({ smp, inputTensorLike: [[4]] })[0][0]);
  });
}

/*const net = new MLPerceptron(netInput, netOutput, 2, 'sgd', 'sigmoid', 'linear', 'meanSquaredError', 0.25);

net.earlyStoppingTraining(2000, 0.000001, 0).then((h) => {
  console.log("h", h)
  net.predict(netInput[0]);
  console.log(netOutput[0])
});*/