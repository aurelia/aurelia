import { ITemplateSource, TargetedInstructionType, BindingMode } from '@aurelia/runtime';

//this object is built up during compilation
export const appConfig: ITemplateSource = {
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
        src: {
          cache: "*",
          template: `
            <tr>
              <td class="dbname"><au-marker class="au"></au-marker> </td>
              <td class="query-count"><au-marker class="au"></au-marker> </td>
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
                src: {
                  cache: "*",
                  template: `
                  <td>
                    <au-marker class="au"></au-marker> <div class="popover left">
                      <div class="popover-content"><au-marker class="au"></au-marker> </div>
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
