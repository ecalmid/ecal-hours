import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import PouchDB from 'pouchdb'
import PouchDBFind from 'pouchdb-find'
import { icsToJson } from '@/utils/ics'
import { getEventDuration, getGroupsForEvents } from '@/utils/events'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    isLoading: false,
    fullTimeHours: 1867.5,
    urls: [],
    calendars: [],
    selectedCalendars: []
  },

  getters: {
    isLoading ({ isLoading }) {
      return isLoading
    },

    calendars ({ calendars }) {
      return calendars
    },

    urls ({ urls }) {
      return urls
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

    fullTimeHours ({ fullTimeHours }) {
      return fullTimeHours
    },

    totalHours (state, getters) {
      const groups = Object.values(getters.selectedEventsByGroups)
      return groups.reduce((totalHours, group) => {
        const { events } = group
        return totalHours + events.reduce((totalHours, event) => {
          return totalHours + getEventDuration(event, 'minutes') / 60
        }, 0)
      }, 0)
    }
  },

  mutations: {
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

    removeFile (state, file) {
      const { calendars } = state
      const { calName: newCalName } = file

      const index = calendars.findIndex(({ calName }) => {
        return calName.value === newCalName.value
      })

      calendars.splice(index, 1)
    },

    addUrl (state, url) {
      const { urls } = state

      const urlIndex = urls.findIndex(({ name }) => {
        return name === url.name
      })

      if (urlIndex > -1) {
        urls.splice(urlIndex, 1)
      }

      urls.push(url)
    },

    removeUrl (state, url) {
      const { urls } = state

      const index = urls.findIndex(({ name }) => {
        return name === url.name
      })

      urls.splice(index, 1)
    },

    resetState (state) {
      state.selectedCalendars = []
    },

    setLoadingState (state, isLoading) {
      state.isLoading = isLoading
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

    async removeFiles ({ commit }, files) {
      for (const file of files) {
        const { calName } = file
        const { docs } = await db.find({ selector: { _id: calName.value } })
        const [foundFile = {}] = docs

        await db.remove(foundFile)
        commit('removeFile', foundFile)
      }
    },

    selectCalendars ({ getters, commit }, calendars) {
      for (const calendar of calendars) {
        const { calName } = calendar
        const existingCalendar = getters.getCalendarByName(calName.value)
        commit('selectCalendar', existingCalendar)
      }
    },

    async addUrls ({ commit }, urls) {
      for (const newUrl of urls) {
        const { docs } = await db.find({ selector: { _id: newUrl.name } })
        const [foundUrl = {}] = docs

        const url = {
          ...newUrl,
          ...foundUrl,
          _id: newUrl.name,
          type: 'url'
        }

        await db.put(url)
        commit('addUrl', url)
      }
    },

    async removeUrls ({ commit }, urls) {
      for (const url of urls) {
        const { docs } = await db.find({ selector: { _id: url.name } })
        const [foundUrl = {}] = docs

        await db.remove(foundUrl)
        commit('removeUrl', foundUrl)
      }
    },

    async loadUrls ({ commit, dispatch }, urls) {
      const formatUrl = (url) => url.replace('webcal://', 'http://')

      const requests = urls
        .map(formatUrl)
        .map(axios.get)

      try {
        const responses = await Promise.all(requests)
        const icsTexts = responses.map(({ data }) => data)
        const calendars = icsTexts.map(icsToJson)

        await dispatch('addUrls', calendars.map((calendar, index) => {
          const { calName } = calendar
          const url = urls[index]
          return { name: calName.value, url }
        }))

        for (const calendar of calendars) {
          commit('selectCalendar', calendar)
        }
      } catch (error) {
        throw error
      }
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

  const { docs: urls } = await db.find({ selector: { type: 'url' } })
  await store.dispatch('addUrls', urls)

  const { docs: calendars } = await db.find({ selector: { type: 'calendar' } })
  await store.dispatch('addCalendars', calendars)
}

initializeDB()

export default store
