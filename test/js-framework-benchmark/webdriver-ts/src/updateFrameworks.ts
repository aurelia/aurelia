import * as path from 'path';
import * as semver from 'semver';
import * as yargs from 'yargs';
import {
  loadFrameworkVersionInformation,
  determineInstalledVersions,
  FrameworkVersionInformationStatic,
  FrameworkVersionInformationDynamic,
  FrameworkVersionInformationError,
  PackageVersionInformation,
  PackageVersionInformationValid,
  PackageVersionInformationErrorUnknownPackage,
  PackageVersionInformationErrorNoPackageJSONLock,
  PackageVersionInformationResult
} from './common';
const ncu = require('npm-check-updates');
const exec = require('child_process').execSync;

const args = yargs(process.argv)
  .usage("$0 --updade true|false --dir")
  .default('update', 'true')
  .array('dir')
  .boolean('update').argv;

const updatePackages = args.update;
console.log("ARGS", args._.slice(2, args._.length));
const directories = args._.slice(2, args._.length);
const checkDirectory = (keyedType: string, folderName: string) => directories.length===0 || args._.some(a => path.join(keyedType, folderName).startsWith(a));

async function ncuReportsUpdatedVersion(packageVersionInfo: PackageVersionInformationResult) {
  const ncuInfo = await ncu.run({
    packageFile: path.resolve('..', 'frameworks', packageVersionInfo.framework.keyedType, packageVersionInfo.framework.directory, 'package.json'),
    silent: true,
    jsonUpgraded: true,
    loglevel: 'silent'
  });
  if (ncuInfo) {
    // console.log(ncuInfo);
    return packageVersionInfo.versions.filter((pi: PackageVersionInformationValid) => ncuInfo[pi.packageName])
      .some((pi: PackageVersionInformationValid) => {
        let newVersion = ncuInfo[pi.packageName];
        if (newVersion.startsWith('^')) newVersion = newVersion.substring(1);
        if (newVersion.startsWith('~')) newVersion = newVersion.substring(1);
        if (newVersion) {
          return !semver.satisfies(newVersion, `~${pi.version}`);
        } else {
          return false;
        }
      });
  } else {
    return false;
  }
}

async function ncuRunUpdate(packageVersionInfo: PackageVersionInformationResult) {
  console.log(`Update ${packageVersionInfo.framework.keyedType}/${packageVersionInfo.framework.directory}`);
  await ncu.run({
    packageFile: path.resolve('..', 'frameworks', packageVersionInfo.framework.keyedType, packageVersionInfo.framework.directory, 'package.json'),
    upgrade: true
  });
}

async function main() {

  const frameworkVersionInformations = loadFrameworkVersionInformation();

  const errors = frameworkVersionInformations.filter(frameworkVersionInformation => frameworkVersionInformation instanceof FrameworkVersionInformationError);

  if (errors.length > 0) {
    console.log("ERROR: The following frameworks do not include valid version info and must be fixed");
    console.log(`${errors.map(val => `${val.keyedType}/${val.directory}`).join('\n')}\n`);
  }

  const manually = frameworkVersionInformations.filter(frameworkVersionInformation => frameworkVersionInformation instanceof FrameworkVersionInformationStatic);

  if (manually.length > 0) {
    console.log("WARNING: The following frameworks must be updated manually: ");
    console.log(`${manually.map(val => `${val.keyedType}/${val.directory}`).join('\n')}\n`);
  }

  const automatically = frameworkVersionInformations
    .filter(frameworkVersionInformation => frameworkVersionInformation instanceof FrameworkVersionInformationDynamic)
    .map(frameworkVersionInformation => frameworkVersionInformation as FrameworkVersionInformationDynamic);

  const packageLockInformations: PackageVersionInformationResult[] = await Promise.all(automatically.map(frameworkVersionInformation => determineInstalledVersions(frameworkVersionInformation)));

  const noPackageLock = packageLockInformations.filter(pli => pli.versions.some((packageVersionInfo: PackageVersionInformation) => packageVersionInfo instanceof PackageVersionInformationErrorNoPackageJSONLock));

  if (noPackageLock.length > 0) {
    console.log("WARNING: The following frameworks do not yet have a package-lock.json file (maybe you must 'npm install' it): ");
    console.log(`${noPackageLock.map(val => `${val.framework.keyedType}/${val.framework.directory}`).join('\n')  }\n`);
  }

  const unknownPackages = packageLockInformations.filter(pli => pli.versions.some((packageVersionInfo: PackageVersionInformation) => packageVersionInfo instanceof PackageVersionInformationErrorUnknownPackage));

  if (unknownPackages.length > 0) {
    console.log("WARNING: The following frameworks do not have a version for the specified packages in package-lock.json file (maybe you misspelled the package name): ");
    const unknownPackagesStr = (packageVersionInfo: PackageVersionInformationResult) => packageVersionInfo.versions.filter(pvi => pvi instanceof PackageVersionInformationErrorUnknownPackage).
      map((packageVersionInfo: PackageVersionInformationErrorUnknownPackage) => packageVersionInfo.packageName).join(', ');

    // console.log(unknownPackages.map(val => val.framework.keyedType +'/' + val.framework.directory + ' for package ' + unknownPackagesStr(val)).join('\n') + '\n');
  }

  const checkVersionsFor = packageLockInformations
    .filter(pli => pli.versions.every((packageVersionInfo: PackageVersionInformation) => packageVersionInfo instanceof PackageVersionInformationValid))
    .filter(f => checkDirectory(f.framework.keyedType,f.framework.directory));

  console.log("checkVersionsFor", checkVersionsFor.map(v => v.getFrameworkData().uri));

  const toBeUpdated = new Array<PackageVersionInformationResult>();
  for (const f of checkVersionsFor) {
    if (await ncuReportsUpdatedVersion(f)) toBeUpdated.push(f);
  }
  console.log("The following frameworks can be updated");

  if (toBeUpdated.length > 0) {
    console.log(`${toBeUpdated.map(val => `${val.framework.keyedType}/${val.framework.directory}`).join('\n')}\n`);

    if (updatePackages) {
      let rebuild = "";
      for (const val of toBeUpdated) {
        console.log(`ACTION: Updating package.json for ${val.framework.keyedType}/${val.framework.directory}`);
        await ncuRunUpdate(val);
        const prefix = `${val.framework.keyedType}/${val.framework.directory}`;
        rebuild = `${rebuild}'${prefix}' `;
      }
      console.log("\nTODO: Rebuilding is required:");

      console.log(`npm run rebuild -- ${rebuild}`);
      exec(`npm run rebuild -- ${rebuild}`, {
        stdio: 'inherit'
      });

    }
  }
}

main()
  .then(text => {
  })
  .catch(err => {
    console.log('error', err);
  });

