<template lang="pug">
.files
  .files__url(
    v-for="url in urls"
    @click="loadUrl(url)"
  )
    span.files__name {{ url.name }}
    span.files__extention URL

  .files__calendar(
    v-for="calendar in calendars"
    @click="selectCalendar(calendar)"
  )
    span.files__name {{ calendar.calName.value }}
    span.files__extention ICS
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['calendars', 'urls'])
  },

  methods: {
    async loadUrl (url) {
      this.$emit('onLoad')
      this.$store.dispatch('loadUrls', [url.url])
    },

    selectCalendar (calendar) {
      this.$store.dispatch('selectCalendars', [calendar])
      this.$emit('onLoad')
    }
  }
}
</script>

<style lang="scss">
.files {
  &__calendar,
  &__url {
    cursor: pointer;
    user-select: none;
    border-bottom: solid 1px black;
    display: flex;

    span {
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

  &__name {
    width: 100%;
    padding: 0.5em 0;
  }

  &__extention {
    width: 20%;
    text-align: center;
    padding: 0.5em;
    border-left: solid 1px black;
  }
}
</style>
