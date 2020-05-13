import { Trainer } from 'synaptic';
import { Loader } from './loader';
import { Normalizer } from './normalizer';
import NeuralNetwork from './neuralNetwork';
import { almostEqual, percentage } from '../src/utils/math';

const ROUND = 5;
const run = async () => {
  for (let index = 1; index < ROUND; index++) {
    const aiGenerator = async (round) => {
      const trainData = new Loader('trainData', ROUND).getData();
      const normalizer = new Normalizer(trainData);
      // setting required options and normalize the data
      normalizer.setOutputProperties(['gandicap']);
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

      console.time('TrainingTimer');
      console.timeLog('TrainingTimer', 'Starting training up…');

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
      const examData = new Loader('examData', round).getData();
      const examinator = new Normalizer(examData);
      examinator.setDatasetMetaData(metadata).setOutputProperties(['gandicap']).normalize();

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
      new Loader('network', round).saveData(exported).then(() => {
        console.log(`Network for round ${round} was saved to JSON.`);
      });

      const standalone = NN.standalone();
      new Loader('trained', round, 'js').saveData('export default ' + standalone.toString()).then(() => {
        console.log(`Trained network for round ${round} was exported.`);

        return true;
      });

      new Loader('metadata', round).saveData(metadata).then(() => {
        console.log(`Metadata for round ${round} was saved to JSON.`);

        return true;
      });
    };

    await aiGenerator(index);
  }
};

run();