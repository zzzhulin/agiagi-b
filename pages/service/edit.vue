<template>
	<view class="service-edit-page">
		<Navbar title="我的信息"></Navbar>
		<Flexbox direction="column" gap="12">
			<Flexbox direction="column" gap="8" className="user-content">
				<Flexbox align="justify" className="form-input">
					<Typography fontSize="16" color="gray1" :bold="true">头像</Typography>
					<Flexbox align="center" @tap="chooseImage('avatar')">
						<Icon :src="head_path" type="remote" size="44" :circle="true"></Icon>
						<Icon src="b_arrow-right-thin.png" size="20"></Icon>
					</Flexbox>
				</Flexbox>
				<Flexbox align="justify" className="form-input">
					<Typography fontSize="16" color="gray1" :bold="true">昵称</Typography>
					<Flexbox align="center">
						<input v-model="nickname" placeholder="请输入你的手机号" placeholder-class="placeholder" />
						<Icon src="b_arrow-right-thin.png" size="20"></Icon>
					</Flexbox>
				</Flexbox>
				<Flexbox direction="column">
					<Flexbox align="justify" className="form-input">
						<Typography fontSize="16" color="gray1" :bold="true">真实姓名</Typography>
						<Flexbox align="center">
							<input v-model="name" placeholder="请输入本人真实姓名" placeholder-class="placeholder" />
							<Icon src="b_arrow-right-thin.png" size="20"></Icon>
						</Flexbox>
					</Flexbox>
					<Flexbox align="justify" className="switch-content">
						<Typography color="gray1">真姓名对外显示</Typography>
						<Icon src="b_switch-active.png" width="38" height="24" v-if="is_show_real_name" @tap="is_show_real_name = 0"></Icon>
						<Icon src="b_switch.png" width="38" height="24" v-else @tap="is_show_real_name = 1"></Icon>
					</Flexbox>
				</Flexbox>
			</Flexbox>
			<Flexbox direction="column" gap="8" className="certificate-content">
				<Flexbox align="justify" className="form-input">
					<Typography fontSize="16" color="gray1" :bold="true">专业证书</Typography>
					<Flexbox align="center">
						<Typography fontSize="16">营养师证明</Typography>
						<Icon src="b_arrow-right-thin.png" size="20"></Icon>
					</Flexbox>
				</Flexbox>
				<Flexbox>
					<Flexbox direction="column" gap="14">
						<Typography fontSize="16" color="gray1" :bold="true">证书照片</Typography>
						<Typography fontSize="12" color="gray2">请上传你本人相关证书原件的照片</Typography>
					</Flexbox>
					<Flexbox direction="column" align="center" className="upload-btn" @tap="chooseImage('certificate')">
						<block v-if="certificate_path">
							<Icon :src="certificate_path" size="88" type="remote" @tap.stop="onPreview('certificate')"></Icon>
							<Icon src="b_delete.png" size="20" className="delete-btn" @tap.stop="onRemove('certificate')"></Icon>
						</block>
						<block v-else>
							<Icon src="b_plus.png" size="32"></Icon>
							<Typography color="gray2">添加</Typography>
						</block>
					</Flexbox>
				</Flexbox>
			</Flexbox>
			<Flexbox direction="column" gap="8" className="poster-content">
				<Flexbox>
					<Flexbox direction="column" gap="15">
						<Typography fontSize="16" color="gray1" :bold="true">推广海报</Typography>
						<Typography fontSize="12" color="gray2">请上传你的推广海报，建议尺寸2160rpx*3840rpx</Typography>
					</Flexbox>
					<Flexbox direction="column" align="center" className="upload-btn" @tap="chooseImage('poster')">
						<block v-if="qr_code_path">
							<Icon :src="qr_code_path" size="88" type="remote" @tap.stop="onPreview('poster')"></Icon>
							<Icon src="b_delete.png" size="20" className="delete-btn" @tap.stop="onRemove('poster')"></Icon>
						</block>
						<block v-else>
							<Icon src="b_plus.png" size="32"></Icon>
							<Typography color="gray2">添加</Typography>
						</block>
					</Flexbox>
				</Flexbox>
			</Flexbox>
		</Flexbox>
		<Flexbox className="tabbar-content">
			<Flexbox align="center" className="save-btn" @tap="onSave">
				<Typography fontSize="18" color="white" :bold="true">保存</Typography>
			</Flexbox>
		</Flexbox>
	</view>
</template>

<script>
import { baseUrl } from '../../utils/constant';
import { request } from '@/utils/request';
export default {
	data() {
		return {
			qr_code_path: '',
			head_path: '',
			certificate_path: '',
			nickname: '',
			name: '',
			is_show_real_name: 0
		};
	},
	onLoad() {
		this.getUserInfo();
	},
	methods: {
		getUserInfo() {
			request({
				url: '/api/mine/profile/info',
				success: (res) => {
					if (res) {
						this.head_path = res.head_path;
						this.nickname = res.nickname;
						this.name = res.name;
						this.is_show_real_name = res.is_show_real_name;
						this.qr_code_path = res.qr_code_path;
						this.certificate_path = res.certificate_path;
					}
				}
			});
		},
		chooseImage(type) {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (chooseRes) => {
					const tempPath = chooseRes.tempFilePaths[0];
					this.uploadImage(tempPath, type);
				}
			});
		},
		uploadImage(filePath, type) {
			const storage = JSON.parse(uni.getStorageSync('vuex'));
			const token = storage.token;
			uni.showLoading({ title: '上传中...', mask: true });
			uni.uploadFile({
				url: baseUrl + `/api/mine/profile/${type}`,
				filePath,
				name: type,
				formData: { [type]: filePath },
				header: {
					token: token || ''
				},
				success: (res) => {
					const result = JSON.parse(res.data);
					if (result.code === 200) {
						switch (type) {
							case 'avatar':
								this.head_path = result.data.avatar_url;
								break;
							case 'poster':
								this.qr_code_path = result.data.poster_url;
								break;
							case 'certificate':
								this.certificate_path = result.data.certificate_url;
								break;
							default:
								break;
						}
					}
				},
				fail: () => {
					uni.showToast({ title: '上传失败', icon: 'none' });
				},
				complete: () => {
					uni.hideLoading();
				}
			});
		},
		onPreview(type) {
			let urls = [];
			switch (type) {
				case 'avatar':
					urls = [this.head_path];
					break;
				case 'poster':
					urls = [this.qr_code_path];
					break;
				case 'certificate':
					urls = [this.certificate_path];
					break;
				default:
					break;
			}
			uni.previewImage({
				urls
			});
		},
		onRemove(type) {
			switch (type) {
				case 'avatar':
					this.head_path = '';
					break;
				case 'poster':
					this.qr_code_path = '';
					break;
				case 'certificate':
					this.certificate_path = '';
					break;
				default:
					break;
			}
		},
		onSave() {
			const payload = {
				nickname: this.nickname,
				name: this.name,
				is_show_real_name: this.is_show_real_name
			};
			request({
				url: '/api/mine/profile/info',
				method: 'PUT',
				data: payload,
				success: (res) => {
					uni.showToast({ title: '保存成功', icon: 'success' });
					this.getUserInfo();
				},
				fail: () => {
					uni.showToast({ title: '保存失败', icon: 'none' });
				}
			});
		}
	}
};
</script>

<style lang="scss">
.service-edit-page {
	padding: 24rpx 32rpx 200rpx 32rpx;
	min-height: 100vh;
	background-color: $uni-bg-color;

	.user-content,
	.certificate-content,
	.poster-content {
		background-color: #fff;
		border-radius: 24rpx;
		padding: 16rpx 24rpx 32rpx 24rpx;
	}

	.certificate-content {
		padding-bottom: 24rpx;
	}

	.poster-content {
		padding-top: 36rpx;
		padding-bottom: 24rpx;
	}

	.form-input {
		height: 96rpx;

		input {
			text-align: right;
		}
	}

	.switch-content {
		height: 72rpx;
		padding: 0 16rpx;
		border-radius: 16rpx;
		background-color: $uni-bg-color-2;
	}

	.upload-btn {
		position: relative;
		flex: none;
		width: 176rpx;
		height: 176rpx;
		border-radius: 16rpx;
		border: 2rpx solid $uni-border-color;
		margin-left: auto;
		overflow: hidden;
	}

	.delete-btn {
		position: absolute;
		right: 10rpx;
		bottom: 10rpx;
	}

	.tabbar-content {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 16rpx 32rpx env(safe-area-inset-bottom) 32rpx;
	}

	.save-btn {
		width: 686rpx;
		height: 88rpx;
		background-color: $uni-color-primary;
		border-radius: 44rpx;
	}
}
</style>
