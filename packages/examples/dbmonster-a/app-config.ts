import { ITemplateSource, TargetedInstructionType, BindingMode } from '@aurelia/runtime';

//this object is built up during compilation
export const appConfig: ITemplateSource = {
  name: 'app',
  dependencies: [ ],
  templateOrNode: `
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
          templateOrNode: `
            <tr>
              <td class="dbname"><au-marker class="au"></au-marker> </td>
              <td class="query-count"><au-marker class="au"></au-marker> </td>
              <td class="au"></td>
            </tr>
          `,
          instructions: [
            [ { type: TargetedInstructionType.textBinding, srcOrExpr: 'dbname' } ],
            [ { type: TargetedInstructionType.textBinding, srcOrExpr: 'nbQueries' } ],
            [
              {
                type: TargetedInstructionType.hydrateTemplateController,
                res: 'repeat',
                src: {
                  cache: "*",
                  templateOrNode: `
                  <td>
                    <au-marker class="au"></au-marker> <div class="popover left">
                      <div class="popover-content"><au-marker class="au"></au-marker> </div>
                      <div class="arrow"></div>
                    </div>
                  </td>
                  `,
                  instructions: [
                    [ { type: TargetedInstructionType.textBinding, srcOrExpr: 'formatElapsed' } ],
                    [ { type: TargetedInstructionType.textBinding, srcOrExpr: 'query' } ]
                  ]
                },
                instructions: [
                  { type: TargetedInstructionType.propertyBinding, mode: BindingMode.toView, srcOrExpr: 'topFiveQueries', dest: 'items' },
                  { type: TargetedInstructionType.setProperty, value: 'q', dest: 'local' },
                  { type: TargetedInstructionType.setProperty, value: false, dest: 'visualsRequireLifecycle' }
                ]
              }
            ]
          ]
        },
        instructions: [
          { type: TargetedInstructionType.propertyBinding, mode: BindingMode.toView, srcOrExpr: 'databases', dest: 'items' },
          { type: TargetedInstructionType.setProperty, value: 'db', dest: 'local' },
          { type: TargetedInstructionType.setProperty, value: false, dest: 'visualsRequireLifecycle' }
        ]
      }
    ]
  ],
  surrogates: []
};
