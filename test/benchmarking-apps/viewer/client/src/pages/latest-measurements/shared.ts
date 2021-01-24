import { WritableMeasurementKeys } from '@benchmarking-apps/test-result';
import * as d3 from 'd3';

export function round(value: number, factor = 100): number {
  return Math.round(value * factor) / factor;
}
export class VersionedItem {
  public constructor(
    public readonly name: string,
    public readonly version: string
  ) { }
}

export class Margin {
  public constructor(
    public readonly top: number,
    public readonly right: number,
    public readonly bottom: number,
    public readonly left: number,
  ) { }
}

const colorBuckets = 4;
class Action {
  public color: string;
  public constructor(
    public readonly description: string,
  ) { }
}
export const actions: Record<WritableMeasurementKeys, Action> = {
  'durationInitialLoad': new Action('Initial load'),
  'durationPopulation': new Action('Populate grid'),
  'durationUpdate': new Action('Update every 10th row'),
  'durationShowDetails': new Action('Toggle show details'),
  'durationHideDetails': new Action('Toggle hide details'),
  'durationLocaleDe': new Action('Toggle localize date to \'de\''),
  'durationLocaleEn': new Action('Toggle localize date to \'en\''),
  'durationSortFirstName': new Action('Sort by first name ascending'),
  'durationSortFirstNameDesc': new Action('Sort by first name descending'),
  'durationSortLastName': new Action('Sort by last name ascending'),
  'durationSortLastNameDesc': new Action('Sort by last name descending'),
  'durationSortDob': new Action('Sort by dob ascending'),
  'durationSortDobDesc': new Action('Sort by dob descending'),
  'durationFilterEmployed': new Action('Filter employed'),
  'durationFilterUnemployed': new Action('Filter unemployed'),
  'durationFilterNone': new Action('Filter none'),
  'durationSelectFirst': new Action('Select first row'),
  'durationDeleteFirst': new Action('Delete first row'),
  'durationDeleteAll': new Action('Delete all row'),
};
const sequence: WritableMeasurementKeys[] = Object.keys(actions) as WritableMeasurementKeys[];
const seqLen = sequence.length;
const colorRanges: [number, number][] = new Array<[number, number]>(colorBuckets);
const band = round(1 / colorBuckets);
for (let i = 0; i < colorBuckets; i++) {
  colorRanges[i] = [
    i === 0 ? 0 : round((i * band) + 0.01),
    i === colorBuckets - 1 ? 1 : round((i + 1) * band)
  ];
}
const buckets = new Array<number[]>(colorBuckets);
for (let i = 0; i < seqLen; i++) {
  const j = i % colorBuckets;
  (buckets[j] ?? (buckets[j] = [])).push(i);
}
const colorScales: d3.ScaleBand<number>[] = buckets.map((b, i) => d3.scaleBand(b, colorRanges[i]));
for (let i = 0; i < seqLen; i++) {
  actions[sequence[i]].color = d3.interpolateSpectral(colorScales[i % colorBuckets](i));
}
