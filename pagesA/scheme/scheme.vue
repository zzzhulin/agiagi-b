<template>
	<view class="scheme-page">
		<Navbar title="膳食方案" :backgroundColor="navbarBgColor"></Navbar>
		<picker :value="member_index" :range="family_members" range-key="name" @change="selectMember">
			<Flexbox gap="20" className="user-content">
				<Flexbox align="left" gap="12" className="user-info">
					<Icon :src="headimg" size="48" type="remote" :circle="true" className="user-avatar"></Icon>
					<Flexbox direction="column" gap="4">
						<Typography fontSize="18" :bold="true">{{ member_name }}（{{ relationship }}）</Typography>
						<Typography color="gray1">{{ disease_name || '暂无疾病信息' }}</Typography>
					</Flexbox>
				</Flexbox>
				<Icon src="b_arrow-down.png" size="24"></Icon>
			</Flexbox>
		</picker>
		<Flexbox direction="column" gap="24" className="scheme-container" v-if="scheme_name">
			<Flexbox direction="column" gap="12">
				<Flexbox align="justify">
					<Typography fontSize="22" color="primary" :bold="true">{{ scheme_name }}</Typography>
					<Flexbox align="center" @tap="navigateTo(`/pagesA/scheme/list?id=${member_id}&memberId=${family_member_id}`)">
						<Icon src="b_toggle-gray.png" size="20"></Icon>
						<Typography color="gray1">更换方案</Typography>
					</Flexbox>
				</Flexbox>
				<Flexbox direction="column" className="form-input">
					<textarea
						v-model="diet_scheme_customized"
						:auto-height="true"
						placeholder="输入你的需求，AI将在已选方案基础上进行策略调整..."
						placeholder-class="placeholder"
					></textarea>
					<Flexbox align="center" className="confirm-btn" @tap="generateRecipe">
						<Typography color="white" :bold="true">生成食谱</Typography>
					</Flexbox>
				</Flexbox>
			</Flexbox>
			<block v-if="recipe_data.recipe_content.length && !isLoading">
				<Flexbox align="justify">
					<Typography fontSize="22" :bold="true">生成的食谱</Typography>
					<Flexbox gap="8">
						<Flexbox align="center" gap="2" @tap="onAnalysis">
							<Icon src="b_leaf.png" size="20"></Icon>
							<Typography color="gray1">营养分析</Typography>
						</Flexbox>
						<Flexbox align="center" gap="2" @tap="navigateTo(`/pagesA/cookbook/cookbook?id=${member_id}&memberId=${family_member_id}`)">
							<Icon src="b_file.png" size="20"></Icon>
							<Typography color="gray1">历史食谱</Typography>
						</Flexbox>
					</Flexbox>
				</Flexbox>
				<Flexbox direction="column" gap="16">
					<Flexbox direction="column" gap="12" v-for="(day, index) in recipe_data.recipe_content" :key="index">
						<Typography fontSize="16" :bold="true">第{{ index + 1 }}天</Typography>
						<Flexbox direction="column" className="table">
							<Flexbox className="tr" v-for="row in rows" :key="row">
								<Flexbox align="center" className="td">
									<Typography color="gray2">{{ rowsMap[row] }}</Typography>
								</Flexbox>
								<Flexbox align="left" className="td">
									<Typography className="meal-text">{{ mergedQuantities(day[row] || []).join('\n') }}</Typography>
								</Flexbox>
							</Flexbox>
						</Flexbox>
					</Flexbox>
				</Flexbox>
			</block>
		</Flexbox>

		<Flexbox align="center" direction="column" gap="30" className="empty-content" v-if="isLoading">
			<Flexbox align="center" direction="column">
				<Typography color="primary">暂无食谱数据，</Typography>
				<Typography color="primary">请为客户制定生成</Typography>
			</Flexbox>
			<!-- <Flexbox align="center" className="refresh-btn" @tap="getCookbook">
				<Typography fontSize="16" color="primary">刷新</Typography>
			</Flexbox> -->
		</Flexbox>

		<Flexbox direction="column" align="center" className="empty-scheme" v-if="isEmpty">
			<Icon src="b_empty-result.png" size="128"></Icon>
			<Flexbox direction="column" align="center" gap="12">
				<Flexbox direction="column" align="center">
					<Typography color="gray2">该成员还没有制定</Typography>
					<Typography color="gray2">膳食方案</Typography>
				</Flexbox>
				<Flexbox align="center" className="select-btn" @tap="navigateTo(`/pagesA/scheme/list?id=${member_id}&memberId=${family_member_id}`)">
					<Typography fontSize="16" color="white" :bold="true">选择方案</Typography>
				</Flexbox>
			</Flexbox>
		</Flexbox>

		<Flexbox gap="9" className="tabbar-content" v-if="recipe_data.recipe_content.length && !isEmpty && !isLoading">
			<Flexbox align="center" gap="4" className="adjust-btn" @tap="openPopup('speechPopup')">
				<Icon src="b_microphone-primary.png" size="24"></Icon>
				<Typography fontSize="18" color="primary">调整食谱</Typography>
			</Flexbox>
			<Flexbox align="center" className="push-btn" @tap="onPush">
				<Typography fontSize="18" color="white" :bold="true">直接推送</Typography>
			</Flexbox>
		</Flexbox>
		<Speech ref="speechPopup" @confirm="setText"></Speech>
	</view>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { request } from '@/utils/request';
export default {
	data() {
		return {
			navbarBgColor: 'transparent',
			rows: ['breakfast', 'lunch', 'snack', 'dinner', 'morning'],
			rowsMap: {
				breakfast: '早餐',
				lunch: '午餐',
				snack: '加餐',
				dinner: '晚餐',
				morning: '药食同源'
			},
			family_member_id: '',
			member_id: '',
			member_index: '',
			family_members: [],
			relationship: '',
			headimg: '',
			member_name: '',
			disease_name: '',
			scheme_name: '',
			scheme_id: '',
			diet_scheme_customized: '',
			recipe_data: {
				recipe_content: []
			},
			speechResult: '',
			isLoading: false,
			isEmpty: false
		};
	},
	onLoad(option) {
		this.member_id = parseInt(option.id);
	},
	onShow() {
		this.getCustomer();
		if (this.recipeData) {
			this.recipe_data = this.recipeData;
		}
	},
	onPageScroll(e) {
		if (e.scrollTop >= 50) {
			this.navbarBgColor = '#ffffff';
		} else {
			this.navbarBgColor = 'transparent';
		}
	},
	computed: {
		...mapState(['recipeData'])
	},
	methods: {
		...mapMutations(['setNutritionData', 'setRecipeData']),
		openPopup(ref) {
			this.$refs[ref].open();
		},
		setText(text) {
			this.speechResult += text;
			this.tuneRecipe();
		},
		mergedQuantities(meal) {
			return [].concat(...meal.map((dish) => dish.name + '(' + dish.quantity + ')'));
		},
		selectMember(e) {
			this.member_index = e.detail.value;
			// this.member_id = this.family_members[e.detail.value].member_id;
			this.member_name = this.family_members[e.detail.value].name;
			this.family_member_id = this.family_members[e.detail.value].id;
			this.member_name = this.family_members[e.detail.value].name;
			this.headimg = this.family_members[e.detail.value].user_headimg;
			this.relationship = this.family_members[e.detail.value].relationship;
			this.scheme_id = '';
			this.scheme_name = '';
			this.recipe_data.recipe_content = [];
			this.updateHomepage();
		},
		updateHomepage() {
			request({
				url: `/api/health-service/user-member-record/update_homepage?member_id=${this.family_member_id}`,
				method: 'POST',
				success: (res) => {
					if (res) {
						this.getDiseaseHistory();
						this.getScheme();
						this.getCookbook();
					}
				}
			});
		},
		navigateTo(url) {
			uni.navigateTo({
				url
			});
		},
		onAnalysis() {
			uni.showLoading({
				title: '正在分析...',
				mask: true
			});
			request({
				url: '/api/health-service/diet-scheme/analyze_recipe_nutrition',
				method: 'POST',
				data: {
					member_id: this.family_member_id,
					recipe_data: this.recipe_data.recipe_content
				},
				success: (res) => {
					if (res) {
						this.setNutritionData(res);
						this.navigateTo('/pagesA/scheme/nutrition');
					}
				},
				complete: () => {
					uni.hideLoading();
				}
			});
		},
		onPush() {
			uni.showLoading({
				title: '正在推送...',
				mask: true
			});
			request({
				url: '/api/health-service/diet-scheme/save-recipe',
				method: 'POST',
				data: {
					user_id: this.member_id,
					member_id: this.family_member_id,
					diet_scheme_id: this.scheme_id,
					recipe_data: this.recipe_data
				},
				success: (res) => {
					if (res) {
						uni.showToast({
							title: '推送成功',
							icon: 'none'
						});
						this.recipe_data = res;
					}
				},
				complete: () => {
					uni.hideLoading();
				}
			});
		},
		tuneRecipe() {
			uni.showLoading({
				title: '正在调整...',
				mask: true
			});
			request({
				url: '/api/health-service/diet-scheme/tune-recipe',
				method: 'POST',
				data: {
					recipe_data: this.recipe_data,
					text_string: this.speechResult
				},
				success: (res) => {
					if (res) {
						this.recipe_data = res;
					}
				},
				complete: () => {
					uni.hideLoading();
				}
			});
		},
		generateRecipe() {
			uni.showLoading({
				title: '正在生成...',
				mask: true
			});
			request({
				url: '/api/health-service/diet-scheme/generate-recipe',
				method: 'POST',
				data: {
					user_id: this.member_id,
					member_id: this.family_member_id,
					diet_scheme_id: this.scheme_id,
					diet_scheme_customized: this.diet_scheme_customized
				},
				success: (res) => {
					if (res) {
						this.recipe_data = res;
					}
				},
				complete: () => {
					uni.hideLoading();
				}
			});
		},
		getCustomer() {
			request({
				url: `/api/customers/${this.member_id}`,
				success: (res) => {
					if (res) {
						this.family_members = res.family_members;
						this.member_index = res.family_members.findIndex((item) => item.id === res.family_member_id);
						this.family_member_id = res.family_members[this.member_index].id;
						this.member_name = res.family_members[this.member_index].name;
						this.headimg = res.family_members[this.member_index].user_headimg;
						this.relationship = res.family_members[this.member_index].relationship;
						this.getDiseaseHistory();
						this.getScheme();
						this.getCookbook();
					}
				}
			});
		},
		getDiseaseHistory() {
			request({
				url: '/api/health-service/user-member-record/disease_history',
				data: {
					family_member_id: this.family_member_id
				},
				success: (res) => {
					if (res) {
						this.disease_name = res.map((item) => item.disease_name).join('、');
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
						this.isEmpty = false;
					} else {
						this.isEmpty = true;
					}
				}
			});
		},
		getCookbook() {
			request({
				url: '/api/health-service/diet-scheme/get-user-recipe',
				method: 'POST',
				data: {
					user_id: this.member_id,
					member_id: this.family_member_id
				},
				success: (res) => {
					if (res) {
						this.recipe_data = res;
						this.isLoading = false;
					} else {
						this.isLoading = true;
					}
				}
			});
		}
	}
};
</script>

<style lang="scss">
.scheme-page {
	min-height: 100vh;
	background-color: $uni-bg-color;
	padding-bottom: 202rpx;

	.user-content {
		padding: 52rpx 32rpx 40rpx 32rpx;
	}

	.user-info {
		flex: 1;
	}

	.user-avatar {
		flex: none;
	}

	.scheme-container {
		background-color: #fff;
		border-radius: 32rpx;
		padding: 48rpx 32rpx;
	}

	.form-input {
		padding: 24rpx 24rpx 14rpx 24rpx;
		box-shadow: 0 0 0 2rpx $uni-border-color inset;
		border-radius: 16rpx;

		textarea {
			width: 100%;
			min-height: 144rpx;
		}
	}

	.confirm-btn {
		width: 120rpx;
		height: 48rpx;
		border-radius: 44rpx;
		margin-left: auto;
		background-color: $uni-color-primary;
	}

	.table {
		border: 2rpx solid $uni-border-color;
		border-radius: 8rpx;
		.tr {
			border-bottom: 2rpx solid $uni-border-color;
			&:last-child {
				border-bottom: none;
			}
		}
		.td {
			width: 526rpx;
			padding: 16rpx 24rpx;
			border-left: 2rpx solid $uni-border-color;
			&:first-child {
				width: 162rpx;
				border-left: none;
			}
		}

		.meal-text.text {
			white-space: break-spaces;
			line-height: 44rpx;
		}
	}

	.tabbar-content {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 16rpx 32rpx env(safe-area-inset-bottom) 32rpx;
		background-color: $uni-bg-color;
	}

	.adjust-btn,
	.push-btn {
		width: 334rpx;
		height: 88rpx;
		border-radius: 44rpx;
	}

	.adjust-btn {
		box-shadow: 0 0 0 2rpx $uni-color-primary inset;
	}

	.push-btn {
		background-color: $uni-color-primary;
	}

	.empty-content {
		margin-top: 60rpx;
	}

	.refresh-btn {
		width: 200rpx;
		height: 64rpx;
		border-radius: 44rpx;
		box-shadow: 0 0 0 2rpx $uni-color-primary inset;
	}

	.empty-scheme {
		margin-top: 216rpx;
	}

	.select-btn {
		width: 200rpx;
		height: 72rpx;
		background-color: $uni-color-primary;
		border-radius: 44rpx;
	}
}
</style>
