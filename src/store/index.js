import Vue from 'vue'
import Vuex from 'vuex'
import PouchDB from 'pouchdb'
import PouchDBFind from 'pouchdb-find'
import { getEventDuration, getGroupsForEvents } from '@/utils/events'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    fullTimeHours: 1867.5,
    eventGroups: {},
    calendars: [],
    selectedCalendars: []
  },

  getters: {
    calendars ({ calendars }) {
      return calendars
    },

    getCalendarByName: (state) => (name) => {
      const { calendars } = state
      return calendars.find((calendar) => {
        const { calName } = calendar
        return calName.value === name
      })
    },

    selectedCalendars ({ selectedCalendars }) {
      return selectedCalendars
    },

    selectedEventsByGroups: (state) => {
      const { selectedCalendars } = state
      const events = selectedCalendars
        .filter((calendar) => calendar)
        .map(({ events }) => events)
        .flat()

      return getGroupsForEvents(events)
    },

    eventGroups ({ eventGroups }) {
      return eventGroups
    },

    fullTimeHours ({ fullTimeHours }) {
      return fullTimeHours
    },

    totalHours ({ eventGroups }) {
      const groups = Object.values(eventGroups)
      return groups.reduce((totalHours, group) => {
        const { events } = group
        return totalHours + events.reduce((totalHours, event) => {
          return totalHours + getEventDuration(event, 'minutes') / 60
        }, 0)
      }, 0)
    }
  },

  mutations: {
    setEventGroups (state, eventGroups) {
      state.eventGroups = eventGroups
    },

    addEventGroup (state, group) {
      const { key, value } = group
      state.eventGroups[key] = value
    },

    addCalendar (state, calendar) {
      const { calendars } = state
      const { calName: newCalName } = calendar

      const calendarIndex = calendars.findIndex(({ calName }) => {
        return calName.value === newCalName.value
      })

      if (calendarIndex > -1) {
        calendars.splice(calendarIndex, 1)
      }

      calendars.push(calendar)
    },

    selectCalendar (state, calendar) {
      state.selectedCalendars.push(calendar)
    },

    resetState (state) {
      state.selectedCalendars = []
    }
  },

  actions: {
    async addCalendars ({ commit }, calendars) {
      for (const newCalendar of calendars) {
        const { calName } = newCalendar

        const { docs } = await db.find({ selector: { _id: calName.value } })
        const [foundCalendar = {}] = docs

        const calendar = {
          ...foundCalendar,
          ...newCalendar,
          _id: calName.value,
          type: 'calendar'
        }

        await db.put(calendar)
        commit('addCalendar', calendar)
      }
    },

    selectCalendars ({ getters, commit }, calendars) {
      for (const calendar of calendars) {
        const { calName } = calendar
        const existingCalendar = getters.getCalendarByName(calName.value)
        commit('selectCalendar', existingCalendar)
      }
    },

    async setEventGroups ({ commit }, groups) {
      const { content } = groups
      await db.put({
        _id: new Date().toISOString(),
        ...content
      })

      commit('setEventGroups', groups)
    }
  }
})

PouchDB.plugin(PouchDBFind)
const db = new PouchDB('hours')

async function initializeDB () {
  await db.createIndex({
    index: {
      fields: ['_id', 'type']
    }
  })

  const { docs: calendars } = await db.find({ selector: { type: 'calendar' } })
  store.dispatch('addCalendars', calendars)
}

initializeDB()

export default store
