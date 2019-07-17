import * as format from 'date-fns/format'
import { valueConverter } from '@aurelia/runtime';

@valueConverter({ name: 'date' })
export class DateValueConverter {
  /*
  * "2017-07-27T07:01:19.644Z"
  * into
  * "July 27, 2017"
  */
  toView(value: Date | string | number) {
    return format(
      value,
      'MMMM D, YYYY'
    )
  }
}

