import {
    SourceFile,
    SyntaxKind,
    ClassDeclaration,
    EnumDeclaration,
    FunctionDeclaration,
    TypeAliasDeclaration,
    InterfaceDeclaration,
    VariableStatement,
    VariableDeclaration,
    TypeGuards,
} from 'ts-morph';
import { TypescriptCommentExtractor, ITypescriptCommentExtractor } from '../comment/ts-comment-extractor';
import { CommentInfo } from '../../models/comment/comment-info';
import { SourceFileInfo } from '../../models/source-file/source-file-info';
import { ClassExtractor, IClassExtractor } from '../class/class-extractor';
import { EnumExtractor, IEnumExtractor } from '../enum/enum-extractor';
import { FunctionExtractor, IFunctionExtractor } from '../function/function-extractor';
import { TypeAliasExtractor, ITypeAliasExtractor } from '../type-alias/type-alias-extractor';
import { InterfaceExtractor, IInterfaceExtractor } from '../interface/interface-extractor';
import {
    VariableStatementExtractor,
    IVariableStatementExtractor,
} from '../variable-statement/variable-statement-extractor';
import {
    ExportAssignmentExtractor,
    IExportAssignmentExtractor,
} from '../export-assignment/export-assignment-extractor';
import { ApiConfiguration as extractorConfiguration } from '../../configurations';
import { ISourceFileIgnoreDeclarations } from '../../configurations/configuration';

export interface ISourceFileExtractor {
    extract(sourceFile: SourceFile, ignoreFilters?: ISourceFileIgnoreDeclarations): SourceFileInfo;
    extractAll(sourceFiles: SourceFile[], ignoreFilters?: ISourceFileIgnoreDeclarations): SourceFileInfo;
}

export class SourceFileExtractor implements ISourceFileExtractor {
    constructor(
        private tsCommentExtractor: ITypescriptCommentExtractor = new TypescriptCommentExtractor(),
        private classExtractor: IClassExtractor = new ClassExtractor(),
        private enumExtractor: IEnumExtractor = new EnumExtractor(),
        private functionExtractor: IFunctionExtractor = new FunctionExtractor(),
        private typeAliasExtractor: ITypeAliasExtractor = new TypeAliasExtractor(),
        private interfaceExtractor: IInterfaceExtractor = new InterfaceExtractor(),
        private variableStatementExtractor: IVariableStatementExtractor = new VariableStatementExtractor(),
        private exportAssignmentExtractor: IExportAssignmentExtractor = new ExportAssignmentExtractor(),
    ) {}
    public extract(sourceFile: SourceFile, ignoreFilters?: ISourceFileIgnoreDeclarations): SourceFileInfo {
        let exportAssignments = this.exportAssignmentExtractor.extract(sourceFile);

        if (ignoreFilters?.export || extractorConfiguration.source?.ignore.export) {
            const ignoreMethod = ignoreFilters?.export || extractorConfiguration.source?.ignore.export;
            /* eslint-disable */
            exportAssignments = exportAssignments?.filter(ex => !ignoreMethod!(ex));
            /* eslint-disable */
        }

        const result: SourceFileInfo = {
            classes: void 0,
            enums: void 0,
            functions: void 0,
            typeAliases: void 0,
            interfaces: void 0,
            variableStatements: void 0,
            exportAssignments: exportAssignments && exportAssignments.length > 0 ? exportAssignments : void 0,
            isDeclarationFile: sourceFile.isDeclarationFile(),
            isFromExternalLibrary: sourceFile.isFromExternalLibrary(),
            isInNodeModules: sourceFile.isInNodeModules(),
        };
        const exportedDeclarations = sourceFile.getExportedDeclarations();
        /* eslint-disable */
        for (const [name, declarations] of exportedDeclarations) {
            /* eslint-disable */
            declarations.forEach(declaration => {
                const comment = this.tsCommentExtractor.extract(declaration);
                let status = comment ? this.hasInternalTag(comment) : false;
                let ignoreDeclaration = false;
                if (!status) {
                    switch (declaration.getKind()) {
                        case SyntaxKind.ClassDeclaration:
                            const classNode = declaration as ClassDeclaration;
                            let cls = this.classExtractor.extract(classNode);
                            if (!result.classes) {
                                result.classes = [];
                            }

                            if (ignoreFilters?.class || extractorConfiguration.source?.ignore.class) {
                                const ignore = ignoreFilters?.class || extractorConfiguration.source?.ignore.class;
                                ignoreDeclaration = ignore!(cls);
                            }
                            if (!ignoreDeclaration)
                                result.classes.push(cls);

                            break;

                        case SyntaxKind.EnumDeclaration:
                            const enumNode = declaration as EnumDeclaration;
                            const em = this.enumExtractor.extract(enumNode);
                            if (!result.enums) {
                                result.enums = [];
                            }

                            if (ignoreFilters?.enum || extractorConfiguration.source?.ignore.enum) {
                                const ignore = ignoreFilters?.enum || extractorConfiguration.source?.ignore.enum;
                                ignoreDeclaration = ignore!(em);
                            }
                            if (!ignoreDeclaration)
                                result.enums.push(em);

                            break;

                        case SyntaxKind.FunctionDeclaration:
                            const funcNode = declaration as FunctionDeclaration;
                            const func = this.functionExtractor.extract(funcNode);
                            if (!result.functions) {
                                result.functions = [];
                            }

                            if (ignoreFilters?.function || extractorConfiguration.source?.ignore.function) {
                                const ignore = ignoreFilters?.function || extractorConfiguration.source?.ignore.function;
                                ignoreDeclaration = ignore!(func);
                            }
                            if (!ignoreDeclaration)
                                result.functions.push(func);

                            break;

                        case SyntaxKind.TypeAliasDeclaration:
                            const taNode = declaration as TypeAliasDeclaration;
                            const ta = this.typeAliasExtractor.extract(taNode);
                            if (!result.typeAliases) {
                                result.typeAliases = [];
                            }

                            if (ignoreFilters?.typeAlias || extractorConfiguration.source?.ignore.typeAlias) {
                                const ignore = ignoreFilters?.typeAlias || extractorConfiguration.source?.ignore.typeAlias;
                                ignoreDeclaration = ignore!(ta);
                            }
                            if (!ignoreDeclaration)
                                result.typeAliases.push(ta);

                            break;

                        case SyntaxKind.InterfaceDeclaration:
                            const interfaceNode = declaration as InterfaceDeclaration;
                            const inf = this.interfaceExtractor.extract(interfaceNode);
                            if (!result.interfaces) {
                                result.interfaces = [];
                            }

                            if (ignoreFilters?.interface || extractorConfiguration.source?.ignore.interface) {
                                const ignore = ignoreFilters?.interface || extractorConfiguration.source?.ignore.interface;
                                ignoreDeclaration = ignore!(inf);
                            }
                            if (!ignoreDeclaration)
                                result.interfaces.push(inf);

                            break;

                        case SyntaxKind.VariableDeclaration:
                            const variableNode = declaration as VariableDeclaration;
                            const variableStatement = this.getVariableStatement(variableNode);
                            if (variableStatement) {
                                if (this.isVariableStatementInSourceOrModule(variableStatement)) {
                                    const variable = this.variableStatementExtractor.extract(variableStatement);
                                    if (!result.variableStatements) {
                                        result.variableStatements = [];
                                    }

                                    if (ignoreFilters?.variable || extractorConfiguration.source?.ignore.variable) {
                                        const ignore = ignoreFilters?.variable || extractorConfiguration.source?.ignore.variable;
                                        ignoreDeclaration = ignore!(variable);
                                    }
                                    if (!ignoreDeclaration)
                                        result.variableStatements.push(variable);
                                }
                            }
                            break;
                    }
                }
            })
        }
        return result;
    }

    public extractAll(sourceFiles: SourceFile[], ignoreFilters?: ISourceFileIgnoreDeclarations): SourceFileInfo {
        const result: SourceFileInfo = {
            classes: void 0,
            enums: void 0,
            functions: void 0,
            typeAliases: void 0,
            interfaces: void 0,
            variableStatements: void 0,
            exportAssignments: void 0
        };
        for (const sourceFile of sourceFiles) {
            const src = this.extract(sourceFile, ignoreFilters);
            if (src.exportAssignments) {
                for (const ea of src.exportAssignments) {
                    if (!result.exportAssignments) {
                        result.exportAssignments = [];
                    }
                    result.exportAssignments.push(ea);
                }
            }
            if (src.classes) {
                for (const c of src.classes) {
                    if (!result.classes) {
                        result.classes = [];
                    }
                    result.classes.push(c);
                }
            }
            if (src.enums) {
                for (const e of src.enums) {
                    if (!result.enums) {
                        result.enums = [];
                    }
                    result.enums.push(e);
                }
            }
            if (src.functions) {
                for (const f of src.functions) {
                    if (!result.functions) {
                        result.functions = [];
                    }
                    result.functions.push(f);
                }
            }
            if (src.typeAliases) {
                for (const ta of src.typeAliases) {
                    if (!result.typeAliases) {
                        result.typeAliases = [];
                    }
                    result.typeAliases.push(ta);
                }
            }
            if (src.interfaces) {
                for (const i of src.interfaces) {
                    if (!result.interfaces) {
                        result.interfaces = [];
                    }
                    result.interfaces.push(i);
                }
            }
            if (src.variableStatements) {
                for (const vs of src.variableStatements) {
                    if (!result.variableStatements) {
                        result.variableStatements = [];
                    }
                    result.variableStatements.push(vs);
                }
            }
        }
        return result;
    }

    private getVariableStatement(node: VariableDeclaration): VariableStatement | undefined {
        const declarationList = node.getParent();
        if (TypeGuards.isVariableDeclarationList(declarationList)) {
            const statement = declarationList.getParent();
            if (TypeGuards.isVariableStatement(statement)) {
                const newNode = statement as VariableStatement;
                return newNode;
            }
        }
        return void 0;
    }

    private isVariableStatementInSourceOrModule(node: VariableStatement): boolean {
        const isInSourceFile = node.getParentIfKind(SyntaxKind.SourceFile);
        const isInModule = node.getParentIfKind(SyntaxKind.ModuleBlock);
        if (isInSourceFile || isInModule) {
            return true;
        }
        return false;
    }

    private hasInternalTag(comment: CommentInfo): boolean {
        let isInternal = comment.description?.join(' ').includes('@internal');
        if (isInternal) {
            return true;
        }
        if (comment.tags) {
            for (let index = 0; index < comment.tags.length; index++) {
                const tag = comment.tags[index];
                let status = tag.tagName === '@internal';
                if (status) {
                    return true;
                }
            }
        }
        return false;
    }
}