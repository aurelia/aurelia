import { valueConverter } from '@aurelia/runtime';
import * as format from 'date-fns/format';
@valueConverter({ name: 'date' })
export class DateValueConverter {
  /*
  * "2017-07-27T07:01:19.644Z"
  * into
  * "July 27, 2017"
  */
  public toView(value: Date | string | number) {
    return value;
    //   return format(
    //     value,
    //     'MMMM D, YYYY',
    //   );
  }
}
