import path from 'path';
import fs from 'fs';

const moduleExports = {}
const loadDirs = function (dirname) {
  fs.readdirSync(dirname)
    .forEach(function (file) {
      /* If its the current file ignore it */
      if (file === 'loader.js') return;

      const stat = fs.statSync(path.resolve(path.join('src', 'monsters', file)));
      if (stat.isDirectory()) {
        // TODO loadDirs(dirname + '\\' + file);
      } else {
        /* Store module with its name (from filename) */
        moduleExports[path.basename(file, '.js')] = require(path.join(__dirname, file));
      }
    });
};

loadDirs(__dirname);
