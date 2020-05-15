import { Trainer } from 'synaptic';
import { Loader } from './Loader';
import { Normalizer } from './Normalizer';
import NeuralNetwork from './NeuralNetwork';
import { almostEqual, percentage } from '../src/utils/math';

import { BOARD_UNITS_LIMIT as BUCKETS } from '../src/objects/Player';

const run = async () => {
  console.time('TrainingTimer');

  for (let index = 1; index <= BUCKETS; index++) {
    const aiGenerator = async (bucket) => {
      const trainData = new Loader('trainData', bucket).getData();
      const normalizer = new Normalizer(trainData);
      // setting required options and normalize the data
      normalizer.normalize();

      // find useful information about your data
      // to pass to your neural network
      // check input and output lenghtes
      const nbrInputs = normalizer.getInputLength();
      console.log('nbrInputs', nbrInputs);
      const nbrOutputs = normalizer.getOutputLength();
      console.log('nbrOutputs', nbrOutputs);

      const metadata = normalizer.getDatasetMetaData();

      const binaryTrainingSet = normalizer.getBinaryTrainingSet();
      const netInput = normalizer.getBinaryInput();
      const dataInput = normalizer.getDataInput();
      const netOutput = normalizer.getBinaryOutput();
      const dataOutput = normalizer.getDataOutput();

      console.log('\n', '\x1b[37m\x1b[46m', 'METADATA:', '\x1b[0m');
      console.log(metadata);
      console.log('\n', '\x1b[37m\x1b[42m', 'binaryTrainingSet example:', '\x1b[0m');
      console.log(binaryTrainingSet[0]);
      console.log('\n', '\x1b[37m\x1b[42m', 'netInput example:', '\x1b[0m');
      console.log(netInput[0]);
      console.log('\n', '\x1b[37m\x1b[42m', 'netOutput example:', '\x1b[0m');
      console.log(netOutput[0]);

      console.timeLog('TrainingTimer', 'Starting network train, bucket: ' + bucket);

      const NN = new NeuralNetwork(nbrInputs, nbrInputs, nbrOutputs);
      const trainer = new Trainer(NN);
      trainer.train(binaryTrainingSet, {
        rate: 0.1,
        iterations: 1000,
        error: 0.005,
        shuffle: true,
        log: 100,
        cost: Trainer.cost.MSE
      });

      // our net is trained now, lets check how correct is that
      const examData = new Loader('examData', bucket).getData();
      const examinator = new Normalizer(examData);
      examinator.setDatasetMetaData(metadata).normalize();

      console.log('=====================REAL EXAM==========================');
      const examDataSet = examinator.getBinaryTrainingSet();
      const realDataSet = examinator.getDataSet();
      const examResults = {
        passed: 0,
        failed: 0
      };

      examDataSet.forEach((examSet, index) => {
        console.log('realDataSet[index]', realDataSet[index]);
        const predictionResult = NN.activate(examSet.input);

        const [predictedGandicap] = predictionResult;
        console.log('predictedGandicap', predictedGandicap);
        const [actualGandicap] = examSet.output;
        console.log('actualGandicap', actualGandicap);

        if (!almostEqual(predictedGandicap, actualGandicap)) {
          examResults.failed++;
        } else {
          examResults.passed++;
        }
      });

      console.log(`Total tests: ${examResults.passed + examResults.failed}. Success rate: ${percentage(examResults.passed, examResults.passed + examResults.failed)}`);
      console.log('=====================EXAM==========================');

      const exported = NN.toJSON();
      await new Loader('network', bucket).saveData(exported);
      console.log(`Network for bucket ${bucket} was saved to JSON.`);

      const standalone = NN.standalone();
      await new Loader('trained', bucket, 'js').saveData('let F;\nexport default ' + standalone.toString());
      console.log(`Trained network for bucket ${bucket} was exported.`);

      await new Loader('metadata', bucket).saveData(metadata);
      console.log(`Metadata for bucket ${bucket} was saved to JSON.`);
    };

    await aiGenerator(index);
  }
};

run();
