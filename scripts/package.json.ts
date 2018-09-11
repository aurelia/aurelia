import { join } from 'path';
import { readFile, writeFile } from 'fs';
import project from './project';

export interface Package {
  author?: PersonObject | string;
  bin?:    { [key: string]: string } | string;
  /**
   * The url to your project's issue tracker and / or the email address to which issues should
   * be reported. These are helpful for people who encounter issues with your package.
   */
  bugs?: BugsObject | string;
  /**
   * A 'config' hash can be used to set configuration parameters used in package scripts that
   * persist across upgrades.
   */
  config?: { [key: string]: any };
  /**
   * A list of people who contributed to this package.
   */
  contributors?: Array<PersonObject | string>;
  /**
   * If your code only runs on certain cpu architectures, you can specify which ones.
   */
  cpu?:          string[];
  dependencies?: { [key: string]: string };
  /**
   * This helps people discover your package, as it's listed in 'npm search'.
   */
  description?:     string;
  devDependencies?: { [key: string]: string };
  directories?:     Directories;
  dist?:            Dist;
  engines?:         { [key: string]: string };
  engineStrict?:    boolean;
  /**
   * A module ID with untranspiled code that is the primary entry point to your program.
   */
  esnext?: EsnextObject | string;
  /**
   * The 'files' field is an array of files to include in your project. If you name a folder
   * in the array, then it will also include the files inside that folder.
   */
  files?: string[];
  /**
   * The url to the project homepage.
   */
  homepage?: string;
  /**
   * This helps people discover your package as it's listed in 'npm search'.
   */
  keywords?: string[];
  /**
   * You should specify a license for your package so that people know how they are permitted
   * to use it, and any restrictions you're placing on it.
   */
  license?: string;
  /**
   * You should specify a license for your package so that people know how they are permitted
   * to use it, and any restrictions you're placing on it.
   */
  licenses?: License[];
  /**
   * The main field is a module ID that is the primary entry point to your program.
   */
  main?: string;
  /**
   * A list of people who maintains this package.
   */
  maintainers?: Array<PersonObject | string>;
  /**
   * Specify either a single file or an array of filenames to put in place for the man program
   * to find.
   */
  man?: string[] | string;
  /**
   * An ECMAScript module ID that is the primary entry point to your program.
   */
  module?: string;
  /**
   * The name of the package.
   */
  name?:                 string;
  optionalDependencies?: { [key: string]: string };
  /**
   * You can specify which operating systems your module will run on
   */
  os?:               string[];
  peerDependencies?: { [key: string]: string };
  /**
   * If your package is primarily a command-line application that should be installed
   * globally, then set this value to true to provide a warning if it is installed locally.
   */
  preferGlobal?: boolean;
  /**
   * If set to true, then npm will refuse to publish it.
   */
  private?:       boolean;
  publishConfig?: { [key: string]: any };
  readme?:        string;
  /**
   * Specify the place where your code lives. This is helpful for people who want to
   * contribute.
   */
  repository?: RepositoryObject | string;
  /**
   * The 'scripts' member is an object hash of script commands that are run at various times
   * in the lifecycle of your package. The key is the lifecycle event, and the value is the
   * command to run at that point.
   */
  scripts?: Scripts;
  /**
   * Version must be parseable by node-semver, which is bundled with npm as a dependency.
   */
  version?:             string;
  jspm?:                CoreProperties;
  bundleDependencies?:  string[];
  bundledDependencies?: string[];
}

export interface PersonObject {
  email?: string;
  name:   string;
  url?:   string;
}

export interface BugsObject {
  /**
   * The email address to which issues should be reported.
   */
  email?: string;
  /**
   * The url to your project's issue tracker.
   */
  url?: string;
}

export interface Directories {
  /**
   * If you specify a 'bin' directory, then all the files in that folder will be used as the
   * 'bin' hash.
   */
  bin?: string;
  /**
   * Put markdown files in here. Eventually, these will be displayed nicely, maybe, someday.
   */
  doc?: string;
  /**
   * Put example scripts in here. Someday, it might be exposed in some clever way.
   */
  example?: string;
  /**
   * Tell people where the bulk of your library is. Nothing special is done with the lib
   * folder in any way, but it's useful meta info.
   */
  lib?: string;
  /**
   * A folder that is full of man pages. Sugar to generate a 'man' array by walking the folder.
   */
  man?:  string;
  test?: string;
}

export interface Dist {
  shasum?:  string;
  tarball?: string;
}

export interface EsnextObject {
  browser?: string;
  main?:    string;
}

export interface CoreProperties {
  author?: PersonObject | string;
  bin?:    { [key: string]: string } | string;
  /**
   * The url to your project's issue tracker and / or the email address to which issues should
   * be reported. These are helpful for people who encounter issues with your package.
   */
  bugs?: BugsObject | string;
  /**
   * A 'config' hash can be used to set configuration parameters used in package scripts that
   * persist across upgrades.
   */
  config?: { [key: string]: any };
  /**
   * A list of people who contributed to this package.
   */
  contributors?: Array<PersonObject | string>;
  /**
   * If your code only runs on certain cpu architectures, you can specify which ones.
   */
  cpu?:          string[];
  dependencies?: { [key: string]: string };
  /**
   * This helps people discover your package, as it's listed in 'npm search'.
   */
  description?:     string;
  devDependencies?: { [key: string]: string };
  directories?:     Directories;
  dist?:            Dist;
  engines?:         { [key: string]: string };
  engineStrict?:    boolean;
  /**
   * A module ID with untranspiled code that is the primary entry point to your program.
   */
  esnext?: EsnextObject | string;
  /**
   * The 'files' field is an array of files to include in your project. If you name a folder
   * in the array, then it will also include the files inside that folder.
   */
  files?: string[];
  /**
   * The url to the project homepage.
   */
  homepage?: string;
  /**
   * This helps people discover your package as it's listed in 'npm search'.
   */
  keywords?: string[];
  /**
   * You should specify a license for your package so that people know how they are permitted
   * to use it, and any restrictions you're placing on it.
   */
  license?: string;
  /**
   * You should specify a license for your package so that people know how they are permitted
   * to use it, and any restrictions you're placing on it.
   */
  licenses?: License[];
  /**
   * The main field is a module ID that is the primary entry point to your program.
   */
  main?: string;
  /**
   * A list of people who maintains this package.
   */
  maintainers?: Array<PersonObject | string>;
  /**
   * Specify either a single file or an array of filenames to put in place for the man program
   * to find.
   */
  man?: string[] | string;
  /**
   * An ECMAScript module ID that is the primary entry point to your program.
   */
  module?: string;
  /**
   * The name of the package.
   */
  name?:                 string;
  optionalDependencies?: { [key: string]: string };
  /**
   * You can specify which operating systems your module will run on
   */
  os?:               string[];
  peerDependencies?: { [key: string]: string };
  /**
   * If your package is primarily a command-line application that should be installed
   * globally, then set this value to true to provide a warning if it is installed locally.
   */
  preferGlobal?: boolean;
  /**
   * If set to true, then npm will refuse to publish it.
   */
  private?:       boolean;
  publishConfig?: { [key: string]: any };
  readme?:        string;
  /**
   * Specify the place where your code lives. This is helpful for people who want to
   * contribute.
   */
  repository?: RepositoryObject | string;
  /**
   * The 'scripts' member is an object hash of script commands that are run at various times
   * in the lifecycle of your package. The key is the lifecycle event, and the value is the
   * command to run at that point.
   */
  scripts?: Scripts;
  /**
   * Version must be parseable by node-semver, which is bundled with npm as a dependency.
   */
  version?: string;
}

export interface License {
  type?: string;
  url?:  string;
}

export interface RepositoryObject {
  type?: string;
  url?:  string;
}

/**
* The 'scripts' member is an object hash of script commands that are run at various times
* in the lifecycle of your package. The key is the lifecycle event, and the value is the
* command to run at that point.
*/
export interface Scripts {
  install?:     string;
  postinstall?: string;
  postpublish?: string;
  postrestart?: string;
  poststart?:   string;
  poststop?:    string;
  posttest?:    string;
  /**
   * Run AFTER the package is uninstalled
   */
  postuninstall?: string;
  /**
   * Run AFTER bump the package version
   */
  postversion?: string;
  /**
   * Run BEFORE the package is installed
   */
  preinstall?: string;
  /**
   * Run BEFORE the package is published (Also run on local npm install without any arguments)
   */
  prepublish?:   string;
  prerestart?:   string;
  prestart?:     string;
  prestop?:      string;
  pretest?:      string;
  preuninstall?: string;
  preversion?:   string;
  publish?:      string;
  restart?:      string;
  start?:        string;
  stop?:         string;
  test?:         string;
  uninstall?:    string;
  version?:      string;
}

/**
 * Reads and parses the content of a package.json file
 *
 * @param pathSegments The path segments of the folder where the package.json is located, relative to the root of the project
 */
export async function loadPackageJson(...pathSegments: string[]): Promise<Package> {
  const path = join(project.path, ...pathSegments, 'package.json');
  return new Promise((resolve, reject) => {
    readFile(path, (err, data) => {
      if (err) {
        reject(err);
      }
      const str = data.toString('utf8');
      const json = JSON.parse(str);
      resolve(json);
    })
  });
}

/**
 * Stringifies and writes out the content of a package.json file
 *
 * @param pkg The package.json as an object
 * @param pathSegments The path segments of the folder where the package.json is located, relative to the root of the project
 */
export async function savePackageJson(pkg: Package, ...pathSegments: string[]): Promise<any> {
  const path = join(project.path, ...pathSegments, 'package.json');
  return new Promise((resolve, reject) => {
    const str = JSON.stringify(pkg, null, 2);
    writeFile(path, str, { encoding: 'utf8' }, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}
