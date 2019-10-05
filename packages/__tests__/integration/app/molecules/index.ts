import { IContainer } from '@aurelia/kernel';
import { CameraSpecsViewer } from './specs-viewer/camera-specs-viewer';
import { LaptopSpecsViewer } from './specs-viewer/laptop-specs-viewer';
import { SpecsViewer, ViewerValueConverter } from './specs-viewer/specs-viewer';
import { ThingViewer } from './specs-viewer/thing-viewer';

export const molecules = {
  register(container: IContainer) {
    container
      .register(
        SpecsViewer,
        ThingViewer,
        CameraSpecsViewer,
        LaptopSpecsViewer,
        ViewerValueConverter
      );
  }
}
