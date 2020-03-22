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
    span.head__error {{ error }}
    .head__close(
      v-if="showOverview"
      @click="reset"
    )
      span Clear ✕

  overview(v-if="showOverview")
  loader(
    v-else
    @onLoad="onLoad"
    @onError="onError"
  )

</template>

<script>
import { mapGetters } from 'vuex'
import Disclamer from '@/components/Disclamer'
import Loader from '@/components/Loader'
import Overview from '@/components/Overview'

export default {
  name: 'app',

  metaInfo: {
    title: 'Hours',
    meta: [
      { charset: 'utf-8' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' }
    ]
  },

  components: {
    Disclamer,
    Loader,
    Overview
  },

  data () {
    return {
      error: null,
      showDisclamer: true,
      isInputHovered: false,
      isInputWrong: false
    }
  },

  computed: {
    ...mapGetters(['selectedCalendars']),

    showOverview () {
      return this.selectedCalendars.length > 0
    },

    headModifierClasses () {
      return {
        'head--over': this.isInputHovered,
        'head--error': this.error
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

    onLoad () {
      this.error = null
    },

    onError (error) {
      this.error = error
    },

    reset () {
      this.$store.commit('resetState')
    }
  }
}
</script>

<style lang="scss">
@import "@/styles/main.scss";

body {
  display: flex;
  min-height: 100vh;
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
  &__close,
  &__error {
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
