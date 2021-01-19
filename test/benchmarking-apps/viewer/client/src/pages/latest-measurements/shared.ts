export function round(value: number, factor = 100): number {
  return Math.round(value * factor) / factor;
}
export class VersionedItem {
  public constructor(
    public readonly name: string,
    public readonly version: string
  ) { }
}

export class Margin {
  public constructor(
    public readonly top: number,
    public readonly right: number,
    public readonly bottom: number,
    public readonly left: number,
  ) { }
}
