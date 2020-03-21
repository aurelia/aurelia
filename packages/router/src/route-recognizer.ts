import {
  RouteRecognizer as $RouteRecognizer,
  IConfigurableRoute as $IConfigurableRoute,
  ConfigurableRoute as $ConfigurableRoute,
  RecognizedRoute as $RecognizedRoute,
  Endpoint as $Endpoint,
} from '@aurelia/route-recognizer';

import { IRoute } from './interfaces';

export declare class RouteRecognizer extends $RouteRecognizer<IRoute> {}
export type IConfigurableRoute = $IConfigurableRoute<IRoute>;
export declare class ConfigurableRoute extends $ConfigurableRoute<IRoute> {}
export declare class RecognizedRoute extends $RecognizedRoute<IRoute> {}
export declare class Endpoint extends $Endpoint<IRoute> {}
