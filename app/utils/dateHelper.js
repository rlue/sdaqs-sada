import moment from 'moment';

// eslint-disable-next-line import/prefer-default-export
export function humanMonthRange(range) {
  switch (true) {
    case range === null:
      return 'No dates selected';
    case !(range instanceof Array)
      || range.length !== 2
      || !range.every((m) => moment.isMoment(m)):
      throw new TypeError('invalid argument ([moment(), moment()])');
    case range[0].isSame(range[1], 'month'):
      return range[0].format('MMM YYYY');
    case range[0].isSame(range[1], 'year'):
      return `${range[0].format('MMM')}–${range[1].format('MMM YYYY')}`;
    default:
      return range.map((date) => date.format('MMM YYYY')).join('–');
  }
}
