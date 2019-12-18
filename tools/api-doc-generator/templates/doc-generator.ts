import * as fse from 'fs-extra';
import * as _ from 'lodash';

import { TemplateGenerator } from './configurations';
import { getAureliaSources } from '../helpers/aurelia/aurelia-source-utils';
import { TemplateRendererType } from './renderers/template-renderer';
import { generateSummary } from './summary/summary-generator';

import { TypeCategory } from "../helpers";
import { getSourcePathFolders } from '../helpers/get-source-path-folders';
/* eslint-disable */
const markdownTable = require('markdown-table')
/* eslint-disable */
interface TableOfContent {
    package: string;
    name: string;
    url: string;
    link: string;
    category: TypeCategory;
}

export function generateApiDoc(tsconfig: string, destination: string) {
    if (destination && destination.length > 0) {
        if (destination[destination.length - 1] === '/') {
            destination = destination.substring(0, destination.length - 1);
        }
    }
    let toc: TableOfContent[] = [];
    const source = getAureliaSources(tsconfig);
    const summary = generateSummary(source);
    fse.outputFile(`${destination}/SUMMARY.md`, summary);
    if (source.classes) {
        const classRenderer = TemplateGenerator.getRenderer(TemplateRendererType.Class);
        let templates: string[] = [];
        const groupedClass = _(source.classes)
            .sortBy(item => getSourcePathFolders(item.path)[0])
            .groupBy(item => getSourcePathFolders(item.path)[0])
            .values()
            .value();
        for (let i = 0; i < groupedClass.length; i++) {
            templates = [];
            const classes = groupedClass[i];
            for (let j = 0; j < classes.length; j++) {
                const item = classes[j];
                const pkg = getSourcePathFolders(item.path)[0];
                const template = classRenderer.render(item);
                if (!templates.includes(template)) {
                    toc.push({
                        package: pkg,
                        name: item.name || '__default',
                        url: '',
                        link: `[${item.name || '__default'}]()`,
                        category: TypeCategory.Class
                    });
                    templates.push(template);
                }
            }
            const pkgName = getSourcePathFolders(classes[0].path)[0].toLowerCase();
            const path = `${destination}/${pkgName}/${TypeCategory.Class.toUpperCase()}.md`;
            fse.outputFileSync(path, templates.join('\n\n'));
        }
    }
    if (source.enums) {
        const enumRenderer = TemplateGenerator.getRenderer(TemplateRendererType.Enum);
        let templates: string[] = [];
        const groupedEnum = _(source.enums)
            .sortBy(item => getSourcePathFolders(item.path)[0])
            .groupBy(item => getSourcePathFolders(item.path)[0])
            .values()
            .value();
        for (let i = 0; i < groupedEnum.length; i++) {
            templates = [];
            const enums = groupedEnum[i];
            for (let j = 0; j < enums.length; j++) {
                const item = enums[j];
                const pkg = getSourcePathFolders(item.path)[0];
                const template = enumRenderer.render(item);
                if (!templates.includes(template)) {
                    toc.push({
                        package: pkg,
                        name: item.name || '__default',
                        url: '',
                        link: `[${item.name || '__default'}]()`,
                        category: TypeCategory.Enum
                    });
                    templates.push(template);
                }
            }
            const pkgName = getSourcePathFolders(enums[0].path)[0].toLowerCase();
            const path = `${destination}/${pkgName}/${TypeCategory.Enum.toUpperCase()}.md`;
            fse.outputFileSync(path, templates.join('\n\n'));
        }
    }
    if (source.exportAssignments) {
        const exportAssignmentRenderer = TemplateGenerator.getRenderer(TemplateRendererType.ExportAssignment);
        let templates: string[] = [];
        const groupedExportAssignments = _(source.exportAssignments)
            .sortBy(item => getSourcePathFolders(item.path)[0])
            .groupBy(item => getSourcePathFolders(item.path)[0])
            .values()
            .value();
        for (let i = 0; i < groupedExportAssignments.length; i++) {
            templates = [];
            const exp = groupedExportAssignments[i];
            for (let j = 0; j < exp.length; j++) {
                const item = exp[j];
                const pkg = getSourcePathFolders(item.path)[0];
                const template = exportAssignmentRenderer.render(item);
                if (!templates.includes(template)) {
                    toc.push({
                        package: pkg,
                        name: '__default',
                        url: '',
                        link: `[__default]()`,
                        category: TypeCategory.ExportAssignment
                    });
                    templates.push(template);
                }
            }
            const pkgName = getSourcePathFolders(exp[0].path)[0].toLowerCase();
            const path = `${destination}/${pkgName}/${TypeCategory.ExportAssignment.toUpperCase()}.md`;
            fse.outputFileSync(path, templates.join('\n\n'));
        }
    }
    if (source.functions) {
        const functionRenderer = TemplateGenerator.getRenderer(TemplateRendererType.Function);
        let templates: string[] = [];
        const groupedFunctions = _(source.functions)
            .sortBy(item => getSourcePathFolders(item.path)[0])
            .groupBy(item => getSourcePathFolders(item.path)[0])
            .values()
            .value();
        for (let i = 0; i < groupedFunctions.length; i++) {
            templates = [];
            const funcs = groupedFunctions[i];
            for (let j = 0; j < funcs.length; j++) {
                const item = funcs[j];
                const pkg = getSourcePathFolders(item.path)[0];
                const template = functionRenderer.render(item);
                if (!templates.includes(template)) {
                    toc.push({
                        package: pkg,
                        name: item.name || '__default',
                        url: '',
                        link: `[${item.name || '__default'}]()`,
                        category: TypeCategory.Function
                    });
                    templates.push(template);
                }
            }
            const pkgName = getSourcePathFolders(funcs[0].path)[0].toLowerCase();
            const path = `${destination}/${pkgName}/${TypeCategory.Function.toUpperCase()}.md`;
            fse.outputFileSync(path, templates.join('\n\n'));
        }
    }
    if (source.interfaces) {
        const interfaceRenderer = TemplateGenerator.getRenderer(TemplateRendererType.Interface);
        let templates: string[] = [];
        const groupedInterfaces = _(source.interfaces)
            .sortBy(item => getSourcePathFolders(item.path)[0])
            .groupBy(item => getSourcePathFolders(item.path)[0])
            .values()
            .value();
        for (let i = 0; i < groupedInterfaces.length; i++) {
            templates = [];
            const interfaces = groupedInterfaces[i];
            for (let j = 0; j < interfaces.length; j++) {
                const item = interfaces[j];
                const pkg = getSourcePathFolders(item.path)[0];
                const template = interfaceRenderer.render(item);
                if (!templates.includes(template)) {
                    toc.push({
                        package: pkg,
                        name: item.name || '__default',
                        url: '',
                        link: `[${item.name || '__default'}]()`,
                        category: TypeCategory.Interface
                    });
                    templates.push(template);
                }
            }
            const pkgName = getSourcePathFolders(interfaces[0].path)[0].toLowerCase();
            const path = `${destination}/${pkgName}/${TypeCategory.Interface.toUpperCase()}.md`;
            fse.outputFileSync(path, templates.join('\n\n'));
        }
    }
    if (source.typeAliases) {
        const typeAliasRenderer = TemplateGenerator.getRenderer(TemplateRendererType.TypeAlias);
        let templates: string[] = [];
        const groupedTypeAliases = _(source.typeAliases)
            .sortBy(item => getSourcePathFolders(item.path)[0])
            .groupBy(item => getSourcePathFolders(item.path)[0])
            .values()
            .value();
        for (let i = 0; i < groupedTypeAliases.length; i++) {
            templates = [];
            const typeAliases = groupedTypeAliases[i];
            for (let j = 0; j < typeAliases.length; j++) {
                const item = typeAliases[j];
                const pkg = getSourcePathFolders(item.path)[0];
                const template = typeAliasRenderer.render(item);
                if (!templates.includes(template)) {
                    toc.push({
                        package: pkg,
                        name: item.name || '__default',
                        url: '',
                        link: `[${item.name || '__default'}]()`,
                        category: TypeCategory.TypeAlias
                    });
                    templates.push(template);
                }
            }
            const pkgName = getSourcePathFolders(typeAliases[0].path)[0].toLowerCase();
            const path = `${destination}/${pkgName}/${TypeCategory.TypeAlias.toUpperCase()}.md`;
            fse.outputFileSync(path, templates.join('\n\n'));
        }
    }
    if (source.variableStatements) {
        const variableStatementRenderer = TemplateGenerator.getRenderer(TemplateRendererType.VariableStatement);
        for (let index = 0; index < source.variableStatements.length; index++) {
            const item = source.variableStatements[index];
            const p = item.path;
            if (item.variables) {
                let templates: string[] = [];
                const groupedVariables = _(item.variables)
                    .sortBy(x => getSourcePathFolders(item.path)[0])
                    .groupBy(x => getSourcePathFolders(item.path)[0])
                    .values()
                    .value();
                for (let i = 0; i < groupedVariables.length; i++) {
                    templates = [];
                    const variable = groupedVariables[i];
                    for (let j = 0; j < variable.length; j++) {
                        const item = variable[j];
                        const pkg = getSourcePathFolders(p)[0];
                        const template = variableStatementRenderer.render(item);
                        if (!templates.includes(template)) {
                            toc.push({
                                package: pkg,
                                name: item.name || '__default',
                                url: '',
                                link: `[${item.name || '__default'}]()`,
                                category: TypeCategory.Variable
                            });
                            templates.push(template);
                        }
                    }
                    const pkgName = getSourcePathFolders(item.path)[0].toLowerCase();
                    const path = `${destination}/${pkgName}/${TypeCategory.Variable.toUpperCase()}.md`;
                    fse.outputFileSync(path, templates.join('\n\n'));
                }
            }
            if (item.literals) {
                let templates: string[] = [];
                const groupedLiterals = _(item.literals)
                    .sortBy(x => getSourcePathFolders(item.path)[0])
                    .groupBy(x => getSourcePathFolders(item.path)[0])
                    .values()
                    .value();
                for (let i = 0; i < groupedLiterals.length; i++) {
                    templates = [];
                    const lit = groupedLiterals[i];
                    for (let j = 0; j < lit.length; j++) {
                        const item = lit[j];
                        const pkg = getSourcePathFolders(p)[0];
                        const template = variableStatementRenderer.render(item);
                        if (!templates.includes(template)) {
                            toc.push({
                                package: pkg,
                                name: item.name || '__default',
                                url: '',
                                link: `[${item.name || '__default'}]()`,
                                category: TypeCategory.Literal
                            });
                            templates.push(template);
                        }
                    }
                    const pkgName = getSourcePathFolders(item.path)[0].toLowerCase();
                    const path = `${destination}/${pkgName}/${TypeCategory.Literal.toUpperCase()}.md`;
                    fse.outputFileSync(path, templates.join('\n\n'));
                }
            }
            if (item.destructuring) {
                let templates: string[] = [];
                const groupedDestructuring = _(item.destructuring)
                    .sortBy(x => getSourcePathFolders(item.path)[0])
                    .groupBy(x => getSourcePathFolders(item.path)[0])
                    .values()
                    .value();
                for (let i = 0; i < groupedDestructuring.length; i++) {
                    templates = [];
                    const destructuring = groupedDestructuring[i];
                    for (let j = 0; j < destructuring.length; j++) {
                        const item = destructuring[j];
                        const pkg = getSourcePathFolders(p)[0];
                        const template = variableStatementRenderer.render(item);
                        if (!templates.includes(template)) {
                            toc.push({
                                package: pkg,
                                name: '__default',
                                url: '',
                                link: `['__default']()`,
                                category: TypeCategory.Destructuring
                            });
                            templates.push(template);
                        }
                    }
                    const pkgName = getSourcePathFolders(item.path)[0].toLowerCase();
                    const path = `${destination}/${pkgName}/${TypeCategory.Destructuring.toUpperCase()}.md`;
                    fse.outputFileSync(path, templates.join('\n\n'));
                }
            }
        }
    }
    const tocGrouped = _(toc)
        .groupBy(x => x.package)
        .values()
        .value()
        ;

    for (let index = 0; index < tocGrouped.length; index++) {
        const table = tocGrouped[index];
        const pkgName = table[0].package.toLowerCase();
        const path = `${destination}/${pkgName}/README.md`;
        const tCatGrouped = _(table)
            .sortBy(x => [x.category, x.name])
            .groupBy(x => x.category)
            .values()
            .value()
            ;
        let list: string[] = [];
        let template: string[] = [];
        for (let j = 0; j < tCatGrouped.length; j++) {
            const threshold = 4;
            const t = tCatGrouped[j];
            const cat = t[0].category;
            template.push(`# ${cat}`);
            template.push("\n\n");
            const empty = new Array(threshold);
            const l = _.chunk(empty.concat(t.map(x => x.link)), threshold);
            const result = markdownTable(l);
            template.push(result);
            template.push("\n\n");
            list.push(template.join(''));
            template = [];
        }
        const result = list.join('\n\n');
        fse.outputFileSync(path, result);
    }
}

