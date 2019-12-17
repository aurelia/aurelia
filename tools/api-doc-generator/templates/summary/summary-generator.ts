import { SourceFileInfo } from '../../Api/models/source-file/source-file-info';
import { SummaryMapInfo } from './summary-map-info';
import * as _ from 'lodash';
import { tab } from '../../utils';
import { sourceFileLocator } from '../../helpers';

function beautifyName(name: string): string {
    if (name.length <= 3) {
        return name.toUpperCase();
    } else {
        return _.startCase(name.replace(/-/g, ' ')).replace(/\s+/g, '');
    }
}

function getPath(path: string): string[] {
    let result: string[] = [];
    if (path.includes('packages') && path.includes('src')) {
        result = path
            .replace(/.*\/packages\//, '')
            .replace('/src', '')
            .replace(/\..*/, '')
            .split('/');
    }
    if (path.includes('packages') && path.includes('@aurelia')) {
        result = path
            .replace(/.*\/@aurelia\//, '')
            .replace('/dist', '')
            .replace(/\..*/, '')
            .split('/');
    }
    return result;
}

function getSummaryMapInfo(sourceFileInfo: SourceFileInfo): SummaryMapInfo[] {
    const result: SummaryMapInfo[] = [];
    if (sourceFileInfo.classes) {
        for (let index = 0; index < sourceFileInfo.classes.length; index++) {
            const element = sourceFileInfo.classes[index];
            const pathInfo = getPath(element.path);
            result.push({
                category: element.typeCategory,
                path: element.path,
                name: element.name || '__default',
                file: pathInfo[pathInfo.length - 1],
                folders: pathInfo.slice(0, -1),
            });
        }
    }
    if (sourceFileInfo.enums) {
        for (let index = 0; index < sourceFileInfo.enums.length; index++) {
            const element = sourceFileInfo.enums[index];
            const pathInfo = getPath(element.path);
            result.push({
                category: element.typeCategory,
                path: element.path,
                name: element.name,
                file: pathInfo[pathInfo.length - 1],
                folders: pathInfo.slice(0, -1),
            });
        }
    }
    if (sourceFileInfo.exportAssignments) {
        for (let index = 0; index < sourceFileInfo.exportAssignments.length; index++) {
            const element = sourceFileInfo.exportAssignments[index];
            const pathInfo = getPath(element.path);
            result.push({
                category: element.typeCategory,
                path: element.path,
                name: '__default',
                file: pathInfo[pathInfo.length - 1],
                folders: pathInfo.slice(0, -1),
            });
        }
    }
    if (sourceFileInfo.functions) {
        for (let index = 0; index < sourceFileInfo.functions.length; index++) {
            const element = sourceFileInfo.functions[index];
            const pathInfo = getPath(element.path);
            result.push({
                category: element.typeCategory,
                path: element.path,
                name: element.name || '__default',
                file: pathInfo[pathInfo.length - 1],
                folders: pathInfo.slice(0, -1),
            });
        }
    }
    if (sourceFileInfo.interfaces) {
        for (let index = 0; index < sourceFileInfo.interfaces.length; index++) {
            const element = sourceFileInfo.interfaces[index];
            const pathInfo = getPath(element.path);
            result.push({
                category: element.typeCategory,
                path: element.path,
                name: element.name,
                file: pathInfo[pathInfo.length - 1],
                folders: pathInfo.slice(0, -1),
            });
        }
    }
    if (sourceFileInfo.typeAliases) {
        for (let index = 0; index < sourceFileInfo.typeAliases.length; index++) {
            const element = sourceFileInfo.typeAliases[index];
            const pathInfo = getPath(element.path);
            result.push({
                category: element.typeCategory,
                path: element.path,
                name: element.name,
                file: pathInfo[pathInfo.length - 1],
                folders: pathInfo.slice(0, -1),
            });
        }
    }
    if (sourceFileInfo.variableStatements) {
        for (let index = 0; index < sourceFileInfo.variableStatements.length; index++) {
            const variableStatement = sourceFileInfo.variableStatements[index];
            if (variableStatement.destructuring) {
                for (let index = 0; index < variableStatement.destructuring.length; index++) {
                    const element = variableStatement.destructuring[index];
                    const pathInfo = getPath(variableStatement.path);
                    result.push({
                        category: element.typeCategory,
                        path: variableStatement.path,
                        name: '__default',
                        file: pathInfo[pathInfo.length - 1],
                        folders: pathInfo.slice(0, -1),
                    });
                }
            }
            if (variableStatement.literals) {
                for (let index = 0; index < variableStatement.literals.length; index++) {
                    const element = variableStatement.literals[index];
                    const pathInfo = getPath(variableStatement.path);
                    result.push({
                        category: element.typeCategory,
                        path: variableStatement.path,
                        name: element.name,
                        file: pathInfo[pathInfo.length - 1],
                        folders: pathInfo.slice(0, -1),
                    });
                }
            }
            if (variableStatement.variables) {
                for (let index = 0; index < variableStatement.variables.length; index++) {
                    const element = variableStatement.variables[index];
                    const pathInfo = getPath(variableStatement.path);
                    result.push({
                        category: element.typeCategory,
                        path: variableStatement.path,
                        name: element.name,
                        file: pathInfo[pathInfo.length - 1],
                        folders: pathInfo.slice(0, -1),
                    });
                }
            }
        }
    }
    return result;
}

export function generateSummary_v1(sourceFileInfo: SourceFileInfo, ...prepend: string[]): string {
    const result: string[] = [];
    prepend = prepend || ['# Table of contents'];
    if (prepend) {
        for (let index = 0; index < prepend.length; index++) {
            result.push(prepend[index]);
        }
    }
    const summaryMapInfo = getSummaryMapInfo(sourceFileInfo);
    const summaryGroup = _(summaryMapInfo)
        .sortBy(
            item => item.folders,
            item => item.category,
        )
        .groupBy(item => item.folders)
        .values()
        .value();
    for (let index = 0; index < summaryGroup.length; index++) {
        const element = summaryGroup[index];
        const parents = element[0].folders;
        const title = beautifyName(parents[parents.length - 1]);
        const root = `${tab(parents.length - 1)}* [${title}]()`;
        result.push(root);
        const catSummaryGroup = _(summaryGroup[index])
            .sortBy(
                item => item.category,
                item => item.file,
            )
            .groupBy(item => item.category)
            .values()
            .value();
        for (let index = 0; index < catSummaryGroup.length; index++) {
            const element = catSummaryGroup[index];
            const category = element[0].category;
            const mid = `${tab(parents.length)}* [${category}]()`;
            result.push(mid);
            for (let index = 0; index < element.length; index++) {
                const item = element[index];
                const filePath = [...parents, category, item.file, item.name].join('/') + '.md';
                const data = `${tab(parents.length + 1)}* [${item.name}](${filePath.toLowerCase()})`;
                result.push(data);
            }
        }
    }
    let output: string[] = [];
    for (let index = 0; index < result.length; index++) {
        const item = result[index];
        const condition = /\(.+\.md\)/g.test(item);
        if (!condition) {
            output.push(item);
        }
        else if (condition && !output.includes(item)) {
            output.push(item);
        }
    }
    return output.join('\n');
}

export function generateSummary(sourceFileInfo: SourceFileInfo, ...prepend: string[]): string {
    const result: string[] = [];
    prepend = prepend || ['# Table of contents'];
    if (prepend) {
        for (let index = 0; index < prepend.length; index++) {
            result.push(prepend[index]);
        }
    }
    const summaryMapInfo = getSummaryMapInfo(sourceFileInfo);
    const summaryGroup = _(summaryMapInfo)
        .sortBy(
            item => item.folders[0],
        )
        .groupBy(item => item.folders[0])
        .values()
        .value();
    for (let i = 0; i < summaryGroup.length; i++) {
        const root = summaryGroup[i];
        result.push(`* ${beautifyName(root[0].folders[0])}(${root[0].folders[0].toLowerCase()}/README.md)`);
        for (let j = 0; j < root.length; j++) {
            const child = root[j];
            const item = `   * ${child.category}(${root[0].folders[0].toLowerCase()}/${child.category.toUpperCase()}.md)`;
            if (!result.includes(item))
                result.push(item);
        }
    }
    const output = result.join('\n');
    return output;
}