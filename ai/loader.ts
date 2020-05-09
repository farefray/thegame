import * as fs from 'fs';

/**
 * Load/Save data from local file(s)
 */
export class Loader {
  public dir: string = '';
  public filename: string = '';

  constructor(dirName = 'data', filename = 'trainData.json') {
    this.dir = dirName;
    this.filename = filename;
  }

  getData() {
    const filepath = `ai/${this.dir}/${this.filename}`.replace('//', '/');
    const data: string = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(data);
  }

  async saveData(data: any) {
    const filepath = `ai/${this.dir}/${this.filename}`.replace('//', '/');

    if (typeof data !== 'string') {
      data = JSON.stringify(data);
    }

    return new Promise((resolve) => fs.writeFile(filepath, data, 'utf8', (err) => {
        if (err) {
            return console.log(err);
        }

        resolve();
    }))
  }

  dataIsTrained() {
    return fs.existsSync(`ai/${this.dir}/${this.filename}`.replace('//', '/'));
  }
}
