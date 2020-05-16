import * as fs from 'fs';

export class Loader {
  public dir: string;
  public filename: string;

  private baseDir = 'ai';

  constructor(dirName, filename, ext = 'json') {
    this.dir = dirName;
    this.filename = `${filename}.${ext}`;
  }

  get path() {
    return `${this.baseDir}/${this.dir}/${this.filename}`.replace('//', '/');
  }

  getData() {
    const data: string = fs.readFileSync(this.path, 'utf8');
    return JSON.parse(data);
  }

  async saveData(data: any) {
    if (typeof data !== 'string') {
      data = JSON.stringify(data);
    }

    return new Promise((resolve, reject) => fs.writeFile(this.path, data, 'utf8', (err) => {
        if (err) {
          console.log(err);
          return reject();
        }

        resolve();
    }))
  }

  cleanup() {
    if (fs.existsSync(this.path)) {
      fs.unlinkSync(this.path);
    }

    return this;
  }
}
