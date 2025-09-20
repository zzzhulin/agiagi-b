<template>
	<view class="login-page">
		<block v-if="isAuth">
			<Flexbox direction="column" gap="40" className="login-content">
				<Icon src="b_logo.png" size="60" :circle="true"></Icon>
				<Flexbox direction="column" gap="8">
					<!-- <Typography fontSize="24" :bold="true" className="title">登录</Typography> -->
					<Typography fontSize="24" :bold="true" className="title">手机号一键登录</Typography>
					<Typography color="gray1">欢迎登录阿济阿济健康管理平台</Typography>
				</Flexbox>
				<!-- <Flexbox direction="column" gap="12">
					<Flexbox align="justify" className="form-input">
						<input v-model="username" type="number" placeholder="手机号码" placeholder-class="placeholder" />
						<Flexbox align="center" gap="12">
							<view class="divide-line"></view>
							<Typography :color="canSend ? 'primary' : 'gray1'" @tap="sendCode">
								{{ countdown > 0 ? countdown + 's' : '获取验证码' }}
							</Typography>
						</Flexbox>
					</Flexbox>
					<Flexbox className="form-input">
						<input v-model="tel_code" type="number" placeholder="短信验证码" placeholder-class="placeholder" />
					</Flexbox>
				</Flexbox> -->
				<!-- <Flexbox align="center" :className="['login-btn', { disabled: !(username && tel_code) }]" @tap="onLogin">
					<Typography fontSize="18" color="white" :bold="true">登录</Typography>
				</Flexbox> -->
				<Flexbox align="center" className="login-btn disabled" v-if="!isAgree" @tap="onLogin">
					<Typography fontSize="18" color="white" :bold="true">手机号一键登录</Typography>
				</Flexbox>
				<button open-type="getPhoneNumber" class="login-btn" v-else @getphonenumber="getPhoneNumber">手机号一键登录</button>
			</Flexbox>
			<Flexbox align="center" gap="4" className="agreement-content" @tap="isAgree = !isAgree">
				<Icon src="b_checkbox-active.png" size="20" v-if="isAgree"></Icon>
				<Icon src="b_checkbox.png" size="20" v-else></Icon>
				<Flexbox>
					<Typography fontSize="12" color="gray2">已阅读并同意</Typography>
					<Typography fontSize="12" color="primary">《用户协议》</Typography>
					<Typography fontSize="12" color="primary">《隐私政策》</Typography>
				</Flexbox>
			</Flexbox>
		</block>
		<block v-else>
			<Flexbox direction="column" gap="40" className="forbiden-content">
				<Flexbox align="center" direction="column" gap="16">
					<Icon src="b_403.png" size="128"></Icon>
					<Flexbox align="center" direction="column">
						<Typography>抱歉！您暂时没有取得服务授权</Typography>
						<Typography>请联系您的公司开通权限</Typography>
					</Flexbox>
				</Flexbox>
				<view class="description-content">
					<view>
						<Typography color="gray1">阿济阿济是一款</Typography>
						<Typography color="primary" :bold="true">专业的配餐助手软件</Typography>
						<Typography color="gray1">，</Typography>
					</view>
					<view>
						<Typography color="gray1">适合</Typography>
						<Typography :bold="true">医护人员、营养师、健康管理师</Typography>
						<Typography color="gray1">等对大健康有一定专业知识及认知的从业人员使用。</Typography>
					</view>
					<view class="divide-gap"></view>
					<Typography color="gray1">开通服务后，将协助你更好的用膳食及生活方式调整的手段配合服务客户。</Typography>
				</view>
				<Flexbox align="center" direction="column" gap="16">
					<Icon src="b_customer-code.png" size="100"></Icon>
					<Flexbox align="center" direction="column" @tap="saveCode">
						<Typography color="primary">下载企业微信二维码</Typography>
						<Typography color="gray2">添加客服微信咨询</Typography>
					</Flexbox>
				</Flexbox>
			</Flexbox>
		</block>
		<view class="code-image">
			<l-painter ref="code" hidden>
				<l-painter-image src="https://cdn.agiagi.cc/images/b_customer-code.png" css="width: 200rpx; height: 200rpx;" />
			</l-painter>
		</view>
	</view>
</template>

<script>
import { mapMutations, mapActions } from 'vuex';
import { request } from '@/utils/request';
export default {
	data() {
		return {
			username: '',
			tel_code: '',
			countdown: 0,
			timer: null,
			isAgree: false,
			isAuth: true
		};
	},
	computed: {
		// 手机号格式校验
		isValid() {
			return /^1(3|4|5|7|8|9|6)\d{9}$/.test(this.username);
		},
		// 是否允许点击「获取验证码」
		canSend() {
			return this.isValid && this.countdown === 0;
		}
	},
	methods: {
		...mapActions(['getUserInfo']),
		...mapMutations(['setToken']),
		saveCode() {
			uni.showLoading({
				title: '正在保存...',
				mask: true
			});
			this.$refs.code.canvasToTempFilePathSync({
				fileType: 'jpg',
				pathType: 'url',
				quality: 1,
				success: (res) => {
					uni.saveImageToPhotosAlbum({
						filePath: res.tempFilePath,
						success: () => {
							uni.showToast({ title: '保存成功' });
						},
						fail: (e) => {
							uni.showToast({ title: '保存失败', icon: 'none' });
						},
						complete: () => {
							uni.hideLoading();
						}
					});
				},
				fail: (e) => {
					uni.showToast({ title: '保存失败', icon: 'none' });
				}
			});
		},
		getPhoneNumber(e) {
			if (!e.detail.code) {
				return;
			}
			uni.showLoading({
				title: '正在授权',
				mask: true
			});
			request({
				url: '/api/system/wechat/authorize-mobile',
				method: 'POST',
				data: {
					code: e.detail.code
				},
				success: (res) => {
					if (res) {
						this.setToken(res.token);
						this.getUserInfo();
						uni.switchTab({
							url: '/pages/index/index'
						});
					}
				},
				fail: (err) => {
					if (err.code === 201) {
						this.isAuth = false;
					}
				},
				complete: () => {
					uni.hideLoading();
				}
			});
		},
		// 发送验证码
		sendCode() {
			if (!this.canSend) return;
			uni.showLoading({ title: '正在发送...', mask: true });
			request({
				url: '/api/system/send-sms-code',
				method: 'POST',
				data: {
					phone: this.username
				},
				success: (res) => {
					if (res) {
						uni.showToast({ title: '验证码已发送', icon: 'success' });
						// 启动 60s 倒计时
						this.countdown = 60;
						this.timer = setInterval(() => {
							this.countdown--;
							if (this.countdown <= 0) {
								clearInterval(this.timer);
								this.timer = null;
							}
						}, 1000);
					}
				},
				complete: () => {
					uni.hideLoading();
				}
			});
		},
		// 登录
		onLogin() {
			if (!this.isAgree) {
				uni.showToast({
					title: '请阅读并同意用户协议和隐私政策',
					icon: 'none'
				});
				return;
			}
			// if (!this.username || !this.tel_code) {
			// 	return;
			// }
			// if (!this.isAgree) {
			// 	uni.showToast({
			// 		title: '请阅读并同意用户协议和隐私政策',
			// 		icon: 'none'
			// 	});
			// 	return;
			// }
			uni.showLoading({ title: '正在登录...', mask: true });
			request({
				url: '/api/system/login',
				method: 'POST',
				data: {
					username: this.username,
					tel_code: this.tel_code,
					type: 'mobile'
				},
				success: (res) => {
					if (res) {
						this.setToken(res.token);
						this.getUserInfo();
						uni.switchTab({
							url: '/pages/index/index'
						});
					}
				},
				fail: (err) => {
					if (err.code === 201) {
						this.isAuth = false;
					}
				},
				complete: () => {
					uni.hideLoading();
				}
			});
		}
	},
	// 页面卸载时清除定时器
	onUnload() {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
	}
};
</script>

<style lang="scss">
.login-page {
	padding: 0 54rpx 0 56rpx;
	min-height: 100vh;
	background-color: #fff;

	.login-content {
		margin-top: 176rpx;
	}

	.text.title {
		line-height: 68rpx;
	}

	.form-input {
		align-items: center;
		width: 640rpx;
		height: 112rpx;
		padding: 24rpx;
		box-shadow: 0 0 0 2rpx $uni-border-color inset;
		border-radius: 16rpx;
	}

	.divide-line {
		width: 2rpx;
		height: 24rpx;
		background: #000;
	}

	.login-btn {
		width: 640rpx;
		height: 88rpx;
		border-radius: 44rpx;
		background-color: $uni-color-primary;
		color: #fff;
	}

	.login-btn.disabled {
		opacity: 0.5;
	}

	.agreement-content {
		position: fixed;
		left: 136rpx;
		bottom: 116rpx;
	}

	.forbiden-content {
		margin-top: 240rpx;
	}

	.description-content {
		position: relative;
		padding-top: 80rpx;
		line-height: 1;
		&:before {
			position: absolute;
			top: 0;
			display: block;
			content: '';
			width: 100%;
			height: 2rpx;
			background-color: $uni-border-color;
		}

		.text {
			display: inline;
		}

		.divide-gap {
			height: 40rpx;
		}
	}

	.code-image {
		width: 200rpx;
	}
}
</style>
