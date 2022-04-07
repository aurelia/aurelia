/* eslint-disable */
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const package_json_1 = require("./package.json");
const project_1 = __importDefault(require("./project"));
const child_process_1 = require("child_process");
const path_1 = require("path");
(async function () {
    const [, , channel /* dev or latest */] = process.argv;
    for (const { name, folder } of project_1.default.packages
        .filter(p => !p.name.kebab.includes('_')
        && p.folder.includes('packages'))) {
        console.log(`publishing [${channel}] ${path_1.join(folder, name.kebab)}`);
        const pkg = await package_json_1.loadPackageJson(folder, name.kebab);
        if (pkg.private) {
            continue;
        }
        child_process_1.execSync(`cd ${path_1.join(folder, name.kebab)} && npm run publish:${channel}`);
    }
    console.log('Done.');
})().catch(err => {
    console.error(err);
    process.exit(1);
});
