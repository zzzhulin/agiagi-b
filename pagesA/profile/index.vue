<template>
	<Flexbox direction="column" className="health-profile-page">
		<Navbar :backgroundColor="navbarBgColor" title="健康档案" />
		<Flexbox direction="column" gap="8" className="sticky-container">
			<scroll-view :scroll-x="true" :enable-flex="true" :scroll-with-animation="true" :scroll-into-view="`tab-${activeTab}`" class="tab-content">
				<view v-for="item in tabs" :id="`tab-${item.value}`" :key="item.value" :class="['tab-item', { active: activeTab === item.value }]" @tap="selectTab(item.value)">
					<Typography fontSize="16" :color="activeTab !== item.value ? 'gray1' : ''" :bold="activeTab === item.value">{{ item.label }}</Typography>
				</view>
			</scroll-view>
		</Flexbox>
		<view class="profile-container">
			<profile-base ref="base" v-if="activeTab === 'base'" :memberId="memberId"></profile-base>
			<profile-disease ref="disease" v-if="activeTab === 'disease'" :memberId="memberId"></profile-disease>
			<profile-inherit ref="inherit" v-if="activeTab === 'inherit'" :memberId="memberId"></profile-inherit>
			<profile-test ref="test" v-if="activeTab === 'test'" :memberId="memberId"></profile-test>
			<profile-lifestyle ref="lifestyle" v-if="activeTab === 'lifestyle'" :memberId="memberId"></profile-lifestyle>
		</view>
		<Flexbox align="center" className="tabbar-container">
			<Flexbox align="center" className="upload-btn" v-if="activeTab === 'test'" @tap="onUpload">
				<Typography fontSize="18" color="white" :bold="true">上传体检报告</Typography>
			</Flexbox>
			<Flexbox align="center" className="speech-btn" v-else @tap="openPopup">
				<Flexbox align="center" gap="4">
					<Icon src="icon_microphone-light.png" size="24"></Icon>
					<Typography fontSize="18" color="white" :bold="true">更新档案请直接告诉我</Typography>
				</Flexbox>
			</Flexbox>
		</Flexbox>

		<Speech ref="speechPopup" @confirm="setText"></Speech>
	</Flexbox>
</template>

<script>
import profileBase from './base';
import profileDisease from './disease';
import profileInherit from './inherit';
import profileTest from './test';
import profileLifestyle from './lifestyle';
import { mapState, mapMutations } from 'vuex';
import { request } from '@/utils/request';
import { upload } from '@/utils/upload';
export default {
	data() {
		return {
			navbarBgColor: 'transparent',
			memberId: '',
			activeTab: 'overview',
			speechResult: '',
			tabs: [
				{ label: '基本信息', value: 'base' },
				{ label: '疾病史', value: 'disease' },
				{ label: '遗传病史', value: 'inherit' },
				{ label: '体检记录', value: 'test' },
				{ label: '生活方式', value: 'lifestyle' }
			]
		};
	},
	onLoad(option) {
		this.activeTab = option.tab || 'base';
		this.memberId = parseInt(option.memberId) || '';
	},
	onPageScroll(e) {
		this.navbarBgColor = e.scrollTop >= 50 ? '#ffffff' : 'transparent';
	},
	components: {
		profileBase,
		profileDisease,
		profileInherit,
		profileTest,
		profileLifestyle
	},
	computed: {
		...mapState(['userInfo'])
	},
	methods: {
		onUpload() {
			uni.showActionSheet({
				itemList: ['图片', '文件'],
				success: (res) => {
					if (res.tapIndex) {
						this.chooseFile();
					} else {
						this.chooseMedia();
					}
				}
			});
		},
		chooseFile() {
			uni.chooseMessageFile({
				count: 1,
				type: 'file',
				extension: ['.xlsx', '.xls', '.doc', 'docx', '.ppt'],
				success: (res) => {
					res.tempFiles.forEach((file) => {
						const type = file.type === 'image' ? 2 : file.type === 'video' ? 3 : isAudioFile(file.path) ? 5 : 4;
						this.uploadFile(file, type);
					});
				}
			});
		},
		chooseMedia() {
			uni.chooseMedia({
				count: 9,
				mediaType: ['image', 'video'],
				sourceType: ['album', 'camera'],
				maxDuration: 30,
				camera: 'back',
				success: (res) => {
					res.tempFiles.forEach((file) => {
						const type = file.fileType === 'image' ? 2 : file.fileType === 'video' ? 3 : isAudioFile(file.tempFilePath) ? 5 : 4;
						this.uploadFile(file, type);
					});
				}
			});
		},
		uploadFile(file, type) {
			console.log(file, type);
			const filePath = file.tempFilePath || file.path;
			const fileType = file.type || file.fileType || 'file';
			upload(filePath, fileType).then((result) => {
				this.uploadReport(result);
			});
		},
		uploadReport(file_path) {
			uni.showLoading({
				title: '正在更新...',
				mask: true
			});
			request({
				url: '/api/v2/health_record/analyze_medical_reports',
				method: 'POST',
				data: {
					user_id: this.userInfo.member_id,
					file_path,
					member_id: this.memberId
				},
				isRobot: true,
				success: (res) => {
					if (res) {
						this.$refs[this.activeTab].getData();
					}
				},
				complete: () => {
					uni.hideLoading();
				}
			});
		},
		openPopup() {
			this.$refs.speechPopup.open();
		},
		setText(text) {
			this.speechResult += text;
			this.updateProfile();
		},
		selectTab(value) {
			this.activeTab = value;
		},
		updateProfile() {
			uni.showLoading({
				title: '正在更新...',
				mask: true
			});
			request({
				url: '/api/health-service/user-member-record/extract-health-info',
				method: 'POST',
				data: {
					user_id: this.userInfo.member_id,
					member_id: this.memberId,
					text: this.speechResult
				},
				isRobot: true,
				success: (res) => {
					if (res) {
						this.$refs[this.activeTab].getData();
					}
				},
				complete: () => {
					uni.hideLoading();
				}
			});
		}
	}
};
</script>

<style lang="scss">
.health-profile-page {
	min-height: 100vh;
	padding: 8rpx 0 0 0;
	background-color: $uni-bg-color;

	.family-content {
		padding: 0 32rpx;
	}

	.family-select {
		padding: 16rpx;
		border-radius: 48rpx;
		background-color: #fff;
	}

	.add-btn {
		width: 64rpx;
		height: 64rpx;
		margin-left: auto;
		border-radius: 50%;
		background-color: #fff;
	}

	.tab-content {
		display: flex;
		width: auto;
		height: 80rpx;
		padding: 0 32rpx;
		&::-webkit-scrollbar {
			display: none;
		}
	}

	.tab-item {
		position: relative;
		height: 64rpx;
		margin-top: 16rpx;
		margin-right: 24rpx;
		flex: none;
		&:last-child {
			margin-right: 0;
		}
	}

	.tab-item.active::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: 6rpx;
		width: 48rpx;
		height: 6rpx;
		margin: 0 auto;
		border-radius: 8rpx;
		background-color: $uni-color-primary;
		transition: transform 0.3s ease-in-out, width 0.3s ease-in-out;
	}

	.profile-container {
		flex: 1;
		margin: 24rpx 32rpx 210rpx 32rpx;
	}

	.tabbar-container {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 0 32rpx env(safe-area-inset-bottom) 32rpx;
		background-color: $uni-bg-color;
	}

	.speech-btn,
	.upload-btn {
		width: 100%;
		height: 88rpx;
		border-radius: 44rpx;
		background-color: $uni-color-primary;
	}
}
</style>
