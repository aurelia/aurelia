import { DI } from '@aurelia/kernel';
import { INode } from '../dom';

export const IRenderLocation = DI.createInterface<IRenderLocation>().noDefault();
export interface IRenderLocation extends INode { }
