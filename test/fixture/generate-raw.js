const fs = require('fs');
const path = require('path');

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

walk('.', (err, files) => {
  if (err) {
    console.log(err);
  } else {
    files = files
      .filter(r => /^(?!.*raw\.ts$).*\.ts$/.test(r));

    const outFile = path.resolve(__dirname, "./raw.ts");
    fs.writeFileSync(outFile, 'export const raw: { [path: string]: string } = Object.create(null);\n\n', 'utf-8');

    files.forEach(f => {
      const content = fs.readFileSync(f, 'utf-8').replace(/([`$])/g, '\\$1');
      const path = f.replace(/[\\\/]+/g, '/').replace(/\.ts$/, '').split('fixture/')[1];

      fs.appendFileSync(outFile, `raw['${path}'] = \`${content}\`\n`, 'utf-8');
    });
  }
});
