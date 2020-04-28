import {
  RouteRecognizer as $RouteRecognizer,
  IConfigurableRoute as $IConfigurableRoute,
  ConfigurableRoute as $ConfigurableRoute,
  RecognizedRoute as $RecognizedRoute,
  Endpoint as $Endpoint,
} from '@aurelia/route-recognizer';

import { IRoute } from './interfaces';
import { INode } from '@aurelia/runtime';

declare class $$RouteRecognizer<T extends INode> extends $RouteRecognizer<IRoute<T>> {}
declare class $$ConfigurableRoute<T extends INode> extends $ConfigurableRoute<IRoute<T>> {}
declare class $$RecognizedRoute<T extends INode> extends $RecognizedRoute<IRoute<T>> {}
declare class $$Endpoint<T extends INode> extends $Endpoint<IRoute<T>> {}

export interface RouteRecognizer<T extends INode = INode> extends $RouteRecognizer<IRoute<T>> {}
export type IConfigurableRoute<T extends INode = INode> = $IConfigurableRoute<IRoute<T>>;
export interface ConfigurableRoute<T extends INode = INode> extends $ConfigurableRoute<IRoute<T>> {}
export interface RecognizedRoute<T extends INode = INode> extends $RecognizedRoute<IRoute<T>> {}
export interface Endpoint<T extends INode = INode> extends $Endpoint<IRoute<T>> {}

export const RouteRecognizer = $RouteRecognizer as typeof $$RouteRecognizer;
export const ConfigurableRoute = $ConfigurableRoute as typeof $$ConfigurableRoute;
export const RecognizedRoute = $RecognizedRoute as typeof $$RecognizedRoute;
export const Endpoint = $Endpoint as typeof $$Endpoint;
