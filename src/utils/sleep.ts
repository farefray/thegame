import { promisify } from 'util';
const sleep = promisify(setTimeout);
export default sleep;

export async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
export const waitFor = (ms) => new Promise(r => setTimeout(r, ms));
