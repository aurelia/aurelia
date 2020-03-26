import {
  RouteRecognizer as $RouteRecognizer,
  IConfigurableRoute as $IConfigurableRoute,
  ConfigurableRoute as $ConfigurableRoute,
  RecognizedRoute as $RecognizedRoute,
  Endpoint as $Endpoint,
} from '@aurelia/route-recognizer';

import { IRoute } from './interfaces';

declare class $$RouteRecognizer extends $RouteRecognizer<IRoute> {}
declare class $$ConfigurableRoute extends $ConfigurableRoute<IRoute> {}
declare class $$RecognizedRoute extends $RecognizedRoute<IRoute> {}
declare class $$Endpoint extends $Endpoint<IRoute> {}

export interface RouteRecognizer extends $RouteRecognizer<IRoute> {}
export type IConfigurableRoute = $IConfigurableRoute<IRoute>;
export interface ConfigurableRoute extends $ConfigurableRoute<IRoute> {}
export interface RecognizedRoute extends $RecognizedRoute<IRoute> {}
export interface Endpoint extends $Endpoint<IRoute> {}

export const RouteRecognizer = $RouteRecognizer as typeof $$RouteRecognizer;
export const ConfigurableRoute = $ConfigurableRoute as typeof $$ConfigurableRoute;
export const RecognizedRoute = $RecognizedRoute as typeof $$RecognizedRoute;
export const Endpoint = $Endpoint as typeof $$Endpoint;
