import { SourceFileInfo } from '../../api/models/source-file/source-file-info';
import { Project } from 'ts-morph';
import { SourceFileExtractor } from '../../api';

export function getAureliaSources(tsconfig: string): SourceFileInfo {
    const project = new Project({
        tsConfigFilePath: tsconfig,
    });
    const sources = project
        .getSourceFiles()
        .filter(item => item.getFilePath().includes('src'))
        .filter(item => !item.getFilePath().includes('__tests__'))
        .filter(item => !item.getFilePath().includes('__e2e__'))
        .filter(item => !item.getFilePath().includes('node_modules'))
        .filter(item => !item.getFilePath().includes('dist'))
        .filter(item => !item.getFilePath().includes('examples'))
        .filter(item => item.isDeclarationFile() === false);
    const extractor = new SourceFileExtractor();
    const result = extractor.extractAll(sources);
    return result;
}
