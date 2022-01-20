import Vue from 'vue';
import lodash from 'lodash';

Vue.use({
	install(vue) {
		/* eslint-disable id-length */
		vue._ = lodash;
		vue.prototype._ = lodash;
	}
});
