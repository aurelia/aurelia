export function fileBase(filePath: string): string {
  const fileName = filePath.split(/\\|\//).pop() as string;
  const dotIdx = fileName.lastIndexOf('.');
  return dotIdx >= 0 ? fileName.slice(0, dotIdx) : fileName;
}
