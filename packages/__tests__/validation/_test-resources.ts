export interface Address {
  line1: string;
  line2?: string;
  city: string;
  pin: number;
}
export interface IPerson {
  name: string;
  age: number;
  address?: Address;
}
export class Person {
  public constructor(public name: string, public age: number, public address?: Address) { }
}

export class Organization {
  public constructor(public employees: Person[], public address: Address) { }
}
