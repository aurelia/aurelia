const { path } = require('chromedriver');
const { execFile } = require('child_process');

class ChromeDriverLauncher {
  onPrepare() {
    return new Promise((resolve, reject) => {
      this.process = execFile(path, [], err => err ? reject(err) : void 0);
      if (this.process) resolve();
    });
  }
  onComplete() {
    if (this.process) this.process.kill();
  }
}

module.exports = new ChromeDriverLauncher();
