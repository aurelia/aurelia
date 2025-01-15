/* eslint-disable no-console */
import { IPlatform } from '@aurelia/kernel';
import { DI, IContainer, Registration } from 'aurelia';


export type ITimingService = TimingService;
export const ITimingService = DI.createInterface<ITimingService>('TimingService');
export class TimingService {
  public static register(container: IContainer) {
    Registration.singleton(ITimingService, TimingService).register(container);
  }

  constructor(@IPlatform private readonly platform:IPlatform) {}

  public startTimer(label: string): void {
      this.platform.console.time(label);
  }

  public endTimer(label: string): void {
      this.platform.console.timeEnd(label);
  }
}
