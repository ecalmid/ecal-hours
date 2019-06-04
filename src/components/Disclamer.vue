<template lang="pug">
.disclamer(
  :class="disclamerCssClasses"
)
  h1 ATTENTION VERSION BETA!!!
  p  Please utiliser avec prudence 😬
</template>

<script>
export default {
  data () {
    return {
      colorModeInterval: null,
      colorMode: 'yellow'
    }
  },

  computed: {
    disclamerCssClasses () {
      return [
        `disclamer--${this.colorMode}`
      ]
    }
  },

  mounted () {
    this.colorModeInterval = setInterval(() => {
      if (this.colorMode === 'yellow') {
        this.colorMode = 'black'
      } else {
        this.colorMode = 'yellow'
      }
    }, 723)
  },

  beforeDestroy () {
    clearInterval(this.colorModeInterval)
  }
}
</script>

<style lang="scss">
.disclamer {
  cursor: pointer;
  position: fixed;
  z-index: 100000;
  top: 50%;
  left: 50%;
  transform-origin: center center;
  transform: translate(-50%, -50%) rotate(-45deg);
  width: 200vh;
  padding: 1.1em;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 8vh;

  &--yellow {
    background: yellow;
    color: black;
  }

  &--black {
    background: black;
    color: white;
  }

  h1 {
    margin: auto;
    display: inline-block;
    font-weight: 900;
    color: inherit;
  }

  p {
    font-size: 2vh;
    color: inherit;
  }
}
</style>
