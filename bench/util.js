let allowNatives = process.execArgv.indexOf('--allow-natives-syntax') >= 0;
let v8;
if (allowNatives) {
  v8 = require('./v8-native-calls.js').v8
  console.log('Running with --allow-natives-syntax, JIT optimizations will be disabled wherever they can');
} else {
  console.log('Not running with --allow-natives-syntax, JIT optimizations will not be disabled');
}

const fs = require('fs');
const path = require('path');
const scriptFile = process.argv[1];
const benchDir = path.parse(scriptFile).dir;

const colors = {
  Reset: '\x1b[0m',
  Bright: '\x1b[1m',
  Dim: '\x1b[2m',
  Underscore: '\x1b[4m',
  FgRed: '\x1b[31m',
  FgGreen: '\x1b[32m'
};

function padLeft(str, desiredLength, ch) {
  while ((str = str.toString()).length < desiredLength) str = (ch ? ch : ' ') + str;
  return str;
}
function padRight(str, desiredLength, ch) {
  while ((str = str.toString()).length < desiredLength) str += ch ? ch : ' ';
  return str;
}
function log(str, colorBefore = colors.Reset, colorAfter = colors.Reset) {
  console.log(colorBefore, str, colorAfter);
}

class Column {
  constructor(name, width, alignment) {
    this.name = name;
    this.width = width;
    this.alignment = alignment;
  }
}

class Benchmark {
  get col() {
    return this.columns[this.columnIndex];
  }

  get test() {
    return this.tests[this.testIndex];
  }

  constructor(columns, tests, sutCount, iterations, rotations = 1) {
    this.columns = columns;
    for (const column of columns) {
      column.pad = column.alignment === 'left' ? padRight : padLeft;
    }
    this.tests = tests;
    this.sutCount = sutCount;
    this.iterations = iterations;
    this.rotations = rotations;
    this.totalElapsed = [0, 0, 0];
    this.sutIndex = 0;
    this.testIndex = 0;
    this.columnIndex = 0;
    this.currentRotation = 0;
    this.elapsed = [0, 0, 0];
    this.ops = 0;
    this.totalWidth = columns.map(c => c.width).reduce((prev, cur) => prev + cur);
    this.hr = padRight('', this.totalWidth, '-');
  }

  nextRotation() {
    this.sutIndex = 0;
    this.testIndex = 0;
    this.columnIndex = 0;
    this.currentRotation++;
    this.elapsed = [0, 0, 0];
    this.writeSeparator();
  }

  nextTest() {
    this.testIndex++;
    this.columnIndex = 0;
    this.elapsed = [0, 0, 0];
    this.sutIndex = 0;
  }

  nextCol() {
    this.columnIndex++;
  }

  nextSut() {
    this.sutIndex++;
  }

  addResult(res) {
    if (allowNatives) {
      v8.collectGarbage();
    }
    if (res) {
      this.elapsed[this.sutIndex] = res[0] * 10e8 + res[1];
      if (this.sutIndex + 1 === this.sutCount && this.elapsed[0] && this.elapsed[1] && (this.sutCount === 2 || this.elapsed[2])) {
        this.ops += this.iterations * this.test.weight;
        this.totalElapsed[0] += this.elapsed[0];
        this.totalElapsed[1] += this.elapsed[1];
        this.totalElapsed[2] += this.elapsed[2];
      }
      this.writeElapsedText();
    } else {
      this.output += this.col.pad('-', this.col.width);
      this.nextCol();
    }

    if (res) {
      if (this.sutIndex === 1) {
        this.writeDiffText(0, 1);
      } else if (this.sutIndex === 2) {
        this.writeDiffText(0, 2);
        this.writeDiffText(1, 2);
      }
    } else if (this.sutIndex === 1) {
      this.output += this.col.pad('', this.col.width);
      this.nextCol();
    }

    if (this.sutIndex + 1 === this.sutCount) {
      this.flushOutput();
      this.nextTest();
    } else {
      this.nextSut();
    }
  }

  writeElapsedText(divider = this.iterations * this.test.weight) {
    this.columnIndex = this.sutIndex === 0 ? 2 : this.sutIndex === 1 ? 3 : 5;
    let elapsed = Math.round(this.elapsed[this.sutIndex] / divider);
    let symbol = 'ns';
    if (elapsed > 1000) { elapsed /= 1000; symbol = 'µs'; }
    if (elapsed > 1000) { elapsed /= 1000; symbol = 'ms'; }
    elapsed = (Math.round((elapsed + 0.00001) * 10) / 10).toString();
    if (elapsed.indexOf('.') === -1) elapsed += '.0';
    this.output += this.col.pad(`${elapsed} ${symbol}`, this.col.width);
  }

  writeDiffText(iA, iB) {
    this.columnIndex = iB === 1 ? 4 : iB === 2 ? iA === 0 ? 6 : 7 : 0;
    const a = this.elapsed[iA];
    const b = this.elapsed[iB];
    if (!(a && b)) {
      this.output += this.col.pad('', this.col.width);
      return;
    }
    const percent = Math.round((Math.max(a, b) / Math.min(a, b) - 1) * 100);
    const color = a < b ? colors.FgRed : colors.FgGreen;
    this.output += color + this.col.pad(`${percent} %`, this.col.width) + colors.Reset;
  }

  writeLineStart() {
    this.output = this.test.weight > 1 ? colors.Bright : '';
    this.output += this.col.pad(this.test.weight, this.col.width);
    this.nextCol();
    this.output += this.col.pad(this.test.expr.replace(/\r?\n/g, ''), this.col.width).slice(0, this.col.width) + colors.Reset;
    this.nextCol();
  }

  writeHeader() {
    this.output = `${this.hr}\n ${padLeft('Execution time per operation', this.totalWidth)}\n\n`;
    for (const column of this.columns) {
      this.output += column.pad(column.name, column.width);
    }
    this.output += `\n${this.hr}`;
    this.flushOutput();
  }

  writeFooter() {
    this.writeSeparator();

    this.output = colors.Bright + padRight(`Execution time (${this.ops} ops)`, this.columns[0].width + this.columns[1].width);
    this.elapsed = this.totalElapsed;

    this.sutIndex = 0;
    this.writeElapsedText(1);

    this.nextSut();
    this.writeElapsedText(1);
    this.writeDiffText(0, 1);
    this.output += colors.Bright;

    if (this.sutCount === 3) {
      this.nextSut();
      this.writeElapsedText(1);
      this.writeDiffText(0, 2);
      this.output += colors.Bright;
      this.writeDiffText(1, 2);
      this.output += colors.Bright;
    }

    this.flushOutput();
    this.writeSeparator();
  }

  writeSeparator() {
    log(this.hr);
  }

  flushOutput() {
    log(this.output);
    this.output = '';
  }
}

function disableOptimizations(parser) {
  if (allowNatives) {
    for (const prop in parser) {
      v8.neverOptimizeFunction(parser[prop]);
    }
  }
}

function rewriteExports(file) {
  const filePath = path.resolve(benchDir, file + '.js');
  const newFilePath = filePath.slice(0, filePath.length - 3) + '-rewritten.js';
  const content = fs.readFileSync(filePath, { encoding: 'utf-8' });
  const reg = /^(const|function) ([a-zA-Z0-9$_]+).*/;
  let $exports = '';
  for (let line of content.split(/\r?\n/)) {
    if (reg.test(line)) {
      $exports += line.replace(reg, '\nexports.$2 = $2;');
    }
  }
  fs.writeFileSync(newFilePath, content + $exports, { encoding: 'utf-8' });
}

module.exports.Column = Column;
module.exports.Benchmark = Benchmark;
module.exports.disableOptimizations = disableOptimizations;
module.exports.rewriteExports = rewriteExports;
