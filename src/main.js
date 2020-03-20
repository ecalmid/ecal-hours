import Vue from 'vue'
import App from './App.vue'
import store from '@/store'
import contenteditableDirective from 'vue-contenteditable-directive'

Vue.config.productionTip = false
Vue.use(contenteditableDirective)

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
