<template lang="pug">
.files
  .files__items(@click="resetSelection")
    .files__url(
      v-for="url in urls"
      :class="getItemCssClasses(url)"
      @click.stop="toggleUrl(url)"
    )
      span.files__name {{ url.name }}
      span.files__extention URL

    .files__calendar(
      v-for="calendar in calendars"
      :class="getItemCssClasses(calendar)"
      @click.stop="toggleFile(calendar)"
    )
      span.files__name {{ calendar.calName.value }}
      span.files__extention ICS

  .files__footer(
    v-if="showLoadItems"
  )
    span(
      @click="loadSelectedFiles()"
    ) Load
    span(
      @click="removeSelectedFiles()"
    ) Remove
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
        this.$store.commit('setLoadingState', true)
        await Promise.all([
          this.$store.dispatch('loadUrls', urls),
          this.$store.dispatch('selectCalendars', files)
        ])

        this.$emit('onLoad')
        this.$store.commit('setLoadingState', false)
      } catch (error) {
        this.$emit('onError', error)
      }
    },

    async removeSelectedFiles () {
      await Promise.all([
        this.$store.dispatch('removeUrls', this.selectedUrls),
        this.$store.dispatch('removeFiles', this.selectedFiles)
      ])
    },

    toggleUrl (url) {
      this.selectedUrls = toggleItemFromArray(this.selectedUrls, url)
    },

    toggleFile (file) {
      this.selectedFiles = toggleItemFromArray(this.selectedFiles, file)
    },

    resetSelection () {
      this.selectedUrls = []
      this.selectedFiles = []
    }
  }
}
</script>

<style lang="scss">
.files {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;

  &__items {
    height: 100%;
  }

  &__calendar,
  &__url {
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
    padding: 0;
    display: flex;
    justify-content: space-between;
    border-top: solid 1px black;
    background-color: black;
    color: white;

    span {
      padding: 0.5em;
      display: inline-block;
      width: 50%;
      text-transform: uppercase;
      cursor: pointer;

      &:hover {
        background-color: rgb(0, 255, 0);
        color: white;
      }
    }

    span + span {
      border-left: solid 1px white;
      text-align: right;

      &:hover {
        background-color: rgb(255, 0, 0);
        color: white;
      }
    }
  }

  &--selected {
    background-color: black !important;
    color: white;
  }
}
</style>
