<template lang="pug">
.files
  .files__url(
    v-for="url in urls"
    :class="getItemCssClasses(url)"
    @click="toggleUrl(url)"
  )
    span.files__name {{ url.name }}
    span.files__extention URL

  .files__calendar(
    v-for="calendar in calendars"
    :class="getItemCssClasses(calendar)"
    @click="toggleFile(calendar)"
  )
    span.files__name {{ calendar.calName.value }}
    span.files__extention ICS

  .files__footer(
    v-if="showLoadItems"
    @click="loadSelectedFiles()"
  )
    span Load selected files
</template>

<script>
import { mapGetters } from 'vuex'
import { toggleItemFromArray } from '@/utils/array'

export default {
  data () {
    return {
      selectedUrls: [],
      selectedFiles: []
    }
  },

  computed: {
    ...mapGetters(['calendars', 'urls']),

    selectedItems () {
      return [
        ...this.selectedUrls,
        ...this.selectedFiles
      ]
    },

    showLoadItems () {
      return this.selectedItems.length > 0
    }
  },

  methods: {
    isSelected (item) {
      return this.selectedItems.indexOf(item) > -1
    },

    getItemCssClasses (item) {
      return {
        'files--selected': this.isSelected(item)
      }
    },

    async loadSelectedFiles () {
      const urls = this.selectedUrls.map((it) => it.url)
      const files = this.selectedFiles

      try {
        await Promise.all([
          this.$store.dispatch('loadUrls', urls),
          this.$store.dispatch('selectCalendars', files)
        ])

        this.$emit('onLoad')
      } catch (error) {
        this.$emit('onError', error)
      }
    },

    toggleUrl (url) {
      this.selectedUrls = toggleItemFromArray(this.selectedUrls, url)
    },

    toggleFile (file) {
      this.selectedFiles = toggleItemFromArray(this.selectedFiles, file)
    }
  }
}
</script>

<style lang="scss">
.files {
  display: flex;
  flex-direction: column;

  &__calendar,
  &__url,
  &__footer {
    cursor: pointer;
    user-select: none;
    border-bottom: solid 1px black;
    display: flex;
    padding-left: 0.5rem;
    height: 2em;
    box-sizing: border-box;

    span {
      text-transform: uppercase;
    }

    &:hover {
      background-color: grey;
      color: white;
    }
  }

  &__name {
    width: 100%;
    padding: 0.5em 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__extention {
    width: 20%;
    text-align: center;
    padding: 0.5em 0;
    border-left: solid 1px black;
    flex: 0 0 auto;
  }

  &__footer {
    padding: 0.5em 0;
    padding-left: 0.5em;
  }

  &--selected {
    background-color: black !important;
    color: white;
  }
}
</style>
