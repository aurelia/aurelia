const fs = require('fs');
const path = require('path');

exports.NodeFileUtils = class NodeFileUtils {
  /**
   * @param {string} fileName
   */
  readFile(fileName) {
    return new Promise((resolve, reject) => {
      fs.readFile(fileName, 'utf-8', (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(data);
      });
    });
  }

  /**
   * @param {string} fileName
   */
  readFileSync(fileName) {
    return fs.readFileSync(fileName, 'utf-8');
  }

  /**
   * @param {string} fileName
   * @param {*} data
   */
  writeFile(fileName, data) {
    return new Promise((resolve, reject) => {
      fs.writeFile(fileName, data, err => {
        if (err) {
          reject(err);
          return;
        }
        resolve(true);
      })
    });
  }

  /**
   * @param {string} fileName
   */
  writeFileSync(fileName, data) {
    try {
      fs.writeFileSync(fileName, data, 'utf-8');
      return true;
    } catch (ex) {
      return false;
    }
  }

  exists(fileName) {
    return new Promise(resolve => {
      fs.exists(fileName, exists => {
        resolve(exists);
      });
    });
  }

  existsSync(fileName) {
    return fs.existsSync(fileName);
  }

  getFileNamesRecursive(dir) {
    return new Promise((resolve, reject) => {
      walk(dir, (err, files) => {
        if (err) {
          reject(err);
        } else {
          resolve(files);
        }
      });
    });
  }

  getAbsolutePath(dir) {
    return path.resolve(__dirname);
  }
}


const walk = (dir, done) => {
  let results = [];

  fs.readdir(dir, (err, list) => {
    if (err) {
      return done(err);
    }

    let pending = list.length;
    if (!pending) {
      return done(null, results);
    }

    list.forEach(file => {
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          walk(file, (err, res) => {
            results = results.concat(res);
            if (!--pending) {
              done(null, results);
            }
          });
        } else {
          results.push(file);
          if (!--pending) {
            done(null, results);
          }
        }
      });
    });
  });
};
