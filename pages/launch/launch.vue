<template>
	<view class="launch-page">
		<Icon src="b_launch.jpg" width="375" mode="widthFix"></Icon>
		<!-- <Typography fontSize="12" color="white" className="countdown">{{ seconds }}s 后自动跳转</Typography> -->
	</view>
</template>

<script>
import { mapState } from 'vuex';
export default {
	data() {
		return {
			seconds: 3,
			timer: null
		};
	},
	computed: {
		...mapState(['userInfo'])
	},
	onLoad() {
		this.startCountdown();
	},
	beforeDestroy() {
		// 确保页面销毁时清理定时器
		if (this.timer) {
			clearInterval(this.timer);
		}
	},
	methods: {
		startCountdown() {
			this.timer = setInterval(() => {
				this.seconds--;
				if (this.seconds <= 0) {
					clearInterval(this.timer);
					if (this.userInfo) {
						uni.switchTab({ url: '/pages/index/index' });
					} else {
						uni.redirectTo({ url: '/pages/login/login' });
					}
				}
			}, 1000);
		}
	}
};
</script>

<style lang="scss">
.launch-page {
	position: relative;
	display: flex;
	align-items: center;
	min-height: 100vh;
}

.countdown {
	position: absolute;
	top: 80rpx;
	left: 40rpx;
	background: rgba(0, 0, 0, 0.4);
	padding: 12rpx 24rpx;
	border-radius: 44rpx;
}
</style>
