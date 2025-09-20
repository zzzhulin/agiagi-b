<template>
	<view class="tongue-result-page">
		<Navbar title="察颜观舌"></Navbar>
		<Flexbox direction="column" gap="16">
			<Flexbox align="justify" gap="12">
				<image :src="image" mode="aspectFit" v-for="(image, index) in report.tongue_image.image_url_list" :key="image" class="tongue-image" @tap="onPreview(index)"></image>
			</Flexbox>
			<Typography color="gray1" v-if="report.tongue_image.image_features">{{ report.tongue_image.image_features }}</Typography>
		</Flexbox>
		<Flexbox className="tips-content">
			<Typography fontSize="12" color="#000">提示：我们的面诊，舌诊旨在分析您的亚健康状态，非疾病诊断级别，以治未病的理念指导您的营养搭配与食疗方</Typography>
		</Flexbox>
		<Flexbox direction="column" gap="16" className="result-content">
			<Typography fontSize="22" :bold="true">判断结果</Typography>
			<Flexbox direction="column" gap="8">
				<view class="result-item">
					<Typography fontSize="16" :bold="true">核心病机：</Typography>
					<Typography fontSize="16">{{ report.tongue_diagnosis.constitution_type }}</Typography>
				</view>
				<view class="result-item">
					<Typography fontSize="16" :bold="true">脏腑定位：</Typography>
					<Typography fontSize="16">{{ report.tongue_diagnosis.organ_location }}</Typography>
				</view>
				<view class="result-item">
					<Typography fontSize="16" :bold="true">证候要点：</Typography>
					<Typography fontSize="16">{{ report.tongue_diagnosis.symptom_analysis }}</Typography>
				</view>
			</Flexbox>
			<Typography fontSize="16" color="gray2">可能已有如下情况出现：</Typography>
			<Flexbox align="left" gap="12" v-for="(item, index) in report.tongue_diagnosis.constitution_features" :key="item">
				<Typography fontSize="16">{{ index + 1 }}. {{ item }}</Typography>
			</Flexbox>
		</Flexbox>
	</view>
</template>

<script>
import { request } from '@/utils/request';
export default {
	data() {
		return {
			userId: '',
			appId: '',
			memberId: '',
			recordId: '',
			report: null
		};
	},
	onLoad(options) {
		this.userId = options.id;
		this.appId = options.appId;
		this.memberId = options.memberId;
		this.recordId = options.recordId;
		this.getRecordDetail();
	},
	methods: {
		onPreview(current) {
			uni.previewImage({
				urls: this.report.tongue_image.image_url_list,
				current
			});
		},
		getRecordDetail() {
			request({
				url: '/api/health-service/user-member-record/record-detail',
				method: 'POST',
				data: {
					user_id: this.userId,
					member_id: this.memberId,
					app_id: this.appId,
					record_id: this.recordId
				},
				isRobot: true,
				success: (res) => {
					if (res) {
						this.report = res;
					}
				}
			});
		}
	}
};
</script>

<style lang="scss">
.tongue-result-page {
	min-height: 100vh;
	padding: 32rpx 32rpx 128rpx 32rpx;
	background-color: #fff;

	.tongue-image {
		width: 212rpx;
		height: 212rpx;
		border-radius: 16rpx;
	}

	.tips-content {
		margin: 42rpx 0 28rpx 0;
		padding: 22rpx 24rpx;
		border-radius: 16rpx;
		background-color: $uni-color-accent2;
	}

	.result-content {
		margin-bottom: 32rpx;
		padding: 32rpx 24rpx;
		border-radius: 24rpx;
		background-color: $uni-bg-color-2;
	}

	.result-item .text {
		display: inline;
	}

	.checkbox {
		flex: none;
	}

	.description-item {
		min-height: 136rpx;
	}

	.description-item .checkbox {
		margin-left: auto;
	}

	.btn-group {
		margin-top: 44rpx;
		margin-bottom: 32rpx;
	}

	.vertify-btn,
	.restart-btn {
		width: 240rpx;
		height: 72rpx;
		border-radius: 80rpx;
		background-color: $uni-color-primary;
	}

	.restart-btn {
		background: none;
		box-shadow: 0 0 0 2rpx $uni-color-primary inset;
	}

	.back-btn {
		width: 240rpx;
		height: 72rpx;
		border-radius: 80rpx;
		margin: 0 auto;
		box-shadow: 0 0 0 2rpx $uni-color-primary inset;
	}
}
</style>
