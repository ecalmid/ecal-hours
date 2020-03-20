import * as moment from 'moment'

export function getEventSummary (event) {
  const defaultSummary = { value: 'Undefined event' }
  const summaryKey = Object.keys(event).find((it) => it.includes('summary'))
  return event[summaryKey] || defaultSummary
}

export function getEventMoments (event) {
  const { startDate, endDate } = event
  const start = moment(startDate.value.trim().toUpperCase())
  const end = moment(endDate.value.trim().toUpperCase())
  return { start, end }
}

export function getEventDuration (event, unit = 'minutes') {
  const { start, end } = getEventMoments(event)
  return end.diff(start, unit)
}

export function getGroupsForEvents (events) {
  return events.reduce((groups, event) => {
    const { startDate, endDate } = event
    const { value: summary } = getEventSummary(event)

    if (startDate && endDate) {
      if (!groups[summary]) {
        groups[summary] = {
          hours: 0,
          events: []
        }
      }

      groups[summary].events.push(event)
    }

    return groups
  }, {})
}
