import * as fs from 'fs';
import {initializeFrameworks} from './common';

async function main() {
  const frameworks = await initializeFrameworks();

  frameworks.sort((a,b) => a.fullNameWithKeyedAndVersion.localeCompare(b.fullNameWithKeyedAndVersion));

  const dots = require('dot').process({
    path: './'
  });

  fs.writeFileSync(
    '../index.html',
    dots.index({
      frameworks
    }),
    {
      encoding: 'utf8'
    }
  );
}

main().catch((error: Error) => { throw error; });
