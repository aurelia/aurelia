export interface IConfigurationOptions { coerceBindables: boolean }
/** @internal */
export const configurationOptions: IConfigurationOptions = {
  coerceBindables: false
};
export type ConfigOptionsProvider = (options: IConfigurationOptions) => void;
