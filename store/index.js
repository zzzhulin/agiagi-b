import Vue from 'vue';
import Vuex from 'vuex';
import {
	request
} from '@/utils/request';
import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		statusBarHeight: 0,
		token: '',
		userInfo: null,
		AKID: '',
		AKKEY: '',
		APPKEY: '',
		voiceToken: '',
		nutritionData: null,
		recipeData: null
	},
	mutations: {
		setStatusBarHeight(state, height) {
			state.statusBarHeight = height;
		},
		setToken(state, token) {
			state.token = token;
		},
		setUserInfo(state, userInfo) {
			state.userInfo = userInfo;
		},
		setAKID(state, AKID) {
			state.AKID = AKID;
		},
		setAKKEY(state, AKKEY) {
			state.AKKEY = AKKEY;
		},
		setAPPKEY(state, APPKEY) {
			state.APPKEY = APPKEY;
		},
		setVoiceToken(state, voiceToken) {
			state.voiceToken = voiceToken;
		},
		setNutritionData(state, nutritionData) {
			state.nutritionData = nutritionData;
		},
		setRecipeData(state, recipeData) {
			state.recipeData = recipeData;
		},
	},
	actions: {
		getSystemInfo({
			commit
		}) {
			uni.getSystemInfo({
				success: (res) => {
					commit('setStatusBarHeight', res.statusBarHeight);
				}
			});
		},
		getUserInfo({
			commit
		}) {
			request({
				url: '/api/mine/profile/info',
				success: (res) => {
					if (res) {
						commit('setUserInfo', res);
					}
				}
			});
		},
		logout({
			commit,
			state
		}) {
			state.statusBarHeight = 0;
			state.token = '';
			state.userInfo = null;
			state.AKID = '';
			state.AKKEY = '';
			state.APPKEY = '';
			state.voiceToken = '';
			state.nutritionData = null;
			state.recipeData = null;
			uni.removeStorageSync('vuex');
		}
	},
	plugins: [createPersistedState({
		storage: {
			getItem: (key) => uni.getStorageSync(key),
			setItem: (key, value) => uni.setStorageSync(key, value),
			removeItem: (key) => uni.removeStorageSync(key),
		}
	})]
});