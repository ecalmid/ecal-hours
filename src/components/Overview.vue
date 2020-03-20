<template lang="pug">
  ul.overview
    li.overview__item.overview__item--reverse
      h5.overview__item-title.overview__item--bold.overview__item--big Enter Rate
      p.overview__item-rate.overview__item--bold.overview__item--big(
        contenteditable="true"
        @keydown.enter.prevent
        v-contenteditable="rate"
      )
      span.overview__item-arrow.overview__item--bold.overview__item--big →
      span.overview__item-hours-rate.overview__item--bold.overview__item--big {{ hoursByRate }}

    template(v-for="(group, key) in eventGroups")
      li.overview__item.overview__item--selectable(
        :class="getGroupCssClasses(group)"
        @click="toggleGroup(group)"
      )
        h5.overview__item-title {{ `${key.toUpperCase()} [${getGroupCount(group)} events]` }}
        p.overview__item--total.overview__item--bold {{ `${getGroupTotal(group)}h` }}

      ul.overview__sub-items
        li.overview__sub-item(
          v-if="showGroup(group)"
          v-for="event of group.events"
        )
          span.overview__sub-item-dates {{ getFormattedEventDate(event) }}
          span.overview__sub-item-hours {{ getFormattedEventHours(event) }}
          span.overview__sub-item-duration {{ getFormattedEventDuration(event) }}
          .overview__sub-item-total(
            @click="toggleEventTotal(event)"
          )
            span(v-if="showEventTotal(event)") {{ getFormattedEventTotal(group.events, event) }}
            span(v-else) Show Total

    li.overview__item.overview__item--reverse
      h5.overview__item-title -

    li.overview__item
      h5.overview__item-title.overview__item--bold.overview__item--big Total Hours
      p.overview__item-total.overview__item--bold.overview__item--big {{ `${totalHours}h` }}

    li.overview__item.overview__item--reverse
      h5.overview__item-title.overview__item--bold Total Hours Left
      p.overview__item-total.overview__item--bold {{ `${totalHoursLeft}h` }}

    li.overview__item
      h5.overview__item-title.overview__item--bold.overview__item--big Total Days
      p.overview__item-total.overview__item--bold.overview__item--big {{ totalDays }}

    li.overview__item.overview__item--reverse
      h5.overview__item-title.overview__item--bold Total Days Left
      p.overview__item-total.overview__item--bold {{ totalDaysLeft }}

    li.overview__item
      h5.overview__item-title.overview__item--bold.overview__item--big Actual Rate
      p.overview__item-total.overview__item--bold.overview__item--big {{ totalRate }}
</template>

<script>
import { mapGetters } from 'vuex'
import { getEventMoments, getEventDuration } from '@/utils/event'

export default {
  data () {
    return {
      shownGroups: [],
      shownEventTotals: [],
      initialRateValue: 100,
      rateValue: 100
    }
  },

  computed: {
    ...mapGetters(['eventGroups', 'totalHours', 'fullTimeHours']),

    rate: {
      get () {
        return this.rateValue ? this.rateValue : this.initialRateValue
      },

      set (value) {
        this.rateValue = value.trim().length === 0
          ? this.initialRateValue
          : value
      }
    },

    hoursByRate () {
      return `${this.fullTimeHours * this.percentRate}h`
    },

    percentRate () {
      return parseFloat(this.rate) / 100
    },

    rateHours () {
      return this.fullTimeHours * this.percentRate
    },

    totalRate () {
      return `${((this.totalHours / this.fullTimeHours) * 100).toFixed(2)}%`
    },

    totalDays () {
      return `${(this.totalHours / 8).toFixed(2)}`
    },

    totalHoursLeft () {
      return this.rateHours - this.totalHours
    },

    totalDaysLeft () {
      return (this.totalHoursLeft / 8).toFixed(0)
    }
  },

  methods: {
    toggleGroup (group) {
      const index = this.shownGroups.indexOf(group)
      if (index > -1) {
        this.shownGroups.splice(index, 1)
      } else {
        this.shownGroups.push(group)
      }
    },

    showGroup (group) {
      return this.shownGroups.indexOf(group) > -1
    },

    toggleEventTotal (event) {
      const index = this.shownEventTotals.indexOf(event)
      if (index > -1) {
        this.shownEventTotals.splice(index, 1)
      } else {
        this.shownEventTotals.push(event)
      }
    },

    showEventTotal (event) {
      return this.shownEventTotals.indexOf(event) > -1
    },

    getGroupCssClasses (group) {
      return {
        'overview__item--highlight': this.showGroup(group)
      }
    },

    getGroupCount (group) {
      return group.events.length
    },

    getGroupTotal (group) {
      const { events } = group
      return events.reduce((total, event) => {
        return total + getEventDuration(event, 'minutes') / 60
      }, 0)
    },

    getFormattedEventDate (event) {
      const { start, end } = getEventMoments(event)
      const startDate = start.format('DD.MM.YYYY')
      const endDate = end.format('DD.MM.YYYY')
      return startDate !== endDate
        ? `${startDate} - ${endDate}`
        : startDate
    },

    getFormattedEventHours (event) {
      const { start, end } = getEventMoments(event)
      return `${start.format('HH:mm')} - ${end.format('HH:mm')}`
    },

    getFormattedEventDuration (event) {
      const duration = getEventDuration(event, 'minutes') / 60
      const hours = Math.floor(duration)
      const minutes = (duration - hours) * 60
      return `${hours ? `${hours}h` : ''}${minutes ? `${minutes}m` : ''}`
    },

    getFormattedEventTotal (events, eventTarget) {
      const targetIndex = events.indexOf(eventTarget)
      const hoursToEvent = events
        .filter((event, eventIndex) => eventIndex <= targetIndex)
        .reduce((total, event, index) => {
          return total + getEventDuration(event, 'minutes') / 60
        }, 0)

      const hours = Math.floor(hoursToEvent)
      const minutes = (hoursToEvent - hours) * 60
      return `${hours ? `${hours}h` : ''}${minutes ? `${minutes}m` : ''}`
    }
  }
}
</script>

<style lang="scss">
.overview {
  &__item,
  &__sub-item,
  &__foot-item {
    color: black;
    display: flex;
    padding: 0.5rem;
    border-bottom: solid 1px;

    &-title {
      color: inherit;
      width: 50%;
      max-width: 500px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding: 0.5rem 0;
      margin: -0.5rem 0;
    }

    &-total {
      color: inherit;
    }

    &-rate {
      border-bottom: solid 1px;
      color: white;

      &:focus {
        outline: none;
      }

      &::after {
        content: '%'
      }
    }

    &-arrow {
      margin: 0 0.5em;
    }

    @media screen and (max-width: 600px) {
      &-title {
        width: 100%;
        max-width: 100%;
      }
    }

    &--reverse {
      background-color: black;
      color: white;
    }

    &--bold {
      font-weight: bold;
    }

    &--big {
      font-size: 2em;
    }
  }

  &__item {
    &--highlight {
      background-color: black;
      color: white;
    }

    &--selectable {
      user-select: none;
      cursor: pointer;

      &:hover {
        background-color: black;
        color: white;
      }
    }
  }

  &__sub-item {
    border-color: grey;
    border-bottom-style: dashed;

    &:last-child {
      border-bottom-style: solid;
      border-color: black;
    }

    span {
      color: grey;
    }

    &-dates {
      width: 50%;
      max-width: 500px;
    }

    &-hours {
      width: 25%;
    }

    &-duration {
      width: 12.5%;
    }

    &-total {
      width: 12.5%;
      cursor: pointer;
      user-select: none;

      &:hover {
        span {
          color: black;
        }
      }
    }
  }

  &__foot {
    font-size: 2em;
  }
}
</style>
