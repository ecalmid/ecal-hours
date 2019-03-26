import Vue from 'vue'
import App from './App.vue'
import contenteditableDirective from 'vue-contenteditable-directive'

Vue.config.productionTip = false
Vue.use(contenteditableDirective)

new Vue({
  render: h => h(App)
}).$mount('#app')
