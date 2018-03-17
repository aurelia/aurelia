const fs = require('fs');

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
}
