<template>
	<view class="cookbook-detail-page">
		<Navbar title="食谱详情"></Navbar>
		<Flexbox direction="column" gap="8" className="point-content">
			<Typography color="gray2" :bold="true">食谱制定要点：</Typography>
			<Typography>{{ diet_scheme_customized || '无' }}</Typography>
		</Flexbox>
		<Flexbox direction="column" gap="24">
			<Flexbox align="justify">
				<Typography fontSize="22" :bold="true">食谱</Typography>
				<Flexbox align="center" gap="2" @tap="onAnalysis">
					<Icon src="b_leaf.png" size="20"></Icon>
					<Typography color="gray1">营养分析</Typography>
				</Flexbox>
			</Flexbox>
			<Flexbox direction="column" gap="16">
				<Flexbox direction="column" gap="12" v-for="(day, index) in recipe_content" :key="index">
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
		</Flexbox>
		<Flexbox className="tabbar-content">
			<Flexbox align="center" className="use-btn" @tap="navigateTo(`/pagesA/scheme/scheme?id=${member_id}`)">
				<Typography fontSize="18" color="white" :bold="true">复用本食谱</Typography>
			</Flexbox>
		</Flexbox>
	</view>
</template>

<script>
import { mapMutations } from 'vuex';
import { request } from '@/utils/request';
export default {
	data() {
		return {
			member_id: '',
			family_member_id: '',
			recipe_id: '',
			diet_scheme_customized: '',
			recipe_content: [],
			rows: ['breakfast', 'lunch', 'snack', 'dinner', 'morning'],
			rowsMap: {
				breakfast: '早餐',
				lunch: '午餐',
				snack: '加餐',
				dinner: '晚餐',
				morning: '药食同源'
			}
		};
	},
	onLoad(option) {
		this.member_id = parseInt(option.id);
		this.family_member_id = parseInt(option.memberId);
		this.recipe_id = parseInt(option.recipeId);
		this.getCookbook();
	},
	methods: {
		...mapMutations(['setNutritionData', 'setRecipeData']),
		mergedQuantities(meal) {
			return [].concat(...meal.map((dish) => dish.name + '(' + dish.quantity + ')'));
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
					recipe_data: this.recipe_content
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
		getCookbook() {
			request({
				url: '/api/health-service/diet-scheme/get-user-recipe',
				method: 'POST',
				data: {
					user_id: this.member_id,
					member_id: this.family_member_id,
					recipe_id: this.recipe_id
				},
				success: (res) => {
					if (res) {
						this.diet_scheme_customized = res.diet_scheme_customized;
						this.recipe_content = res.recipe_content;
						this.setRecipeData(res);
					}
				}
			});
		}
	}
};
</script>

<style lang="scss">
.cookbook-detail-page {
	padding: 32rpx 32rpx 226rpx 32rpx;

	.point-content {
		padding: 24rpx;
		border-radius: 16rpx;
		background-color: $uni-bg-color-2;
		margin-bottom: 52rpx;
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
	}

	.use-btn {
		width: 686rpx;
		height: 88rpx;
		background-color: $uni-color-primary;
		border-radius: 44rpx;
	}
}
</style>
