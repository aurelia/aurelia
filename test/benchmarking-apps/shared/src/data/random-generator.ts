import * as data from './data.json';

const {
  firstNames,
  firstNames: { length: numFirstName },
  lastNames,
  lastNames: { length: numLastName },
  streets,
  streets: { length: numStreets },
  pins,
  pins: { length: numPins },
  cities,
  cities: { length: numCities },
  countries,
  countries: { length: numCountries },
} = data;
export function randomNumber(max = 1e6): number { return Math.round(Math.random() * max); }
export function randomStreet(): string { return streets[randomNumber(numStreets)]; }
export function randomCity(): string { return cities[randomNumber(numCities)]; }
export function randomPin(): string { return pins[randomNumber(numPins)]; }
export function randomCountry(): string { return countries[randomNumber(numCountries)]; }
export function randomFirstName(): string { return firstNames[randomNumber(numFirstName)]; }
export function randomLastName(): string { return lastNames[randomNumber(numLastName)]; }
export function randomDate(): Date { return new Date(Math.random() * 1e13); }
export function randomBoolean(): boolean { return Math.random() > 0.5; }
