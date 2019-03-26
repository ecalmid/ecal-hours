<template lang="pug">
.app(
  @dragstart="onDragOver"
  @dragover="onDragOver"
  @dragleave="onDragLeave"
  @drop="onDrop"
)
  .app__head(
    :class="headModifierClasses"
  )
    h1.app__title Hours
    h5.app__infos Click or drag a file [.ics] on the page
    input.app__input(
      ref="fileInput"
      type="file"
      accept=".ics"
      @change="onFileInput"
      multiple
    )

  ul.summary(
    v-if="totalHours > 0"
  )
    li.summary__item(
      v-for="(item, key) in summary"
    )
      h5.summary__item-title {{ `${key.toUpperCase()} [${item.number} events]` }}
      p.summary__item--total.summary__item--bold {{ `${item.total}h` }}

    li.summary__item
      h5.summary__item-title.summary__item--bold.summary__item--big Total Hours
      p.summary__item-total.summary__item--bold.summary__item--big {{ `${totalHours}h` }}

    li.summary__item
      h5.summary__item-title.summary__item--bold.summary__item--big Total Days
      p.summary__item-total.summary__item--bold.summary__item--big {{ `${(totalHours / 8).toFixed(2)}` }}

    li.summary__item
      h5.summary__item-title.summary__item--bold.summary__item--big Rate
      p.summary__item-total.summary__item--bold.summary__item--big {{ rate }}
</template>

<script>
import { icsToJson } from '@/utils/ics'
import * as moment from 'moment'
// import {RRule} from 'rrule'

export default {
  name: 'app',

  data () {
    return {
      totalHours: 0,
      summary: {},
      isInputHighlighted: false,
      isInputHovered: false,
      isInputWrong: false,
      fulTimeHours: 1920
    }
  },

  computed: {
    headModifierClasses () {
      return {
        'app--highlight': this.isInputHighlighted,
        'app--over': this.isInputHovered,
        'app--error': this.isInputWrong
      }
    },

    rate () {
      return `${((this.totalHours / this.fulTimeHours) * 100).toFixed(2)}%`
    }
  },

  methods: {
    onDragOver (e) {
      e.preventDefault()
      e.stopPropagation()
      this.isInputHighlighted = false
      this.isInputHovered = true
    },

    onDragLeave (e) {
      e.preventDefault()
      e.stopPropagation()
      this.isInputHighlighted = false
      this.isInputHovered = false
    },

    onDrop (e) {
      this.isInputHovered = false
    },

    async onFileInput () {
      const { fileInput } = this.$refs
      const { files } = fileInput
      this.resetData()
      for (const file of files) {
        const { name } = file
        if (name.indexOf('.ics') > 0) {
          try {
            const icsText = await this.readFromFile(file)
            const icsJSON = icsToJson(icsText)
            const { events } = icsJSON

            this.computeHours(events)
            this.isInputWrong = false
            this.isInputHighlighted = true
          } catch (e) {
            console.error(e)
            this.isInputWrong = true
          }
        } else {
          console.error('ERROR: Can\'t load this file.')
          this.isInputWrong = true
        }
      }
    },

    async readFromFile (file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = e => {
          const { target } = e
          const { result } = target
          // Decode base64
          resolve(this.b64DecodeUnicode(result.split(',').pop()))
        }
        reader.onerror = e => reject(e)
        reader.readAsDataURL(file)
      })
    },

    resetData () {
      this.totalHours = 0
      this.summary = {}
    },

    computeHours (events) {
      for (const event of events) {
        const { startDate, endDate, summary } = event
        if (!this.summary[summary.value]) {
          this.summary[summary.value] = {
            total: 0,
            number: 0
          }
        }

        const start = moment(startDate.value.trim().toUpperCase())
        const end = moment(endDate.value.trim().toUpperCase())

        // Take minutes in count
        const diffHours = end.diff(start, 'minutes')
        this.totalHours += diffHours / 60
        this.summary[summary.value].total += diffHours / 60
        this.summary[summary.value].number++
      }
    },

    b64DecodeUnicode (string) {
      return decodeURIComponent(atob(string).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
    }
  }
}
</script>

<style lang="scss">
// RESET
* {
  box-sizing: border-box;
}

html {
  font-size: 16px;
}

html, body {
  margin: 0;
}

h1, h2, h3, h4, h5, p, a, li, ul {
  margin: 0;
  padding: 0;
  color: black;
  text-decoration: none;
  list-style: none;
  font-size: 1em;
  font-weight: normal;
  line-height: 1;
}

// STYLE
.app {
  font-family: Arial;

  &__head {
    padding: 0.5rem;
    border-bottom: solid 1px;
  }

  &__title {
    font-weight: bold;
    font-size: 2em;
  }

  &__infos {
    font-size: 1em;
  }

  &__title,
  &__infos {
    color: inherit;
  }

  &--highlight {
    color: rgb(0, 255, 0);
  }

  &--over {
    color: rgb(200, 200, 200);
  }

  &--error {
    color: rgb(255, 0, 0);
  }

  &__file-text {
    pointer-events: none;
  }

  &__file-label {
    pointer-events: none;
    font-weight: bold;
  }

  &__input {
    cursor: pointer;
    position: absolute;
    opacity: 0;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
}

.summary {
  &__item,
  &__foot-item {
    color: black;
    display: flex;
    padding: 0.5rem;
    border-bottom: solid 1px;

    &-title {
      color: inherit;
      width: 40%;
      max-width: 450px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding: 0.5em 0;
      margin: -0.5em 0;
    }

    @media screen and (max-width: 600px) {
    &-title {
        width: 100%;
        max-width: 100%;
      }
    }

    &--bold {
      font-weight: bold;
    }

    &--big {
      font-size: 2em;
    }
  }

  &__foot {
    font-size: 2em;
  }
}
</style>
