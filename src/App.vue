<template lang="pug">
main.app(
  @click="showDisclamer = false"
  @dragenter="onDragOver"
  @dragstart="onDragOver"
  @dragover="onDragOver"
  @dragleave="onDragLeave"
  @drop="onDrop"
)
  disclamer(
    v-if="showDisclamer"
  )

  header.head(
    :class="headModifierClasses"
  )
    h1.head__title Hours
    .head__close(
      v-if="showOverview"
      @click="reset"
    )
      span Clear ✕

  overview(v-if="showOverview")
  loader(v-else)

</template>

<script>
import { mapGetters } from 'vuex'
import Disclamer from '@/components/Disclamer'
import Loader from '@/components/Loader'
import Overview from '@/components/Overview'

export default {
  name: 'app',

  components: { Disclamer, Loader, Overview },

  data () {
    return {
      showDisclamer: true,
      totalHours: 0,
      initialRateValue: 100,
      rateValue: 100,
      summary: {},
      isInputHovered: false,
      isInputWrong: false,
      fullTimeHours: 1867.5,
      shownItems: [],
      shownSubItemsTotals: []
    }
  },

  computed: {
    ...mapGetters(['eventGroups']),

    showOverview () {
      return Object.values(this.eventGroups).length > 0
    },

    headModifierClasses () {
      return {
        'head--over': this.isInputHovered,
        'head--error': this.isInputWrong
      }
    }
  },

  methods: {
    onDragOver () {
      this.showDisclamer = false
      this.isInputHovered = true
    },

    onDragLeave () {
      this.showDisclamer = false
      this.isInputHovered = false
    },

    onDrop () {
      this.showDisclamer = false
      this.isInputHovered = false
    },

    reset () {
      this.$store.commit('resetState')
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
  color: inherit;
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
  position: sticky;
  top: 0;

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
    white-space: nowrap;
  }

  &__title {
    width: 50%;
    max-width: 500px;
  }

  @media screen and (max-width: 600px) {
    &__title {
      width: 100%;
      max-width: 100%;
    }
  }

  &__close {
    cursor: pointer;
    user-select: none;
  }
}
</style>
