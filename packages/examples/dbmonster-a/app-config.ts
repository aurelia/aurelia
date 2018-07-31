import { ITemplateSource, TargetedInstructionType } from '@aurelia/runtime';

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
              <td class="dbname">
                <au-marker class="au"></au-marker> 
              </td>
              <td class="query-count">
                <au-marker class="au"></au-marker> 
              </td>
              <td class="au">
              </td>
            </tr>
          `,
          instructions: [
            [ { type: TargetedInstructionType.textBinding, src: 'dbname' } ],
            [ { type: TargetedInstructionType.textBinding, src: 'nbQueries' } ],
            [
              {
                type: TargetedInstructionType.hydrateTemplateController,
                res: 'repeat',
                src: {
                  cache: "*",
                  template: `
                  <td>
                    <au-marker class="au"></au-marker>
                    <div class="popover left">
                      <div class="popover-content">
                        <au-marker class="au"></au-marker> 
                      </div>
                      <div class="arrow"></div>
                    </div>
                  </td>
                  `,
                  instructions: [
                    [ { type: TargetedInstructionType.textBinding, src: 'formatElapsed' } ],
                    [ { type: TargetedInstructionType.textBinding, src: 'query' } ]
                  ]
                },
                instructions: [
                  { type: TargetedInstructionType.toViewBinding, src: 'topFiveQueries', dest: 'items' },
                  { type: TargetedInstructionType.setProperty, value: 'q', dest: 'local' },
                  { type: TargetedInstructionType.setProperty, value: false, dest: 'visualsRequireLifecycle' }
                ]
              }
            ]
          ]
        },
        instructions: [
          { type: TargetedInstructionType.toViewBinding, src: 'databases', dest: 'items' },
          { type: TargetedInstructionType.setProperty, value: 'db', dest: 'local' },
          { type: TargetedInstructionType.setProperty, value: false, dest: 'visualsRequireLifecycle' }
        ]
      }
    ]
  ],
  surrogates: []
};
