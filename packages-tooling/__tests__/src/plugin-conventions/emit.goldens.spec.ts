import fs from 'node:fs';
import path from 'node:path';
import { strict as assert } from 'node:assert';
import { createTypeCheckedTemplate, type ClassMetadata } from '@aurelia/plugin-conventions';

type Scenario = { label: string; html: string; classes: ClassMetadata[] };
type Manifest = { scenarios: Scenario[] };

const GOLDEN_ROOT = path.resolve(__dirname, 'golden/typechecking');
const MANIFEST = path.join(GOLDEN_ROOT, 'manifest.json');

const read = (p: string) => fs.readFileSync(p, 'utf8');
const stripHeader = (s: string) => s.replace(/^\s*\/\*[\s\S]*?AUTO-GENERATED:[\s\S]*?\*\/\s*/m, '').replace(/\r\n/g, '\n').trim();

describe('template-typechecking emit (goldens)', function () {
  const manifest: Manifest = JSON.parse(read(MANIFEST));

  for (const s of manifest.scenarios) {
    it(`[TS] ${s.label}`, function () {
      const goldenPath = path.join(GOLDEN_ROOT, 'ts', `${s.label}.ts`);
      assert.ok(fs.existsSync(goldenPath), `Missing golden: ${goldenPath}`);

      const golden = stripHeader(read(goldenPath));
      const current = stripHeader(String(createTypeCheckedTemplate(s.html, s.classes, false)));

      assert.strictEqual(
        current,
        golden,
        `Emit changed for [TS] ${s.label}\n  golden: ${goldenPath}\n  If intentional, run: npm run gen:ttc-goldens`
      );
    });
  }

  for (const s of manifest.scenarios) {
    it(`[JS] ${s.label}`, function () {
      const goldenPath = path.join(GOLDEN_ROOT, 'js', `${s.label}.ts`);
      assert.ok(fs.existsSync(goldenPath), `Missing golden: ${goldenPath}`);

      const golden = stripHeader(read(goldenPath));
      const current = stripHeader(String(createTypeCheckedTemplate(s.html, s.classes,  true)));

      assert.strictEqual(
        current,
        golden,
        `Emit changed for [JS] ${s.label}\n  golden: ${goldenPath}\n  If intentional, run: npm run gen:ttc-goldens`
      );
    });
  }
});
