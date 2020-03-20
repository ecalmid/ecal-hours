<template lang="pug">
.files
  .files__calendar(
    v-for="calendar in calendars"
    @click="selectCalendar(calendar)"
  )
    h1 {{ calendar.calName.value }}
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['calendars'])
  },

  methods: {
    selectCalendar (calendar) {
      this.$store.dispatch('selectCalendars', [calendar])
    }
  }
}
</script>

<style lang="scss">
.files {
  &__calendar {
    cursor: pointer;
    user-select: none;
    border-bottom: solid 1px black;
    padding: 0.5em 0;

    h1 {
      text-transform: uppercase;
    }

    &:first-child {
      border-top: solid 1px black;
    }

    &:hover {
      background-color: black;
      color: white;
    }
  }
}
</style>
