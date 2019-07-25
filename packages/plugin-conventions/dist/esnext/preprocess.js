import { preprocessResource } from './preprocess-resource';
import { preprocessHtmlTemplate } from './preprocess-html-template';
import * as fs from 'fs';
import * as path from 'path';
export function preprocess(
// The filePath is used in sourceMap.
filePath, contents, ts = false, 
// The base file path that filePath is related to. Used for checking existence of html pair.
basePath = '', 
// For testing
_fileExists = fileExists) {
    const ext = path.extname(filePath);
    if (ext === '.html') {
        return preprocessHtmlTemplate(filePath, contents, ts);
    }
    else {
        const htmlFilePath = path.join(basePath, filePath.slice(0, -ext.length) + '.html');
        const hasHtmlPair = _fileExists(htmlFilePath);
        return preprocessResource(filePath, contents, hasHtmlPair);
    }
}
function fileExists(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return stats.isFile();
    }
    catch (e) {
        return false;
    }
}
//# sourceMappingURL=preprocess.js.map