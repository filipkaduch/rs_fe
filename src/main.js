import * as plugins from '@/plugins/all';

import App from '@/App.vue';
import Vue from 'vue';
import './plugins/bootstrap-vue'
import './plugins/axios'
import axios from 'axios';

window.Vue = Vue;
Vue.config.productionTip = false;

let appConfig = null;

axios({
	url: '/config.json',
	baseURL: '/'
})
	.then(({data}) => {
		appConfig = data;
	})
	.catch(() => {
		console.error('Can not load config');
	})
	.finally(() => {
		new Vue({
			...plugins,
			appConfig,
			render: (render) => render(App)
		}).$mount('#app');
    console.log(appConfig);
	});
