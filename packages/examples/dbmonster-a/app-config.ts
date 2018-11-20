import { ITemplateDefinition, TargetedInstructionType, BindingMode } from '@aurelia/runtime';

//this object is built up during compilation
export const appConfig: ITemplateDefinition = {
  name: 'app',
  dependencies: [ ],
  template: `
    <div>
      <table class="table table-striped latest-data">
        <tbody>
          <tr class="au"></tr>
        </tbody>
      </table>
    </div>
  `,
  instructions: [
    [
      {
        type: TargetedInstructionType.hydrateTemplateController,
        res: 'repeat',
        def: {
          cache: "*",
          template: `
            <tr>
              <td class="dbname"><au-m class="au"></au-m> </td>
              <td class="query-count"><au-m class="au"></au-m> </td>
              <td class="au"></td>
            </tr>
          `,
          instructions: [
            [ { type: TargetedInstructionType.textBinding, from: 'dbname' } ],
            [ { type: TargetedInstructionType.textBinding, from: 'nbQueries' } ],
            [
              {
                type: TargetedInstructionType.hydrateTemplateController,
                res: 'repeat',
                def: {
                  cache: "*",
                  template: `
                  <td>
                    <au-m class="au"></au-m> <div class="popover left">
                      <div class="popover-content"><au-m class="au"></au-m> </div>
                      <div class="arrow"></div>
                    </div>
                  </td>
                  `,
                  instructions: [
                    [ { type: TargetedInstructionType.textBinding, from: 'formatElapsed' } ],
                    [ { type: TargetedInstructionType.textBinding, from: 'query' } ]
                  ]
                },
                instructions: [
                  { type: TargetedInstructionType.propertyBinding, mode: BindingMode.toView, from: 'topFiveQueries', to: 'items' },
                  { type: TargetedInstructionType.setProperty, value: 'q', to: 'local' },
                  { type: TargetedInstructionType.setProperty, value: false, to: 'visualsRequireLifecycle' }
                ]
              }
            ]
          ]
        },
        instructions: [
          { type: TargetedInstructionType.propertyBinding, mode: BindingMode.toView, from: 'databases', to: 'items' },
          { type: TargetedInstructionType.setProperty, value: 'db', to: 'local' },
          { type: TargetedInstructionType.setProperty, value: false, to: 'visualsRequireLifecycle' }
        ]
      }
    ]
  ],
  surrogates: []
};
