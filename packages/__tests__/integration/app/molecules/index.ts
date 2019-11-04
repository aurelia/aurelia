import { IContainer, PLATFORM } from '@aurelia/kernel';
import { StyleConfiguration } from '@aurelia/runtime-html';
import { Cards } from './cards/cards';
import { LetDemo, SqrtValueConverter } from './let-demo/let-demo';
import { CameraSpecsViewer } from './specs-viewer/camera-specs-viewer';
import { LaptopSpecsViewer } from './specs-viewer/laptop-specs-viewer';
import { SpecsViewer, ViewerValueConverter } from './specs-viewer/specs-viewer';
import { ThingViewer } from './specs-viewer/thing-viewer';
import { UserPreference } from './user-preference/user-preference';
import { RandomGenerator } from './random-generator/random-generator';

export interface MolecularConfiguration {
  useCSSModule: boolean;
}

type MolecularConfigCustomizer = (config: MolecularConfiguration) => void;

function createMolecularConfiguration(customizeConfiguration: MolecularConfigCustomizer) {
  return {
    customizeConfiguration,
    register(container: IContainer) {
      const config: MolecularConfiguration = { useCSSModule: true };
      customizeConfiguration(config);

      const useCSSModule = config.useCSSModule;
      if (useCSSModule) {
        container.register(StyleConfiguration.cssModulesProcessor());
      }

      return container.register(
        SpecsViewer,
        ThingViewer,
        CameraSpecsViewer,
        LaptopSpecsViewer,
        ViewerValueConverter,

        UserPreference,

        LetDemo,
        SqrtValueConverter,

        Cards.customize(useCSSModule),
        RandomGenerator
      );
    },
    customize(cb?: MolecularConfigCustomizer) {
      return createMolecularConfiguration(cb || customizeConfiguration);
    },
  };
}

export const molecules = createMolecularConfiguration(PLATFORM.noop);
