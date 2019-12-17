import { TypeInfo } from '../api/models/type/type-info';
import { TemplateConfiguration } from '../templates/configurations';
import { sourceFileLocator } from './source-file-locator';

export function typeMapper(typeInfo: TypeInfo): string {

    let value = typeInfo.value;
    let baseUrl = TemplateConfiguration.baseUrl ?? '';
    // 'typeInfo' has imports.
    if (typeInfo.imports) {
        for (let index = 0; index < typeInfo.imports.length; index++) {
            const path = typeInfo.imports[index].path;
            const category = typeInfo.imports[index].typeCategory;//.toString().toLowerCase();
            const name = typeInfo.imports[index].name;
            const url = sourceFileLocator(path, name, category, baseUrl);
            if (url !== '') {
                const mdUrl = `[${name}](${url.toLowerCase()})`;
                value = value.replace(name, mdUrl);
            }
        }
    } else {
        return value;
    }
    return value;
}
