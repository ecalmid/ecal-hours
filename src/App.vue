<template lang="pug">
main.app(
  @dragenter="onDragOver"
  @dragstart="onDragOver"
  @dragover="onDragOver"
  @dragleave="onDragLeave"
  @drop="onDrop"
)
  header.head(
    :class="headModifierClasses"
  )
    h1.head__title Hours
    .head__close(
      v-if="totalHours > 0"
      @click="resetData"
    )
      span ✕

  section.dropzone(
    v-if="totalHours === 0"
  )
    .dropzone__inner
      span Click here or drag and drop some file [.ics]
      input.dropzone__input(
        ref="fileInput"
        type="file"
        accept=".ics"
        @change="onFileInput"
        multiple
      )

  ul.summary(
    v-else
  )
    li.summary__item.summary__item--reverse
      h5.summary__item-title.summary__item--bold.summary__item--big Enter Rate
      p.summary__item-rate.summary__item--bold.summary__item--big(
        contenteditable="true"
        v-contenteditable="rate"
      )

    li.summary__item(
      v-for="(item, key) in summary"
    )
      h5.summary__item-title {{ `${key.toUpperCase()} [${item.number} events]` }}
      p.summary__item--total.summary__item--bold {{ `${item.total}h` }}

    li.summary__item.summary__item--reverse
      h5.summary__item-title -

    li.summary__item
      h5.summary__item-title.summary__item--bold.summary__item--big Total Hours
      p.summary__item-total.summary__item--bold.summary__item--big {{ `${totalHours}h` }}

    li.summary__item.summary__item--reverse
      h5.summary__item-title.summary__item--bold Total Hours Left
      p.summary__item-total.summary__item--bold {{ `${totalHoursLeft}h` }}

    li.summary__item
      h5.summary__item-title.summary__item--bold.summary__item--big Total Days
      p.summary__item-total.summary__item--bold.summary__item--big {{ totalDays }}

    li.summary__item.summary__item--reverse
      h5.summary__item-title.summary__item--bold Total Days Left
      p.summary__item-total.summary__item--bold {{ totalDaysLeft }}

    li.summary__item
      h5.summary__item-title.summary__item--bold.summary__item--big Actual Rate
      p.summary__item-total.summary__item--bold.summary__item--big {{ totalRate }}
</template>

<script>
import { icsToJson } from '@/utils/ics'
import * as moment from 'moment'
import { b64ToString } from '@/utils/string'

export default {
  name: 'app',

  data () {
    return {
      totalHours: 0,
      initialRateValue: 100,
      rateValue: 100,
      summary: {},
      isInputHovered: false,
      isInputWrong: false,
      fullTimeHours: 1920
    }
  },

  computed: {
    headModifierClasses () {
      return {
        'head--over': this.isInputHovered,
        'head--error': this.isInputWrong
      }
    },

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
    onDragOver (e) {
      this.isInputHovered = true
    },

    onDragLeave (e) {
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
          resolve(b64ToString(result.split(',').pop()))
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
  min-height: 100vh;
}

body {
  display: flex;
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
  display: flex;
  flex-flow: column;
  flex-wrap: nowrap;
  width: 100%;
  font-family: Arial;
}

.head {
  display: flex;
  flex: 0 0 auto;
  width: 100%;
  padding: 0.5rem;
  background: black;
  color: white;
  border-bottom: solid 1px;

  &--over {
    background: rgb(200, 200, 200);
  }

  &--error {
    background: rgb(255, 0, 0);
  }

  &__title,
  &__close {
    font-weight: bold;
    font-size: 2em;
    line-height: 1;
    color: inherit;
  }

  &__title {
    width: 100%;
  }

  &__close {
    cursor: pointer;
    user-select: none;
  }
}

.dropzone {
  display: block;
  width: 100%;
  height: 100%;
  padding: 0.5em;

  &__inner {
    width: 100%;
    height: 100%;
    border: dashed 1px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__input {
    cursor: pointer;
    opacity: 0;
    position: absolute;
    top: 0;
    left: 0;
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

  &__foot {
    font-size: 2em;
  }
}
</style>
