import {
	baseUrl,
	whiteList
} from "./constant";
import {
	arrayBufferToString,
	filterParams
} from "./util";

// 全局请求方法
export const request = (options) => {
	options.header = options.header || {};
	options.data = options.data || {};

	// 从本地拿 token
	const storage = uni.getStorageSync('vuex') ?
		JSON.parse(uni.getStorageSync('vuex')) :
		{};
	const token = storage.token;

	// 如果有 token 且接口不在白名单，就带上
	if (token && !whiteList.includes(options.url)) {
		options.header.token = token;
	}

	uni.request({
		url: baseUrl + options.url,
		method: options.method || 'GET',
		data: filterParams(options.data),
		header: options.header,
		timeout: 1200000,
		success: (res) => {
			const {
				code,
				data,
				message
			} = res.data;
			// 业务成功
			if (code === 0 || code === 200) {
				const payload = data !== '' && data !== undefined ? data : true;
				typeof options.success === 'function' && options.success(payload);
			}
			// token 过期 / 未登录
			else if (code === -10010 || res.statusCode === 401) {
				// 直接跳转到登录页（根据实际路由修改）
				uni.redirectTo({
					url: '/pages/login/login'
				});
			}
			// 其他错误
			else {
				setTimeout(() => {
					uni.showToast({
						title: message || '请求出错',
						icon: 'none',
					});
				}, 100);
				typeof options.fail === 'function' && options.fail(res.data);
			}
		},
		fail: (error) => {
			setTimeout(() => {
				uni.showToast({
					title: '网络错误，请稍后重试',
					icon: 'none',
				});
			}, 100);
			typeof options.fail === 'function' && options.fail(error);
		},
		complete: () => {
			typeof options.complete === 'function' && options.complete();
		}
	});
};