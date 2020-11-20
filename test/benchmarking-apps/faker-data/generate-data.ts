import { name, address } from 'faker';
import { writeFileSync } from 'fs';
import type { Opts } from 'minimist';
import * as minisist from 'minimist';

const opts: Opts = {
  alias: {
    name: 'n',
    street: 's',
    pin: 'p',
    city: 'ct',
    country: 'cn',
    jobs: 'j',
  },
  default: {
    name: 150,
    street: 100,
    pin: 100,
    city: 100,
    country: 20,
    jobs: 100,
  }
};
const args = minisist(process.argv.slice(2), opts);
console.log(args);

const namesCount = args.name;
function generateSet<T>(size: number, fn: () => T): T[] {
  const set = new Set<T>();
  const limit = size + 100; // hard limit on iteration with bit of a leeway
  let i = 0;
  while (set.size < size && i < limit) {
    set.add(fn());
    i++;
  }
  console.log(`${fn.toString()}, ${i} iterations to generate a set of ${set.size} items`);
  return Array.from(set);
}

writeFileSync(
  'data.json',
  JSON.stringify({
    firstNames: generateSet(namesCount, () => name.firstName()),
    lastNames: generateSet(namesCount, () => name.lastName()),
    streets: generateSet(args.street, () => address.streetName()),
    pins: generateSet(args.street, () => address.zipCode()),
    cities: generateSet(args.street, () => address.city()),
    countries: generateSet(args.street, () => address.country()),
    jobs: generateSet(args.jobs, () => name.jobTitle()),
  }, undefined, 2),
  'utf8'
);
