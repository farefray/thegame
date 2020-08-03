import { createStore } from 'easy-peasy';
import storeModel from '@/store/model';
import { mergeDeep } from './utils';

export function createMockedStore(adjustedState) {
  return createStore(mergeDeep(storeModel, adjustedState));
}