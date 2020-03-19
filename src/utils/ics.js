import { camelize } from './string'
import { cloneObject } from './objects'
import { RRule } from 'rrule'
import * as moment from 'moment'

const NEW_LINE = /\r\n|\n|\r/
const START_CALENDAR = 'BEGIN:VCALENDAR'
const END_CALENDAR = 'END:VCALENDAR'
const START_EVENT = 'BEGIN:VEVENT'
const END_EVENT = 'END:VEVENT'

const MAPPED_PROPERTIES = {
  dtstart: 'startDate',
  dtend: 'endDate',
  dtstamp: 'stamp',
  rrule: 'rule',
  xWrTimezone: 'timezone',
  xWrCalname: 'calName',
  xLicLocation: 'location'
}

function mapIcsProperties (property) {
  for (const [key] of Object.entries(MAPPED_PROPERTIES)) {
    if (property.indexOf(key) > -1) {
      return MAPPED_PROPERTIES[key]
    }
  }

  return property
}

function clean (string) {
  return unescape(string)
}

export function icsToJson (icsString) {
  const json = {
    events: []
  }

  let currentObject = null
  const lines = icsString.split(NEW_LINE)

  for (const line of lines) {
    const [property, value] = line.split(':')

    if (value && property) {
      const formattedProperty = camelize(property.toLowerCase())
      const formattedValue = camelize(value.toLowerCase())

      switch (line) {
        case START_CALENDAR:
          currentObject = json
          break
        case END_CALENDAR:
          break

        case START_EVENT:
          const newEvent = {}
          currentObject = newEvent
          break
        case END_EVENT:
          const { tzid } = json
          const { startDate, rule } = currentObject
          // Clone events according to rules
          if (rule) {
            // Format values
            const fTzid = tzid.rawValue.replace(':', '=')
            const fStartDate = startDate.value.toUpperCase()
            const fRule = rule.rawValue
            const ruleString = `DTSTART;${fTzid}:${fStartDate}\n${fRule}`
            const rules = RRule.fromString(ruleString).all()

            // Add as many events as it repeat itself
            for (let i = 0; i < rules.length; i++) {
              json.events.push(cloneObject(currentObject))
            }
          } else {
            json.events.push(currentObject)
          }
          break

        default:
          currentObject[mapIcsProperties(formattedProperty)] = {
            value: clean(formattedValue),
            rawValue: line
          }
          break
      }
    }
  }

  json.events = json.events.sort((a, b) => {
    const startA = moment(a.startDate.value.trim().toUpperCase())
    const startB = moment(b.startDate.value.trim().toUpperCase())
    return startA.unix() - startB.unix()
  })

  return json
}
