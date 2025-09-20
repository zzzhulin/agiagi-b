<template>
	<view class="scheme-list-page">
		<Navbar title="更换方案" backgroundColor="transparent"></Navbar>
		<Flexbox align="justify" className="search-content">
			<input v-model="key_word" type="text" placeholder="关键字搜索" placeholder-class="placeholder" class="search-input" @confirm="getSchemes" />
			<Icon src="b_search.png" size="24" @tap="getSchemes"></Icon>
		</Flexbox>
		<Flexbox direction="column" gap="12">
			<Flexbox direction="column" gap="19" className="scheme-item" v-for="scheme in schemes" :key="scheme.id">
				<Flexbox align="justify">
					<Typography fontSize="18" :bold="true">{{ scheme.scheme_name }}</Typography>
					<Flexbox align="center" @tap="navigateTo(`/pagesA/scheme/detail?id=${member_id}&memberId=${family_member_id}&schemeId=${scheme.id}`)">
						<Typography color="gray2">详情</Typography>
						<Icon src="b_arrow-right-gray3.png" size="20"></Icon>
					</Flexbox>
				</Flexbox>

				<Flexbox align="justify">
					<Flexbox direction="column" gap="4">
						<Typography color="gray2">方案周期：</Typography>
						<Flexbox>
							<Typography>{{ scheme.duration_description }}</Typography>
							<!-- <Typography>{{ scheme.duration_days }}天能量减肥套餐</Typography>
							<Typography color="primary">（￥{{ scheme.price }}）</Typography> -->
						</Flexbox>
					</Flexbox>
					<Flexbox align="center" className="use-btn active" v-if="scheme.is_selected">
						<Typography fontSize="16" color="primary">正在使用</Typography>
					</Flexbox>
					<Flexbox align="center" className="use-btn" v-else @tap="onSelect(scheme.id)">
						<Typography fontSize="16" color="white" :bold="true">选用</Typography>
					</Flexbox>
				</Flexbox>
			</Flexbox>
		</Flexbox>
	</view>
</template>

<script>
import { request } from '@/utils/request';
export default {
	data() {
		return {
			member_id: '',
			family_member_id: '',
			key_word: '',
			schemes: []
		};
	},
	onLoad(option) {
		this.member_id = parseInt(option.id);
		this.family_member_id = parseInt(option.memberId);
		this.getSchemes();
	},
	methods: {
		navigateTo(url) {
			uni.navigateTo({
				url
			});
		},
		getSchemes() {
			request({
				url: '/api/health-service/diet-scheme/diet-schemes-status',
				data: {
					user_id: this.member_id,
					member_id: this.family_member_id,
					key_word: this.key_word
				},
				success: (res) => {
					if (res) {
						this.schemes = res.schemes;
					}
				}
			});
		},
		onSelect(diet_scheme_id) {
			request({
				url: '/api/health-service/diet-scheme/switch-diet-scheme',
				method: 'POST',
				data: {
					user_id: this.member_id,
					member_id: this.family_member_id,
					diet_scheme_id
				},
				success: (res) => {
					if (res) {
						this.getSchemes();
					}
				}
			});
		}
	}
};
</script>

<style lang="scss">
.scheme-list-page {
	padding: 40rpx 32rpx env(safe-area-inset-bottom) 32rpx;
	min-height: 100vh;
	background-color: $uni-bg-color;

	.search-content {
		margin: 0 0 32rpx 0;
		padding: 0 24rpx;
		height: 72rpx;
		background-color: #ffffff;
		border-radius: 48rpx;
	}

	.search-input {
		flex: 1;
	}

	.scheme-item {
		padding: 32rpx;
		border-radius: 24rpx;
		background-color: #fff;
	}

	.use-btn {
		width: 160rpx;
		height: 72rpx;
		border-radius: 44rpx;
		background-color: $uni-color-primary;
	}

	.use-btn.active {
		background-color: $uni-color-accent2;
	}
}
</style>
