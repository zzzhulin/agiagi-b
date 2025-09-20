<template>
	<view class="scheme-detail-page">
		<Navbar title="方案详情"></Navbar>
		<Flexbox direction="column" gap="20" v-if="scheme">
			<Flexbox direction="column" gap="12" className="scheme-content">
				<Typography fontSize="24" color="primary" :bold="true" className="scheme-title">{{ scheme.name }}</Typography>
				<Flexbox direction="column" gap="4">
					<Typography color="gray2">方案周期：</Typography>
					<Flexbox>
						<Typography>{{ scheme.duration_description }}</Typography>
						<!-- <Typography>{{ scheme.duration_days }}天能量减肥套餐</Typography>
						<Typography color="primary">（￥{{ scheme.price }}）</Typography> -->
					</Flexbox>
				</Flexbox>
			</Flexbox>
			<Flexbox direction="column" gap="16">
				<Typography fontSize="18" :bold="true">方案食谱模型</Typography>
				<Flexbox direction="column" className="table">
					<Flexbox className="tr">
						<Flexbox align="center" className="td">
							<Typography color="gray2">晨间</Typography>
						</Flexbox>
						<Flexbox align="left" className="td">
							<Typography>{{ formatFood(scheme.diet_schemes.morning.food) }}</Typography>
						</Flexbox>
					</Flexbox>
					<Flexbox className="tr">
						<Flexbox align="center" className="td">
							<Typography color="gray2">早餐</Typography>
						</Flexbox>
						<Flexbox align="left" className="td">
							<Typography>{{ formatFood(scheme.diet_schemes.breakfast.food) }}</Typography>
						</Flexbox>
					</Flexbox>
					<Flexbox className="tr">
						<Flexbox align="center" className="td">
							<Typography color="gray2">午餐</Typography>
						</Flexbox>
						<Flexbox align="left" className="td">
							<Typography>{{ formatFood(scheme.diet_schemes.lunch.food) }}</Typography>
						</Flexbox>
					</Flexbox>
					<Flexbox className="tr">
						<Flexbox align="center" className="td">
							<Typography color="gray2">加餐</Typography>
						</Flexbox>
						<Flexbox align="left" className="td">
							<Typography>{{ formatFood(scheme.diet_schemes.snack.food) }}</Typography>
						</Flexbox>
					</Flexbox>
					<Flexbox className="tr">
						<Flexbox align="center" className="td">
							<Typography color="gray2">晚餐</Typography>
						</Flexbox>
						<Flexbox align="left" className="td">
							<Typography>{{ formatFood(scheme.diet_schemes.dinner.food) }}</Typography>
						</Flexbox>
					</Flexbox>
				</Flexbox>
				<Typography color="gray1">本方案适应人群：{{ scheme.suitable_population }}。本方案{{ scheme.advantages }}。</Typography>
			</Flexbox>
			<Flexbox direction="column" gap="16">
				<Typography fontSize="18" :bold="true">方案食谱解析</Typography>
				<view class="chart-content">
					<Flexbox direction="column" gap="16" className="pie-legend" v-if="pieResult && chartIndex === 1">
						<Flexbox align="baseline" gap="5">
							<view class="dot primary-dot"></view>
							<Flexbox direction="column" gap="4">
								<Typography fontSize="12" :bold="true">
									碳水
									{{ pieResult.percentage['碳水化合物'] % 1 === 0 ? pieResult.percentage['碳水化合物'] : pieResult.percentage['碳水化合物'].toFixed(2) }}%
								</Typography>
								<Typography fontSize="12" color="gray1">{{ pieResult.weight['碳水化合物'] }}g / {{ pieResult.energy['碳水化合物'] }}kcal</Typography>
							</Flexbox>
						</Flexbox>
						<Flexbox align="baseline" gap="5">
							<view class="dot accent-dot"></view>
							<Flexbox direction="column" gap="4">
								<Typography fontSize="12" :bold="true">
									蛋白质
									{{ pieResult.percentage['蛋白质'] % 1 === 0 ? pieResult.percentage['蛋白质'] : pieResult.percentage['蛋白质'].toFixed(2) }}%
								</Typography>
								<Typography fontSize="12" color="gray1">{{ pieResult.weight['蛋白质'] }}g / {{ pieResult.energy['蛋白质'] }}kcal</Typography>
							</Flexbox>
						</Flexbox>
						<Flexbox align="baseline" gap="5">
							<view class="dot warning-dot"></view>
							<Flexbox direction="column" gap="4">
								<Typography fontSize="12" :bold="true">
									脂肪
									{{ pieResult.percentage['脂肪'] % 1 === 0 ? pieResult.percentage['脂肪'] : pieResult.percentage['脂肪'].toFixed(2) }}%
								</Typography>
								<Typography fontSize="12" color="gray1">{{ pieResult.weight['脂肪'] }}g / {{ pieResult.energy['脂肪'] }}kcal</Typography>
							</Flexbox>
						</Flexbox>
					</Flexbox>
					<Flexbox align="center" gap="16" className="chart-tab">
						<Typography :color="chartIndex === 0 ? 'primary' : 'gray2'" :bold="chartIndex === 0" @tap="selectChart(0)">NRV分析</Typography>
						<Typography :color="chartIndex === 1 ? 'primary' : 'gray2'" :bold="chartIndex === 1" @tap="selectChart(1)">供能比分析</Typography>
					</Flexbox>
					<l-echart ref="chart"></l-echart>
					<Typography fontSize="12" color="primary" className="chart-title">* 选用中国人膳食推荐标准 *</Typography>
				</view>
				<Typography color="gray1">{{ recipe_summary }}</Typography>
			</Flexbox>
		</Flexbox>
	</view>
</template>

<script>
import { request } from '@/utils/request';
import * as echarts from '@/utils/echarts.min';
export default {
	data() {
		return {
			chartIndex: 0,
			pieResult: null,
			radarOption: {
				title: {
					text: '* 选用中国人膳食推荐标准 *',
					bottom: 5,
					left: 'center',
					textStyle: {
						fontSize: 12,
						lineHeight: 17,
						fontWeight: 'normal',
						color: '#30A375',
						opacity: 0.8
					}
				},
				legend: {
					show: false,
					top: 16,
					padding: 0,
					type: 'scroll',
					icon: 'none',
					left: 15,
					itemGap: 12,
					itemWidth: 0,
					itemHeight: 0,
					data: ['NRV分析', '供能比分析', '膳食结构分析', '食疗方案分析'],
					textStyle: {
						color: '#88888A',
						fontSize: 14,
						rich: {
							selected: {
								color: '#30A375',
								fontWeight: '600',
								fontSize: 14
							},
							normal: {
								color: '#88888A',
								fontSize: 14
							}
						}
					},
					selectedMode: 'single'
				},
				radar: {
					center: [160, 174],
					radius: 94,
					nameGap: 6,
					indicator: [
						{ name: '碳水', max: 100 },
						{ name: '蛋白质', max: 100 },
						{ name: '脂肪', max: 100 },
						{ name: '矿物质', max: 100 },
						{ name: '维生素', max: 100 },
						{ name: '膳食纤维', max: 100 },
						{ name: '水', max: 100 },
						{ name: '植物营养因', max: 100 }
					],
					shape: 'polygon',
					splitNumber: 5,
					axisName: {
						color: '#555557'
					},
					splitLine: {
						lineStyle: {
							type: 'dashed',
							color: [
								'rgba(238, 197, 102, 0)',
								'rgba(48, 163, 117,1)',
								'rgba(238, 197, 102, 0)',
								'rgba(238, 197, 102, 0)',
								'rgba(238, 197, 102, 0)',
								'rgba(238, 197, 102, 0)'
							].reverse()
						}
					},
					splitArea: {
						show: false
					},
					axisLine: {
						lineStyle: {
							color: 'rgba(224, 230, 241, 1)'
						}
					}
				},
				series: [
					{
						name: 'NRV分析',
						type: 'radar',
						lineStyle: {
							opacity: 0
						},
						data: [],
						symbol: 'none',
						itemStyle: {
							color: '#4EF08C'
						},
						areaStyle: {
							opacity: 0.7
						}
					}
				]
			},
			pieOption: {
				color: ['#1D9E91', '#4EF08C', '#FF8B39'],
				legend: {
					show: false,
					orient: 'vertical',
					top: 'middle',
					icon: 'circle',
					left: 180,
					itemWidth: 8,
					itemHeight: 8,
					itemGap: 16,
					padding: 0,
					textStyle: {
						lineHeight: 17,
						padding: [0, 0, 0, 3]
					}
				},
				series: [
					{
						name: 'Access From',
						type: 'pie',
						left: 28,
						top: 115,
						radius: [52, 68],
						startAngle: 270,
						avoidLabelOverlap: false,
						width: 120,
						height: 120,
						label: {
							show: false,
							position: 'center'
						},
						labelLine: {
							show: false
						},
						data: [
							{ value: '', name: '碳水化合物' },
							{ value: '', name: '蛋白质' },
							{ value: '', name: '脂肪' }
						]
					}
				]
			},
			scheme: null,
			member_id: '',
			family_member_id: '',
			diet_scheme_id: '',
			recipe_summary: ''
		};
	},
	onLoad(option) {
		this.member_id = parseInt(option.id);
		this.family_member_id = parseInt(option.memberId);
		this.diet_scheme_id = parseInt(option.schemeId);
		this.getScheme();
	},
	methods: {
		formatFood(foodArray) {
			if (!Array.isArray(foodArray)) {
				return;
			}
			return foodArray.map((item) => `${item.name}${item.quantity}`).join('、');
		},
		selectChart(index) {
			this.chartIndex = index;
			if (index) {
				this.initPieChart(this.scheme.calculate_nutrition_percentage.energy_ratio);
			} else {
				this.initRadarChart(this.scheme.calculate_nutrition_percentage);
			}
		},
		initRadarChart(data) {
			this.$nextTick(() => {
				this.$refs.chart.init(echarts, (chart) => {
					this.radarOption.series[0].data = [[data['碳水化合物'], data['蛋白质'], data['脂肪'], data['矿物质'], data['维生素'], data['膳食纤维'], data['水']]];
					chart.setOption(this.radarOption);
				});
			});
		},
		initPieChart(data) {
			this.$nextTick(() => {
				this.$refs.chart.init(echarts, (chart) => {
					this.pieOption.series[0].data[0].value = data.percentage['碳水化合物'];
					this.pieOption.series[0].data[1].value = data.percentage['蛋白质'];
					this.pieOption.series[0].data[2].value = data.percentage['脂肪'];
					chart.setOption(this.pieOption);
				});
			});
		},
		getScheme() {
			request({
				url: '/api/health-service/diet-scheme/get_diet_detail',
				data: {
					user_id: this.member_id,
					member_id: this.family_member_id,
					diet_scheme_id: this.diet_scheme_id
				},
				success: (res) => {
					if (res) {
						this.scheme = res;
						this.pieResult = res.calculate_nutrition_percentage.energy_ratio;
						this.recipe_summary = res.calculate_nutrition_percentage.recipe_summary;
						this.initRadarChart(res.calculate_nutrition_percentage);
					}
				}
			});
		}
	}
};
</script>

<style lang="scss">
.scheme-detail-page {
	min-height: 100vh;
	padding: 60rpx 32rpx env(safe-area-inset-bottom) 32rpx;

	.scheme-content {
		padding-bottom: 40rpx;
		border-bottom: 2rpx dashed $uni-text-color-gray2;
	}

	.text.scheme-title {
		line-height: 68rpx;
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
				width: 160rpx;
				border-left: none;
			}
		}
	}

	.chart-content {
		position: relative;
		width: 686rpx;
		height: 680rpx;
		border-radius: 24rpx;
		background-color: $uni-bg-color-2;
		overflow: hidden;

		.icon {
			position: absolute;
		}
	}

	.pie-legend {
		position: absolute;
		top: 204rpx;
		left: 360rpx;
		z-index: 9999;

		.dot {
			width: 16rpx;
			height: 16rpx;
			border-radius: 50%;
		}

		.primary-dot {
			background-color: $uni-color-primary;
		}

		.accent-dot {
			background-color: $uni-color-accent1;
		}

		.warning-dot {
			background-color: $uni-color-warning;
		}
	}

	.chart-tab,
	.chart-title {
		position: absolute;
		left: 0;
		right: 0;
		margin: 0 auto;
		z-index: 9999;
	}

	.chart-tab {
		top: 40rpx;
	}

	.chart-title {
		bottom: 20rpx;
		text-align: center;
		opacity: 0.8;
	}
}
</style>
