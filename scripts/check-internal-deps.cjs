/**
 * Verifies that all internal @aurelia/* dependencies match their package versions.
 * Run this in CI before publish to catch version mismatches.
 *
 * Exit code 0 = all consistent
 * Exit code 1 = mismatches found
 */

const fs = require('fs');
const path = require('path');

const packageDirs = [
  'packages',
  'packages-tooling',
];

// Build map of package name -> version
const packageVersions = new Map();

for (const baseDir of packageDirs) {
  if (!fs.existsSync(baseDir)) continue;
  for (const dir of fs.readdirSync(baseDir)) {
    const pkgPath = path.join(baseDir, dir, 'package.json');
    if (!fs.existsSync(pkgPath)) continue;
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    if (pkg.name && pkg.version) {
      packageVersions.set(pkg.name, pkg.version);
    }
  }
}

// Check all internal dependencies
let hasErrors = false;
const errors = [];

for (const baseDir of packageDirs) {
  if (!fs.existsSync(baseDir)) continue;
  for (const dir of fs.readdirSync(baseDir)) {
    const pkgPath = path.join(baseDir, dir, 'package.json');
    if (!fs.existsSync(pkgPath)) continue;

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

    // Skip private packages - they're not published and don't need version consistency
    if (pkg.private) continue;

    for (const depType of ['dependencies', 'devDependencies', 'peerDependencies']) {
      if (!pkg[depType]) continue;

      for (const [depName, depVersion] of Object.entries(pkg[depType])) {
        // Only check @aurelia/* and aurelia packages that exist in our monorepo
        if (!packageVersions.has(depName)) continue;

        const expectedVersion = packageVersions.get(depName);

        // Skip workspace protocol
        if (depVersion.startsWith('workspace:')) continue;

        // Check if versions match
        if (depVersion !== expectedVersion) {
          hasErrors = true;
          errors.push({
            package: pkg.name,
            dependency: depName,
            declared: depVersion,
            expected: expectedVersion,
          });
        }
      }
    }
  }
}

if (hasErrors) {
  console.error('❌ Internal dependency version mismatches found:\n');
  for (const err of errors) {
    console.error(`  ${err.package}`);
    console.error(`    ${err.dependency}: ${err.declared} (expected ${err.expected})\n`);
  }
  console.error(`\nTotal: ${errors.length} mismatches`);
  console.error('\nThis can happen if you manually changed versions without using changesets.');
  console.error('Run "npm run changeset:version" or fix the dependencies manually.');
  process.exit(1);
} else {
  console.log('✅ All internal dependencies are consistent');
  process.exit(0);
}
