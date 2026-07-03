import dayJs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'

dayJs.extend(duration)
dayJs.extend(relativeTime)

export default dayJs
