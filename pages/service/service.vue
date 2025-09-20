<template>
	<view class="service-page" v-if="loaded">
		<Navbar title="服务码" :backgroundColor="navbarBgColor"></Navbar>
		<view class="code-content">
			<Icon :src="qr_code_path" type="remote" width="311" mode="widthFix" v-if="qr_code_path"></Icon>
			<Icon src="b_poster.png" width="311" mode="widthFix" v-else></Icon>
			<Icon :src="qr_code_url" type="remote" size="70" className="service-code" @load="onImageLoad"></Icon>
		</view>
		<Flexbox gap="9" className="tabbar-content" v-if="imageLoaed">
			<Flexbox align="center" className="edit-btn" @tap="navigateTo">
				<Typography fontSize="18" color="primary">信息编辑</Typography>
			</Flexbox>
			<Flexbox align="center" className="save-btn" @tap="onSave">
				<Typography fontSize="18" color="white" :bold="true">保存</Typography>
			</Flexbox>
		</Flexbox>

		<view class="poster-image">
			<l-painter ref="poster" hidden>
				<l-painter-view css="position:relative;">
					<l-painter-image :src="qr_code_path" css="width: 622rpx; height: 1106rpx;border-radius: 32rpx;" v-if="qr_code_path" />
					<l-painter-image src="https://cdn.agiagi.cc/images/b_poster.png" css="width: 622rpx; height: 1106rpx;border-radius: 32rpx;" v-else />
					<l-painter-image :src="qr_code_url" css="position:absolute;bottom:30rpx;right:40rpx;width: 140rpx; height: 140rpx;border-radius:6rpx;" />
				</l-painter-view>
			</l-painter>
		</view>
		<view class="code-image">
			<l-painter ref="code" hidden>
				<l-painter-image :src="qr_code_url" css="width: 512rpx; height: 512rpx;background-color:#fff;" />
			</l-painter>
		</view>
	</view>
</template>

<script>
import { mapState } from 'vuex';
import { request } from '@/utils/request';
export default {
	data() {
		return {
			navbarBgColor: 'transparent',
			service_id: '',
			qr_code_path: '',
			qr_code_url: '',
			loaded: false,
			imageLoaed: false
		};
	},
	onLoad() {
		this.getUserInfo();
	},
	onPageScroll(e) {
		if (e.scrollTop >= 50) {
			this.navbarBgColor = '#ffffff';
		} else {
			this.navbarBgColor = 'transparent';
		}
	},
	computed: {
		...mapState(['userInfo'])
	},
	methods: {
		onImageLoad() {
			this.imageLoaed = true;
			console.log('加载完成');
		},
		onSave() {
			uni.showActionSheet({
				itemList: ['仅保存二维码', '保存至相册'],
				success: (res) => {
					if (res.tapIndex) {
						this.savePoster();
					} else {
						this.saveCode();
					}
				}
			});
		},
		savePoster() {
			uni.showLoading({
				title: '正在保存...',
				mask: true
			});
			this.$refs.poster.canvasToTempFilePathSync({
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
		navigateTo() {
			uni.navigateTo({
				url: '/pages/service/edit'
			});
		},
		getUserInfo() {
			request({
				url: '/api/mine/profile/info',
				success: (res) => {
					if (res) {
						this.service_id = res.services_id;
						this.qr_code_path = res.qr_code_path;
						this.getCode();
					}
				}
			});
		},
		getCode() {
			request({
				url: `/api/mine/services/${this.service_id}/qrcode`,
				success: (res) => {
					if (res) {
						this.qr_code_url = res.qr_code_url;
					}
				},
				complete: () => {
					this.loaded = true;
				}
			});
		}
	}
};
</script>

<style lang="scss">
.service-page {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: $uni-bg-color;
	// padding: 80rpx 0 0 0;

	.code-content {
		flex: 1;
		position: relative;
		margin: 0 64rpx;
		border-radius: 32rpx;
		overflow: hidden;
	}

	.service-code {
		position: absolute;
		right: 40rpx;
		bottom: 30rpx;
		border-radius: 6rpx;
	}

	.poster-image {
		width: 622rpx;
	}

	.code-image {
		width: 512rpx;
	}

	.tabbar-content {
		flex: none;
		height: 88rpx;
		padding: 0 32rpx;
		margin-top: 88rpx;
		// padding: 16rpx 32rpx env(safe-area-inset-bottom) 32rpx;
		background-color: $uni-bg-color;
	}

	.edit-btn,
	.save-btn {
		width: 334rpx;
		height: 88rpx;
		border-radius: 44rpx;
	}

	.edit-btn {
		box-shadow: 0 0 0 2rpx $uni-color-primary inset;
	}

	.save-btn {
		background-color: $uni-color-primary;
	}
}
</style>
