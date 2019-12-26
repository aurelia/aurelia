import * as fse from 'fs-extra';
import * as _ from 'lodash';

import { TemplateGenerator } from './configurations';
import { getAureliaSources } from '../helpers/aurelia/aurelia-source-utils';
import { TemplateRendererType } from './renderers/template-renderer';
import { generateSummary } from './summary/summary-generator';
import { TypeCategory, sourceFileLocator } from "../helpers";

export function generateApiDoc(tsconfig: string, destination: string) {
    if (destination && destination.length > 0) {
        if (destination[destination.length - 1] === '/') {
            destination = destination.substring(0, destination.length - 1);
        }
    }
    const source = getAureliaSources(tsconfig);
    const summary = generateSummary(source);
    fse.outputFile(`${destination}/SUMMARY.md`, summary);
    if (source.classes) {
        const classRenderer = TemplateGenerator.getRenderer(TemplateRendererType.Class);
        for (let index = 0; index < source.classes.length; index++) {
            const item = source.classes[index];
            const url = sourceFileLocator(item.path, (item.name ?? '__default'), TypeCategory.Class, '', '.md');
            const template = classRenderer.render(item);
            const path = destination + url.toLowerCase();
            fse.outputFileSync(path, template);
        }
    }
    if (source.enums) {
        const enumRenderer = TemplateGenerator.getRenderer(TemplateRendererType.Enum);
        for (let index = 0; index < source.enums.length; index++) {
            const item = source.enums[index];
            const url = sourceFileLocator(item.path, item.name, TypeCategory.Enum, '', '.md');
            const template = enumRenderer.render(item);
            const path = destination + url.toLowerCase();
            fse.outputFileSync(path, template);
        }
    }
    if (source.exportAssignments) {
        const exportAssignmentRenderer = TemplateGenerator.getRenderer(TemplateRendererType.ExportAssignment);
        for (let index = 0; index < source.exportAssignments.length; index++) {
            const item = source.exportAssignments[index];
            const url = sourceFileLocator(item.path, '__default', TypeCategory.ExportAssignment, '', '.md');
            const template = exportAssignmentRenderer.render(item);
            const path = destination + url.toLowerCase();
            fse.outputFileSync(path, template);
        }
    }
    if (source.functions) {
        const functionRenderer = TemplateGenerator.getRenderer(TemplateRendererType.Function);
        for (let index = 0; index < source.functions.length; index++) {
            const item = source.functions[index];
            const url = sourceFileLocator(item.path, (item.name ?? '__default'), TypeCategory.Function, '', '.md');
            const template = functionRenderer.render(item);
            const path = destination + url.toLowerCase();
            fse.outputFileSync(path, template);
        }
    }
    if (source.interfaces) {
        const interfaceRenderer = TemplateGenerator.getRenderer(TemplateRendererType.Interface);
        for (let index = 0; index < source.interfaces.length; index++) {
            const item = source.interfaces[index];
            const url = sourceFileLocator(item.path, item.name, TypeCategory.Interface, '', '.md');
            const template = interfaceRenderer.render(item);
            const path = destination + url.toLowerCase();
            fse.outputFileSync(path, template);
        }
    }
    if (source.typeAliases) {
        const typeAliasRenderer = TemplateGenerator.getRenderer(TemplateRendererType.TypeAlias);
        for (let index = 0; index < source.typeAliases.length; index++) {
            const item = source.typeAliases[index];
            const url = sourceFileLocator(item.path, item.name, TypeCategory.TypeAlias, '', '.md');
            const template = typeAliasRenderer.render(item);
            const path = destination + url.toLowerCase();
            fse.outputFileSync(path, template);
        }
    }
    if (source.variableStatements) {
        const variableStatementRenderer = TemplateGenerator.getRenderer(TemplateRendererType.VariableStatement);
        for (let index = 0; index < source.variableStatements.length; index++) {
            const item = source.variableStatements[index];
            if (item.variables) {
                for (let i = 0; i < item.variables.length; i++) {
                    const variable = item.variables[i];
                    const url = sourceFileLocator(item.path, variable.name, TypeCategory.Variable, '', '.md');
                    const template = variableStatementRenderer.render(item);
                    const path = destination + url.toLowerCase();
                    fse.outputFileSync(path, template);
                }
            }
            if (item.literals) {
                for (let j = 0; j < item.literals.length; j++) {
                    const literal = item.literals[j];
                    const url = sourceFileLocator(item.path, literal.name, TypeCategory.Literal, '', '.md');
                    const template = variableStatementRenderer.render(item);
                    const path = destination + url.toLowerCase();
                    fse.outputFileSync(path, template);
                }
            }
            if (item.destructuring) {
                for (let k = 0; k < item.destructuring.length; k++) {
                    // const destructure = item.destructuring[k];
                    const url = sourceFileLocator(item.path, '__default', TypeCategory.Destructuring, '', '.md');
                    const template = variableStatementRenderer.render(item);
                    const path = destination + url.toLowerCase();
                    fse.outputFileSync(path, template);
                }
            }
        }
    }
}