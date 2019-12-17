import { TypeCategory } from './common/category/type-category';
import { getSourcePathFolders } from './get-source-path-folders';

export function sourceFileLocator(path: string, name: string, category: TypeCategory, baseUrl?: string, extension?: string): string {
    let value = '';
    if (baseUrl && baseUrl.length > 0) {
        if (baseUrl[baseUrl.length - 1] === '/') {
            baseUrl = baseUrl.substring(0, baseUrl.length - 1);
        }
    }
    const parts = getSourcePathFolders(path);
    if (parts.length > 0) {
        const mainParts = parts.slice(0, -1).join('/');
        const fileName = parts.slice(-1)[0].substr(0, parts.slice(-1)[0].indexOf('.'));
        value = `${baseUrl}/${mainParts}/${category.toLowerCase()}/${fileName}/${name}` + (extension ?? '');
    }
    return value.toLowerCase();
}

