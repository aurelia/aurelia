export function fileBase(filePath) {
    const fileName = filePath.split(/\\|\//).pop();
    const dotIdx = fileName.lastIndexOf('.');
    return dotIdx >= 0 ? fileName.slice(0, dotIdx) : fileName;
}
//# sourceMappingURL=file-base.js.map