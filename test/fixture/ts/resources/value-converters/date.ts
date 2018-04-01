import moment from "moment";

export class DateValueConverter {
  /*
  * "2017-07-27T07:01:19.644Z"
  * into
  * "July 27, 2017"
  */
  public toView(value: string): string {
    return moment(value).format("MMMM D, YYYY");
  }
}
