import Vue from 'vue';

Vue.mixin({
	beforeCreate() {
		const options = this.$options;
		if (options.appConfig) {
			Vue.appConfig = options.appConfig;
			this.$appConfig = options.appConfig;
		} else if (options.parent && options.parent.$appConfig) {
			this.$appConfig = options.parent.$appConfig;
		}
	}
});