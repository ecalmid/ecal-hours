import Vue from 'vue'
import Vuex from 'vuex'
import { getEventDuration } from '@/utils/event'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    fullTimeHours: 1867.5,
    eventGroups: {}
  },

  getters: {
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

    resetState (state) {
      state.eventGroups = {}
    }
  }
})

export default store
