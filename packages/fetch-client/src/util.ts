/**
 * Serialize an object to JSON. Useful for easily creating JSON fetch request bodies.
 *
 * @param body - The object to be serialized to JSON.
 * @param replacer - The JSON.stringify replacer used when serializing.
 * @returns A JSON string.
 */
export function json(body: unknown, replacer?: (key: string, value: unknown) => unknown): string {
  return JSON.stringify((body !== undefined ? body : {}), replacer);
}
