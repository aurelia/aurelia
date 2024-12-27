export interface Address {
  line1: string;
  line2?: string;
  city: string;
  pin: number;
}
export class Person {
  public constructor(public name: string, public age: number, public address?: Address) { }
}

export class Organization {
  public constructor(public employees: Person[], public address: Address) { }
}

export class Flight {
  public constructor(public direction: Direction, public departureDate: number, public returnDate: number) { }
}

export enum Direction {
  oneWay = 'one-way',
  return = 'return',
}
