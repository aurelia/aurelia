import { Registration } from '@aurelia/kernel';
import { assert, TestContext } from '@aurelia/testing';

import {
  IInsightsConfiguration,
  DEFAULT_INSIGHTS_CONFIGURATION,
  createInsightsConfiguration,
  InsightsConfiguration,
  IInsightsConfigurationOptions,
  IPerformanceFilter,
  DevToolsColor
} from '@aurelia/insights';

describe('insights/configuration.spec.ts', function () {
  let ctx: TestContext;

  beforeEach(function () {
    ctx = TestContext.create();
  });

  describe('IInsightsConfiguration interface', function () {
    it('should define the configuration token', function () {
      assert.typeOf(IInsightsConfiguration, 'object');
      assert.notStrictEqual(IInsightsConfiguration, undefined);
    });

    it('should be injectable through DI container', function () {
      const config: IInsightsConfiguration = {
        enabled: true,
        trackName: 'Test',
        trackGroup: 'TestGroup',
        defaultColor: 'primary',
        filters: [],
        enableRouterTracking: false
      };

      ctx.container.register(Registration.instance(IInsightsConfiguration, config));
      const resolved = ctx.container.get(IInsightsConfiguration);

      assert.strictEqual(resolved, config);
    });
  });

  describe('DEFAULT_INSIGHTS_CONFIGURATION', function () {
    it('should have correct default values', function () {
      assert.strictEqual(DEFAULT_INSIGHTS_CONFIGURATION.enabled, true);
      assert.strictEqual(DEFAULT_INSIGHTS_CONFIGURATION.trackName, 'Aurelia');
      assert.strictEqual(DEFAULT_INSIGHTS_CONFIGURATION.trackGroup, 'Framework');
      assert.strictEqual(DEFAULT_INSIGHTS_CONFIGURATION.defaultColor, 'primary');
      assert.instanceOf(DEFAULT_INSIGHTS_CONFIGURATION.filters, Array);
      assert.strictEqual(DEFAULT_INSIGHTS_CONFIGURATION.filters.length, 0);
      assert.strictEqual(DEFAULT_INSIGHTS_CONFIGURATION.enableRouterTracking, true);
    });
  });

  describe('createInsightsConfiguration function', function () {
    it('should create registration with default values when no options provided', function () {
      const registration = createInsightsConfiguration();

      ctx.container.register(registration);
      const config = ctx.container.get(IInsightsConfiguration);

      assert.strictEqual(config.enabled, DEFAULT_INSIGHTS_CONFIGURATION.enabled);
      assert.strictEqual(config.trackName, DEFAULT_INSIGHTS_CONFIGURATION.trackName);
      assert.strictEqual(config.trackGroup, DEFAULT_INSIGHTS_CONFIGURATION.trackGroup);
      assert.strictEqual(config.defaultColor, DEFAULT_INSIGHTS_CONFIGURATION.defaultColor);
      assert.strictEqual(config.enableRouterTracking, DEFAULT_INSIGHTS_CONFIGURATION.enableRouterTracking);
      assert.instanceOf(config.filters, Array);
      assert.strictEqual(config.filters.length, 0);
    });

    it('should merge provided options with defaults', function () {
      const options: Partial<IInsightsConfigurationOptions> = {
        enabled: false,
        trackName: 'CustomApp',
        defaultColor: 'error'
      };

      const registration = createInsightsConfiguration(options);
      ctx.container.register(registration);
      const config = ctx.container.get(IInsightsConfiguration);

      assert.strictEqual(config.enabled, false);
      assert.strictEqual(config.trackName, 'CustomApp');
      assert.strictEqual(config.trackGroup, DEFAULT_INSIGHTS_CONFIGURATION.trackGroup);
      assert.strictEqual(config.defaultColor, 'error');
      assert.strictEqual(config.enableRouterTracking, DEFAULT_INSIGHTS_CONFIGURATION.enableRouterTracking);
    });

    it('should merge filters correctly', function () {
      const customFilter: IPerformanceFilter = {
        name: 'custom-filter',
        include: true,
        pattern: 'custom-pattern'
      };

      const options: Partial<IInsightsConfigurationOptions> = {
        filters: [customFilter]
      };

      const registration = createInsightsConfiguration(options);
      ctx.container.register(registration);
      const config = ctx.container.get(IInsightsConfiguration);

      assert.strictEqual(config.filters.length, 1);
      assert.strictEqual(config.filters[0], customFilter);
      assert.strictEqual(config.filters[0].name, 'custom-filter');
      assert.strictEqual(config.filters[0].include, true);
      assert.strictEqual(config.filters[0].pattern, 'custom-pattern');
    });

    it('should handle multiple custom filters', function () {
      const filter1: IPerformanceFilter = {
        name: 'filter1',
        include: true,
        pattern: 'pattern1'
      };

      const filter2: IPerformanceFilter = {
        name: 'filter2',
        include: false,
        pattern: /pattern2/
      };

      const options: Partial<IInsightsConfigurationOptions> = {
        filters: [filter1, filter2]
      };

      const registration = createInsightsConfiguration(options);
      ctx.container.register(registration);
      const config = ctx.container.get(IInsightsConfiguration);

      assert.strictEqual(config.filters.length, 2);
      assert.strictEqual(config.filters[0].name, 'filter1');
      assert.strictEqual(config.filters[1].name, 'filter2');
      assert.instanceOf(config.filters[1].pattern, RegExp);
    });

    it('should handle empty options object', function () {
      const registration = createInsightsConfiguration({});
      ctx.container.register(registration);
      const config = ctx.container.get(IInsightsConfiguration);

      assert.deepStrictEqual(config, DEFAULT_INSIGHTS_CONFIGURATION);
    });

    it('should handle all DevToolsColor values', function () {
      const colors: DevToolsColor[] = [
        'primary', 'primary-light', 'primary-dark',
        'secondary', 'secondary-light', 'secondary-dark',
        'tertiary', 'tertiary-light', 'tertiary-dark',
        'error'
      ];

      colors.forEach(color => {
        const testCtx = TestContext.create();
        const options: Partial<IInsightsConfigurationOptions> = {
          defaultColor: color
        };

        const registration = createInsightsConfiguration(options);
        testCtx.container.register(registration);
        const config = testCtx.container.get(IInsightsConfiguration);

        assert.strictEqual(config.defaultColor, color);
      });
    });

    it('should not mutate the original options object', function () {
      const originalOptions: Partial<IInsightsConfigurationOptions> = {
        enabled: false,
        trackName: 'Original'
      };

      const optionsCopy = { ...originalOptions };
      createInsightsConfiguration(originalOptions);

      assert.deepStrictEqual(originalOptions, optionsCopy);
    });
  });

  describe('InsightsConfiguration builder class', function () {
    describe('create static method', function () {
      it('should create new instance with empty options', function () {
        const builder = InsightsConfiguration.create();
        assert.notStrictEqual(builder, null);
        assert.notStrictEqual(builder, undefined);
        assert.typeOf(builder, 'object');
      });

      it('should create new instance with provided options', function () {
        const options: Partial<IInsightsConfigurationOptions> = {
          enabled: false
        };

        const builder = InsightsConfiguration.create(options);
        const registration = builder.build();
        ctx.container.register(registration);
        const config = ctx.container.get(IInsightsConfiguration);

        assert.strictEqual(config.enabled, false);
      });
    });

    describe('enabled method', function () {
      it('should set enabled to true', function () {
        const registration = InsightsConfiguration
          .create()
          .enabled(true)
          .build();

        ctx.container.register(registration);
        const config = ctx.container.get(IInsightsConfiguration);

        assert.strictEqual(config.enabled, true);
      });

      it('should set enabled to false', function () {
        const registration = InsightsConfiguration
          .create()
          .enabled(false)
          .build();

        ctx.container.register(registration);
        const config = ctx.container.get(IInsightsConfiguration);

        assert.strictEqual(config.enabled, false);
      });

      it('should return this for chaining', function () {
        const builder = InsightsConfiguration.create();
        const result = builder.enabled(true);

        assert.strictEqual(result, builder);
      });
    });

    describe('trackName method', function () {
      it('should set custom track name', function () {
        const registration = InsightsConfiguration
          .create()
          .trackName('MyApp')
          .build();

        ctx.container.register(registration);
        const config = ctx.container.get(IInsightsConfiguration);

        assert.strictEqual(config.trackName, 'MyApp');
      });

      it('should return this for chaining', function () {
        const builder = InsightsConfiguration.create();
        const result = builder.trackName('Test');

        assert.strictEqual(result, builder);
      });

      it('should handle empty string', function () {
        const registration = InsightsConfiguration
          .create()
          .trackName('')
          .build();

        ctx.container.register(registration);
        const config = ctx.container.get(IInsightsConfiguration);

        assert.strictEqual(config.trackName, '');
      });
    });

    describe('trackGroup method', function () {
      it('should set custom track group', function () {
        const registration = InsightsConfiguration
          .create()
          .trackGroup('Application')
          .build();

        ctx.container.register(registration);
        const config = ctx.container.get(IInsightsConfiguration);

        assert.strictEqual(config.trackGroup, 'Application');
      });

      it('should return this for chaining', function () {
        const builder = InsightsConfiguration.create();
        const result = builder.trackGroup('Test');

        assert.strictEqual(result, builder);
      });
    });

    describe('defaultColor method', function () {
      it('should set default color', function () {
        const registration = InsightsConfiguration
          .create()
          .defaultColor('error')
          .build();

        ctx.container.register(registration);
        const config = ctx.container.get(IInsightsConfiguration);

        assert.strictEqual(config.defaultColor, 'error');
      });

      it('should return this for chaining', function () {
        const builder = InsightsConfiguration.create();
        const result = builder.defaultColor('secondary');

        assert.strictEqual(result, builder);
      });

      it('should handle all valid color values', function () {
        const colors: DevToolsColor[] = [
          'primary', 'primary-light', 'primary-dark',
          'secondary', 'secondary-light', 'secondary-dark',
          'tertiary', 'tertiary-light', 'tertiary-dark',
          'error'
        ];

        colors.forEach(color => {
          const testCtx = TestContext.create();
          const registration = InsightsConfiguration
            .create()
            .defaultColor(color)
            .build();

          testCtx.container.register(registration);
          const config = testCtx.container.get(IInsightsConfiguration);

          assert.strictEqual(config.defaultColor, color);
        });
      });
    });

    describe('addFilter method', function () {
      it('should add single filter', function () {
        const filter: IPerformanceFilter = {
          name: 'test-filter',
          include: true,
          pattern: 'test-pattern'
        };

        const registration = InsightsConfiguration
          .create()
          .addFilter(filter)
          .build();

        ctx.container.register(registration);
        const config = ctx.container.get(IInsightsConfiguration);

        assert.strictEqual(config.filters.length, 1);
        assert.strictEqual(config.filters[0], filter);
      });

      it('should add multiple filters', function () {
        const filter1: IPerformanceFilter = {
          name: 'filter1',
          include: true,
          pattern: 'pattern1'
        };

        const filter2: IPerformanceFilter = {
          name: 'filter2',
          include: false,
          pattern: /pattern2/
        };

        const registration = InsightsConfiguration
          .create()
          .addFilter(filter1)
          .addFilter(filter2)
          .build();

        ctx.container.register(registration);
        const config = ctx.container.get(IInsightsConfiguration);

        assert.strictEqual(config.filters.length, 2);
        assert.strictEqual(config.filters[0], filter1);
        assert.strictEqual(config.filters[1], filter2);
      });

      it('should return this for chaining', function () {
        const builder = InsightsConfiguration.create();
        const filter: IPerformanceFilter = {
          name: 'test',
          include: true,
          pattern: 'test'
        };

        const result = builder.addFilter(filter);

        assert.strictEqual(result, builder);
      });

      it('should initialize filters array when undefined', function () {
        const filter: IPerformanceFilter = {
          name: 'test',
          include: true,
          pattern: 'test'
        };

        const registration = InsightsConfiguration
          .create()
          .addFilter(filter)
          .build();

        ctx.container.register(registration);
        const config = ctx.container.get(IInsightsConfiguration);

        assert.instanceOf(config.filters, Array);
        assert.strictEqual(config.filters.length, 1);
      });

      it('should handle RegExp patterns', function () {
        const filter: IPerformanceFilter = {
          name: 'regex-filter',
          include: true,
          pattern: /^component-.*/i
        };

        const registration = InsightsConfiguration
          .create()
          .addFilter(filter)
          .build();

        ctx.container.register(registration);
        const config = ctx.container.get(IInsightsConfiguration);

        assert.instanceOf(config.filters[0].pattern, RegExp);
        assert.strictEqual((config.filters[0].pattern as RegExp).source, '^component-.*');
        assert.strictEqual((config.filters[0].pattern as RegExp).flags, 'i');
      });
    });

    describe('enableRouterTracking method', function () {
      it('should enable router tracking', function () {
        const registration = InsightsConfiguration
          .create()
          .enableRouterTracking(true)
          .build();

        ctx.container.register(registration);
        const config = ctx.container.get(IInsightsConfiguration);

        assert.strictEqual(config.enableRouterTracking, true);
      });

      it('should disable router tracking', function () {
        const registration = InsightsConfiguration
          .create()
          .enableRouterTracking(false)
          .build();

        ctx.container.register(registration);
        const config = ctx.container.get(IInsightsConfiguration);

        assert.strictEqual(config.enableRouterTracking, false);
      });

      it('should return this for chaining', function () {
        const builder = InsightsConfiguration.create();
        const result = builder.enableRouterTracking(true);

        assert.strictEqual(result, builder);
      });
    });

    describe('build method', function () {
      it('should return IRegistry', function () {
        const registration = InsightsConfiguration.create().build();

        // Should be able to register with container
        ctx.container.register(registration);
        const config = ctx.container.get(IInsightsConfiguration);

        assert.notStrictEqual(config, null);
        assert.notStrictEqual(config, undefined);
        assert.typeOf(config, 'object');
      });

      it('should create configuration with all defaults when no methods called', function () {
        const registration = InsightsConfiguration.create().build();
        ctx.container.register(registration);
        const config = ctx.container.get(IInsightsConfiguration);

        assert.strictEqual(config.enabled, DEFAULT_INSIGHTS_CONFIGURATION.enabled);
        assert.strictEqual(config.trackName, DEFAULT_INSIGHTS_CONFIGURATION.trackName);
        assert.strictEqual(config.trackGroup, DEFAULT_INSIGHTS_CONFIGURATION.trackGroup);
        assert.strictEqual(config.defaultColor, DEFAULT_INSIGHTS_CONFIGURATION.defaultColor);
        assert.strictEqual(config.enableRouterTracking, DEFAULT_INSIGHTS_CONFIGURATION.enableRouterTracking);
        assert.strictEqual(config.filters.length, 0);
      });
    });

    describe('method chaining', function () {
      it('should support full method chaining', function () {
        const filter: IPerformanceFilter = {
          name: 'chain-filter',
          include: true,
          pattern: 'chain-*'
        };

        const registration = InsightsConfiguration
          .create()
          .enabled(false)
          .trackName('ChainedApp')
          .trackGroup('ChainedGroup')
          .defaultColor('error')
          .addFilter(filter)
          .enableRouterTracking(false)
          .build();

        ctx.container.register(registration);
        const config = ctx.container.get(IInsightsConfiguration);

        assert.strictEqual(config.enabled, false);
        assert.strictEqual(config.trackName, 'ChainedApp');
        assert.strictEqual(config.trackGroup, 'ChainedGroup');
        assert.strictEqual(config.defaultColor, 'error');
        assert.strictEqual(config.enableRouterTracking, false);
        assert.strictEqual(config.filters.length, 1);
        assert.strictEqual(config.filters[0].name, 'chain-filter');
      });

      it('should allow multiple calls to same method with last value winning', function () {
        const registration = InsightsConfiguration
          .create()
          .enabled(true)
          .enabled(false)
          .trackName('First')
          .trackName('Second')
          .build();

        ctx.container.register(registration);
        const config = ctx.container.get(IInsightsConfiguration);

        assert.strictEqual(config.enabled, false);
        assert.strictEqual(config.trackName, 'Second');
      });
    });

    describe('integration with createInsightsConfiguration', function () {
      it('should produce equivalent results', function () {
        const filter: IPerformanceFilter = {
          name: 'integration-filter',
          include: false,
          pattern: /integration/
        };

        const options: Partial<IInsightsConfigurationOptions> = {
          enabled: false,
          trackName: 'IntegrationApp',
          trackGroup: 'IntegrationGroup',
          defaultColor: 'secondary',
          filters: [filter],
          enableRouterTracking: false
        };

        // Using createInsightsConfiguration
        const directRegistration = createInsightsConfiguration(options);
        ctx.container.register(directRegistration);
        const directConfig = ctx.container.get(IInsightsConfiguration);

        // Using builder
        const builderRegistration = InsightsConfiguration
          .create()
          .enabled(false)
          .trackName('IntegrationApp')
          .trackGroup('IntegrationGroup')
          .defaultColor('secondary')
          .addFilter(filter)
          .enableRouterTracking(false)
          .build();

        const builderCtx = TestContext.create();
        builderCtx.container.register(builderRegistration);
        const builderConfig = builderCtx.container.get(IInsightsConfiguration);

        assert.strictEqual(directConfig.enabled, builderConfig.enabled);
        assert.strictEqual(directConfig.trackName, builderConfig.trackName);
        assert.strictEqual(directConfig.trackGroup, builderConfig.trackGroup);
        assert.strictEqual(directConfig.defaultColor, builderConfig.defaultColor);
        assert.strictEqual(directConfig.enableRouterTracking, builderConfig.enableRouterTracking);
        assert.strictEqual(directConfig.filters.length, builderConfig.filters.length);
        assert.strictEqual(directConfig.filters[0].name, builderConfig.filters[0].name);
      });
    });
  });

  describe('edge cases and error handling', function () {
    it('should handle null and undefined filter patterns gracefully', function () {
      const filterWithNull: any = {
        name: 'null-pattern',
        include: true,
        pattern: null
      };

      const filterWithUndefined: any = {
        name: 'undefined-pattern',
        include: true,
        pattern: undefined
      };

      const registration = InsightsConfiguration
        .create()
        .addFilter(filterWithNull)
        .addFilter(filterWithUndefined)
        .build();

      ctx.container.register(registration);
      const config = ctx.container.get(IInsightsConfiguration);

      assert.strictEqual(config.filters.length, 2);
      assert.strictEqual(config.filters[0].pattern, null);
      assert.strictEqual(config.filters[1].pattern, undefined);
    });

    it('should handle empty filter names', function () {
      const emptyNameFilter: IPerformanceFilter = {
        name: '',
        include: true,
        pattern: 'test'
      };

      const registration = InsightsConfiguration
        .create()
        .addFilter(emptyNameFilter)
        .build();

      ctx.container.register(registration);
      const config = ctx.container.get(IInsightsConfiguration);

      assert.strictEqual(config.filters[0].name, '');
    });

    it('should preserve filter reference integrity', function () {
      const filter: IPerformanceFilter = {
        name: 'reference-test',
        include: true,
        pattern: 'test'
      };

      const registration = InsightsConfiguration
        .create()
        .addFilter(filter)
        .build();

      ctx.container.register(registration);
      const config = ctx.container.get(IInsightsConfiguration);

      assert.strictEqual(config.filters[0], filter);
    });
  });
});
