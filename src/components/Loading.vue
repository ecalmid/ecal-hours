<template lang="pug">
  .loading
    span
</template>

<style lang="scss">
.loading {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10000;
  width: 100%;
  height: 100%;
  background-color: white;
  opacity: 0.9;
  display: flex;
  justify-content: center;
  align-items: center;

  span {
    position: relative;

    &::before {
      content: 'loading...';
      opacity: 0;
    }

    &::after {
      position: absolute;
      top: 0;
      left: 0;
      content: 'loading.';
      animation-name: loading-animation;
      animation-duration: 1s;
      animation-iteration-count: infinite;
      animation-timing-function: linear;
    }
  }
}

@keyframes loading-animation {
  0% {
    content: 'loading.'
  }

  50% {
    content: 'loading..'
  }

  75% {
    content: 'loading...'
  }
}
</style>
