import format from 'date-fns/format'

export class DateValueConverter {
  /*
  * "2017-07-27T07:01:19.644Z"
  * into
  * "July 27, 2017"
  */
  toView(value) {
    return format(
      value,
      'MMMM D, YYYY'
    )
  }
}

