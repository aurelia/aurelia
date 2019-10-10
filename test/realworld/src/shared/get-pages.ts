export function getPages(total: number, limit: number) {
  return Array.from(new Array(Math.ceil(total / limit)),
    (_, index) => index + 1);
}
