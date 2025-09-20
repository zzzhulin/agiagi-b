<template>
	<view class="customer-page">
		<Navbar title="客户信息" :backgroundColor="navbarBgColor"></Navbar>
		<Flexbox align="left" gap="16" className="customer-content">
			<Icon :src="customer.headimg" size="60" type="remote" :circle="true"></Icon>
			<Flexbox direction="column" gap="8">
				<Flexbox align="left" gap="4">
					<Typography fontSize="17" :bold="true">
						{{ customer.service_info && customer.service_info.notes.length ? customer.service_info.notes[0].content : customer.nickname }}
					</Typography>
					<Icon src="b_edit.png" size="16" @tap="openPopup('remarkPopup')"></Icon>
				</Flexbox>
				<Flexbox gap="24">
					<Typography color="gray1">昵称：{{ customer.nickname }}</Typography>
					<Typography color="gray1">ID：{{ customer.member_id }}</Typography>
				</Flexbox>
			</Flexbox>
			<picker :value="index" :range="family_members" range-key="name" @change="selectMember">
				<Flexbox align="center" className="family-btn">
					<Typography color="primary" :bold="true">Ta的家人</Typography>
					<Icon src="b_toggle-green.png" size="20"></Icon>
				</Flexbox>
			</picker>
		</Flexbox>
		<Flexbox direction="column" gap="12" className="customer-container">
			<Flexbox direction="column" gap="12" className="card-content">
				<Flexbox align="baseline">
					<Typography fontSize="18" :bold="true">{{ customer.service_info.service_name }}</Typography>
					<Typography color="gray1" :bold="true">（￥{{ customer.service_info.service_price }}）</Typography>
				</Flexbox>
				<Flexbox direction="column" gap="4">
					<Flexbox>
						<Typography color="gray2">激活时间：</Typography>
						<Typography color="gray2">{{ customer.service_info.start_date }}</Typography>
					</Flexbox>
					<Flexbox>
						<Typography color="gray2">已服务天数：</Typography>
						<Typography color="gray2">{{ customer.service_info.service_days }}天</Typography>
					</Flexbox>
					<Flexbox>
						<Typography color="gray2">剩余天数：</Typography>
						<Typography color="gray2">{{ customer.service_info.remaining_days }}天</Typography>
					</Flexbox>
				</Flexbox>
			</Flexbox>
			<Flexbox direction="column" gap="20" className="target-content">
				<Flexbox className="clock-day">
					<Typography fontSize="16">已进行</Typography>
					<Typography fontSize="16" color="primary" :bold="true">{{ duration_days }}</Typography>
					<Typography fontSize="16">天</Typography>
				</Flexbox>
				<picker :value="current_goal_type_index" :range="available_goal_types" range-key="goal_type_name" @change="selectTarget">
					<Flexbox direction="column" gap="4">
						<Flexbox align="left">
							<Typography color="primary" :bold="true">第一目标</Typography>
							<Icon src="b_toggle-green.png" size="20"></Icon>
						</Flexbox>
						<Typography fontSize="24" :bold="true" className="target-name">{{ goal_type_name }}</Typography>
					</Flexbox>
				</picker>
				<Flexbox gap="8" v-if="first_goal_data">
					<Flexbox direction="column" className="target-info">
						<Flexbox align="justify">
							<Typography fontSize="18" :bold="true">{{ first_goal_data.current_value }}{{ first_goal_data.unit }}</Typography>
							<Flexbox>
								<Icon src="b_down-green.png" size="16" v-if="first_goal_data.initial_value - first_goal_data.current_value > 0"></Icon>
								<Icon src="b_up-green.png" size="16" v-else></Icon>
								<Typography color="primary">{{ first_goal_data.initial_value - first_goal_data.current_value }}{{ first_goal_data.unit }}</Typography>
							</Flexbox>
						</Flexbox>
						<Typography color="gray1">当前体重</Typography>
					</Flexbox>
					<!-- <Flexbox direction="column" className="target-info">
						<Flexbox align="justify">
							<Typography fontSize="18" :bold="true">98cm</Typography>
							<Flexbox>
								<Icon src="b_up-green.png" size="16"></Icon>
								<Typography color="primary">2cm</Typography>
							</Flexbox>
						</Flexbox>
						<Typography color="gray1">当前腰围</Typography>
					</Flexbox> -->
				</Flexbox>
				<Flexbox align="center" direction="column" className="empty-content" v-else>
					<Icon src="empty.png" size="128"></Icon>
					<Typography color="gray2">暂无数据</Typography>
				</Flexbox>
			</Flexbox>
			<Flexbox direction="column" className="scheme-content">
				<Flexbox align="justify" className="scheme-info" @tap="navigateTo(`/pagesA/profile/index?tab=base&memberId=${customer.family_member_id}`)">
					<Typography fontSize="16" color="gray1">健康档案</Typography>
					<Icon src="b_arrow-right-gray2.png" size="20"></Icon>
				</Flexbox>
				<Flexbox align="justify" className="scheme-info">
					<Typography fontSize="16" color="gray1">咨询时长</Typography>
					<Flexbox align="center" @tap="openPopup('durationPopup')">
						<Typography fontSize="16">剩余{{ remaining_time }}分钟</Typography>
						<Icon src="b_arrow-right-gray2.png" size="20"></Icon>
					</Flexbox>
				</Flexbox>
				<Flexbox align="justify" className="scheme-info">
					<Typography fontSize="16" color="gray1">食谱方案</Typography>
					<picker :value="scheme_index" :range="schemes" range-key="scheme_name" @change="selectScheme">
						<Flexbox align="center">
							<Typography fontSize="16">{{ scheme_name || '暂未选择方案' }}</Typography>
							<Icon src="b_arrow-right-gray2.png" size="20"></Icon>
						</Flexbox>
					</picker>
				</Flexbox>
				<!-- <Flexbox align="justify" className="scheme-info">
					<Typography fontSize="16" color="gray1">主动服务策略</Typography>
					<Flexbox align="center">
						<Typography fontSize="16">{{ customer.nutrition_profile.service_strategy }}</Typography>
						<Icon src="b_arrow-right-gray2.png" size="20"></Icon>
					</Flexbox>
				</Flexbox> -->
			</Flexbox>
			<Flexbox align="justify" className="service-content">
				<Typography fontSize="16" color="gray1">服务托管</Typography>
				<Icon src="b_switch-active.png" width="44" height="28" v-if="service_hosting_enabled" @tap="putServiceHostEnable(false)"></Icon>
				<Icon src="b_switch.png" width="44" height="28" v-else @tap="putServiceHostEnable(true)"></Icon>
			</Flexbox>
			<Flexbox direction="column" gap="12" className="test-content" v-if="records.length">
				<Typography fontSize="18" :bold="true">近期测评记录</Typography>
				<Flexbox direction="column" gap="8">
					<Flexbox align="justify" className="test-item" v-for="record in records" :key="record.record_id" @tap="getRecordDetail(record.app_id, record.record_id)">
						<Typography className="test-name">{{ record.app_name }}</Typography>
						<Flexbox align="center">
							<Typography fontSize="12" color="gray2">{{ formatDate(record.created_at, 'YYYY.MM.DD hh:mm:ss') }}</Typography>
							<Icon src="b_arrow-right-gray2.png" size="20"></Icon>
						</Flexbox>
					</Flexbox>
				</Flexbox>
			</Flexbox>
		</Flexbox>
		<Flexbox gap="9" className="tabbar-content">
			<Flexbox align="center" className="scheme-btn" @tap="navigateTo(`/pagesA/scheme/scheme?id=${member_id}`)">
				<Typography fontSize="18" color="primary">配餐方案</Typography>
			</Flexbox>
			<Flexbox align="center" gap="4" className="update-btn" @tap="openPopup('speechPopup')">
				<Icon src="b_microphone-white.png" size="24"></Icon>
				<Typography fontSize="18" color="white" :bold="true">更新健康档案</Typography>
			</Flexbox>
		</Flexbox>

		<uni-popup ref="remarkPopup" type="center">
			<Flexbox direction="column" gap="24" className="popup-content">
				<Flexbox direction="column" gap="12">
					<Typography fontSize="16" color="gray1" :bold="true">设置备注</Typography>
					<input v-model="notes" class="form-input" placeholder="请输入" placeholder-class="placeholder" />
				</Flexbox>
				<Flexbox gap="14">
					<Flexbox align="center" className="cancel-btn" @tap="closePopup('remarkPopup')">
						<Typography fontSize="18" color="gray2" :bold="true">取消</Typography>
					</Flexbox>
					<Flexbox align="center" className="save-btn" @tap="updateRemark">
						<Typography fontSize="18" color="white" :bold="true">保存</Typography>
					</Flexbox>
				</Flexbox>
			</Flexbox>
		</uni-popup>

		<uni-popup ref="durationPopup" type="center">
			<Flexbox direction="column" gap="24" className="popup-content">
				<Flexbox direction="column" gap="12">
					<Typography fontSize="16" color="gray1" :bold="true">当前剩余咨询时长</Typography>
					<Flexbox align="justify" className="form-input">
						<input v-model="remaining_time" placeholder="请输入" placeholder-class="placeholder" />
						<Typography fontSize="18" color="gray2">分钟</Typography>
					</Flexbox>
				</Flexbox>
				<Flexbox gap="14">
					<Flexbox align="center" className="cancel-btn" @tap="closePopup('durationPopup')">
						<Typography fontSize="18" color="gray2" :bold="true">取消</Typography>
					</Flexbox>
					<Flexbox align="center" className="save-btn" @tap="updateConsulationTime">
						<Typography fontSize="18" color="white" :bold="true">保存</Typography>
					</Flexbox>
				</Flexbox>
			</Flexbox>
		</uni-popup>
		<Speech ref="speechPopup" @confirm="setText"></Speech>
	</view>
</template>

<script>
import { mapState } from 'vuex';
import { formatDate } from '@/utils/util';
import { request } from '@/utils/request';
export default {
	data() {
		return {
			formatDate,
			navbarBgColor: 'transparent',
			targetIndex: 0,
			member_id: '',
			family_member_id: '',
			service_hosting_enabled: '',
			customer: {
				recent_assessments: [],
				family_members: []
			},
			family_members: [],
			first_goal_data: null,
			available_goal_types: [],
			current_goal_type_index: '',
			current_goal_type: '',
			goal_type_name: '',
			notes: '',
			schemes: [],
			scheme_id: '',
			scheme_index: '',
			scheme_name: '',
			remaining_time: '',
			duration_days: '',
			page: 1,
			total: 0,
			records: [],
			speechResult: ''
		};
	},
	onLoad(option) {
		this.member_id = option.id;
		this.getCustomer();
	},
	onPageScroll(e) {
		if (e.scrollTop >= 50) {
			this.navbarBgColor = '#ffffff';
		} else {
			this.navbarBgColor = 'transparent';
		}
	},
	onReachBottom() {
		if (this.records.length < this.total) {
			this.page++;
			this.getRecords();
		}
	},
	computed: {
		...mapState(['userInfo']),
		index() {
			return this.family_members.findIndex((item) => item.id === this.customer.family_member_id);
		}
	},
	methods: {
		setText(text) {
			this.speechResult += text;
			this.updateProfile();
		},
		openPopup(ref) {
			this.$refs[ref].open();
		},
		closePopup(ref) {
			this.$refs[ref].close();
		},
		navigateTo(url) {
			uni.navigateTo({
				url
			});
		},
		selectScheme(e) {
			this.scheme_index = e.detail.value;
			this.scheme_id = this.schemes[e.detail.value].id;
			this.scheme_name = this.schemes[e.detail.value].scheme_name;
			this.updateScheme();
		},
		selectTarget(e) {
			this.current_goal_type_index = e.detail.value;
			this.current_goal_type = this.available_goal_types[e.detail.value].goal_type;
			this.goal_type_name = this.available_goal_types[e.detail.value].goal_type_name;
			this.updateGoalType();
		},
		selectMember(e) {
			this.family_member_id = this.family_members[e.detail.value].id;
			this.member_id = this.family_members[e.detail.value].member_user_id;
			this.getCustomer();
		},
		getRecordDetail(app_id, record_id) {
			let url = '';
			switch (app_id) {
				case 1:
					url = '/pagesA/report/diet';
					break;
				case 2:
					url = '/pagesA/report/slimming';
					break;
				case 3:
					url = '/pagesA/report/tongue';
					break;
				case 4:
					url = '/pagesA/report/height';
					break;
				case 5:
					url = '/pagesA/report/metabolism';
					break;
				case 6:
					url = '/pagesA/report/sleep';
					break;
				case 7:
					url = '/pagesA/report/emotion';
					break;
				case 8:
					url = '/pagesA/report/age';
					break;
			}
			uni.navigateTo({
				url: url + `?from=test&id=${this.member_id}&memberId=${this.family_member_id}&appId=${app_id}&recordId=${record_id}`
			});
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
					user_id: this.member_id,
					member_id: this.family_member_id,
					text: this.speechResult
				},
				success: (res) => {
					if (res) {
						this.getCustomer();
					}
				},
				complete: () => {
					uni.hideLoading();
				}
			});
		},
		updateRemark() {
			request({
				url: `/api/customers/${this.member_id}/notes`,
				method: 'PUT',
				data: {
					member_id: this.member_id,
					notes: this.notes
				},
				success: (res) => {
					if (res) {
						this.closePopup('remarkPopup');
						this.getCustomer();
					}
				}
			});
		},
		getConsulationTime() {
			request({
				url: `/api/customers/${this.member_id}/consultation_time`,
				success: (res) => {
					if (res) {
						this.remaining_time = res.remaining_time;
					}
				}
			});
		},
		updateConsulationTime() {
			request({
				url: `/api/customers/${this.member_id}/consultation_time`,
				method: 'PUT',
				data: {
					member_id: this.member_id,
					time_minutes: parseInt(this.remaining_time)
				},
				success: (res) => {
					if (res) {
						this.closePopup('durationPopup');
						this.getConsulationTime();
					}
				}
			});
		},
		putServiceHostEnable(service_hosting_enabled) {
			request({
				url: `/api/customers/nutrition-profile/${this.member_id}/service-hosting`,
				method: 'PUT',
				data: {
					service_hosting_enabled
				},
				success: (res) => {
					if (res) {
						this.service_hosting_enabled = service_hosting_enabled;
					}
				}
			});
		},
		getServiceHostEnable() {
			request({
				url: `/api/customers/nutrition-profile/${this.member_id}/service-hosting`,
				success: (res) => {
					if (res) {
						this.service_hosting_enabled = res.service_hosting_enabled;
					}
				}
			});
		},
		getCustomer(toggleFamily = false) {
			request({
				url: `/api/customers/${this.member_id}`,
				success: (res) => {
					if (res) {
						this.customer = res;
						if (!toggleFamily) {
							this.family_members = res.family_members;
						}

						this.family_member_id = res.family_member_id;
						this.getFirstGoalData();
						this.getServiceHostEnable();
						this.getAvailableGoalTypes();
						this.getScheme();
						this.getSchemes();
						this.getConsulationTime();
						this.getRecords();
					}
				}
			});
		},
		getFirstGoalData() {
			request({
				url: '/api/health-service/user-member-record/get_first_goal_data',
				data: {
					user_id: this.member_id,
					member_id: this.family_member_id
				},
				success: (res) => {
					if (res) {
						this.duration_days = res.duration_days;
						this.first_goal_data = res.goal_data;
					}
				}
			});
		},
		getAvailableGoalTypes() {
			request({
				url: '/api/health-service/user-member-record/get_available_goal_types',
				data: {
					user_id: this.member_id,
					member_id: this.family_member_id
				},
				success: (res) => {
					if (res) {
						this.available_goal_types = res.available_goal_types;
						this.current_goal_type = res.current_goal_type;
						this.current_goal_type_index = res.available_goal_types.findIndex((item) => item.goal_type === res.current_goal_type);
						this.goal_type_name = res.available_goal_types[this.current_goal_type_index].goal_type_name;
					}
				}
			});
		},
		updateGoalType() {
			request({
				url: `/api/health-service/user-member-record/update_goal_type?member_id=${this.family_member_id}&goal_type=${this.current_goal_type}`,
				method: 'POST',
				success: (res) => {
					if (res) {
						this.getFirstGoalData();
					}
				}
			});
		},
		getScheme() {
			request({
				url: '/api/health-service/diet-scheme/user-selected',
				data: {
					user_id: this.member_id,
					member_id: this.family_member_id
				},
				success: (res) => {
					if (res) {
						this.scheme_name = res.scheme_name;
						this.scheme_id = res.id;
					}
				}
			});
		},
		updateScheme() {
			request({
				url: '/api/health-service/diet-scheme/switch-diet-scheme',
				method: 'POST',
				data: {
					user_id: this.member_id,
					member_id: this.family_member_id,
					diet_scheme_id: this.scheme_id
				},
				success: (res) => {
					if (res) {
						this.getScheme();
					}
				}
			});
		},
		getSchemes() {
			request({
				url: '/api/health-service/diet-scheme/diet-schemes-status',
				data: {
					user_id: this.member_id,
					member_id: this.family_member_id
				},
				success: (res) => {
					if (res) {
						this.schemes = res.schemes;
						this.scheme_index = res.schemes.findIndex((item) => item.id === parseInt(this.scheme_id));
					}
				}
			});
		},
		getRecords() {
			request({
				url: '/api/health-service/user-member-record/app-test-records',
				method: 'POST',
				data: {
					user_id: this.member_id,
					member_id: this.family_member_id,
					page: this.page,
					page_size: 10
				},
				success: (res) => {
					if (res && res.pagination.total) {
						if (this.page === 1) {
							this.records = res.records;
						} else {
							this.records = this.records.concat(res.records);
						}
						this.total = res.pagination.total;
					}
				}
			});
		}
	}
};
</script>

<style lang="scss">
.customer-page {
	min-height: 100vh;
	background-color: $uni-bg-color;
	padding-bottom: 200rpx;

	.family-btn {
		position: absolute;
		top: 16rpx;
		right: 0;
	}

	.customer-content {
		position: relative;
		margin: 40rpx;
	}

	.customer-container {
		padding: 0 32rpx;
	}

	.card-content {
		padding: 28rpx 24rpx;
		border-radius: 24rpx;
		background: linear-gradient(180deg, #f6fefb 0%, #ffffff 100%);
	}

	.target-content {
		position: relative;
		padding: 32rpx 24rpx;
		background-color: #ffffff;
		border-radius: 24rpx;
	}

	.text.target-name {
		line-height: 68rpx;
	}

	.clock-day {
		position: absolute;
		top: 92rpx;
		right: 24rpx;
	}

	.target-info {
		flex: 1;
		height: 128rpx;
		padding: 16rpx 24rpx 14rpx 24rpx;
		background-color: $uni-bg-color-2;
		border-radius: 16rpx;
	}

	.scheme-content {
		background-color: #ffffff;
		border-radius: 24rpx;
	}

	.scheme-info {
		padding: 34rpx 24rpx;
		height: 112rpx;
		border-bottom: 2rpx solid $uni-bg-color;
		&:last-child {
			border-bottom: none;
		}
	}

	.service-content {
		background-color: #ffffff;
		border-radius: 24rpx;
		padding: 34rpx 24rpx;
	}

	.test-content {
		background-color: #ffffff;
		padding: 24rpx;
		border-radius: 24rpx;
	}

	.test-item {
		padding: 0 16rpx 0 24rpx;
		height: 80rpx;
		background-color: $uni-bg-color-2;
		border-radius: 16rpx;
	}

	.test-name {
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.tabbar-content {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 16rpx 32rpx env(safe-area-inset-bottom) 32rpx;
		background-color: $uni-bg-color;
	}

	.scheme-btn,
	.update-btn {
		width: 334rpx;
		height: 88rpx;
		border-radius: 44rpx;
	}

	.scheme-btn {
		box-shadow: 0 0 0 2rpx $uni-color-primary inset;
	}

	.update-btn {
		background-color: $uni-color-primary;
	}

	.popup-content {
		width: 588rpx;
		height: 380rpx;
		padding: 40rpx;
		border-radius: 32rpx;
		background-color: #fff;

		.form-input {
			height: 96rpx;
			border-radius: 16rpx;
			box-shadow: 0 0 0 2rpx $uni-text-color-gray2 inset;
			padding: 24rpx 24rpx 22rpx 32rpx;
		}

		.placeholder {
			font-size: 36rpx;
		}

		.cancel-btn,
		.save-btn {
			width: 240rpx;
			height: 88rpx;
			border-radius: 44rpx;
		}

		.cancel-btn {
			background-color: $uni-bg-color;
		}

		.save-btn {
			background-color: $uni-color-primary;
		}
	}
}
</style>