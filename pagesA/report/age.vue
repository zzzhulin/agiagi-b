<template>
	<view class="report-age-page" v-if="report">
		<Navbar title="身体年龄测评"></Navbar>
		<Flexbox direction="column" gap="20">
			<Flexbox align="justify">
				<Flexbox direction="column" gap="4">
					<Typography fontSize="22" :bold="true">简易身体年龄测评报告</Typography>
					<Typography fontSize="12" color="gray2">
						调查对象：{{ report.member_info.name }}&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;调查时间：{{ report.create_at.slice(0, 10).replace(/-/g, '.') }}
					</Typography>
				</Flexbox>
				<Icon :src="report.member_info.avatar" size="44" :circle="true" type="remote"></Icon>
			</Flexbox>
			<Flexbox direction="column" gap="8">
				<Typography fontSize="16" :bold="true">当前测评年龄为{{ report.report_data.body_age }}岁</Typography>
				<Typography color="gray1">
					你实际年龄目前为{{ report.report_data.actual_age }}岁，{{ report.report_data.evaluation }}{{ report.report_data.age_adjustment }}岁，{{
						report.report_data.description
					}}
				</Typography>
			</Flexbox>
			<Flexbox direction="column" gap="12" className="standard-container">
				<Typography color="#000000" :bold="true">评估依据/标准</Typography>
				<Typography color="gray2">{{ report.assessment_basis }}</Typography>
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
.report-age-page {
	padding: 34rpx 32rpx 96rpx 32rpx;

	.standard-container {
		border-radius: 16rpx;
		padding: 24rpx;
		background-color: $uni-bg-color-2;
		white-space: pre-wrap;
	}
}
</style>
