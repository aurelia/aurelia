import { DI, } from '@aurelia/kernel';
export var Encoding;
(function (Encoding) {
    Encoding["utf8"] = "utf8";
    Encoding["utf16le"] = "utf16le";
    Encoding["latin1"] = "latin1";
    Encoding["base64"] = "base64";
    Encoding["ascii"] = "ascii";
    Encoding["hex"] = "hex";
    Encoding["raw"] = "raw";
})(Encoding || (Encoding = {}));
export var FileKind;
(function (FileKind) {
    FileKind[FileKind["Unknown"] = 0] = "Unknown";
    FileKind[FileKind["Script"] = 1] = "Script";
    FileKind[FileKind["Markup"] = 2] = "Markup";
    FileKind[FileKind["Style"] = 3] = "Style";
    FileKind[FileKind["JSON"] = 4] = "JSON";
})(FileKind || (FileKind = {}));
export const IFileSystem = DI.createInterface('IFileSystem');
//# sourceMappingURL=interfaces.js.map