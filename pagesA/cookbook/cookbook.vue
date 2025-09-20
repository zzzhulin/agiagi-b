<template>
	<view class="cookbook-page">
		<Navbar title="历史食谱" :backgroundColor="navbarBgColor"></Navbar>
		<Flexbox direction="column" gap="10">
			<Flexbox direction="column" gap="12" className="cookbook-item" v-for="item in cookbooks" :key="item.id">
				<Flexbox align="justify">
					<Typography fontSize="16" :bold="true">{{ item.date_range }}食谱</Typography>
					<Flexbox @tap="navigateTo(`/pagesA/cookbook/detail?id=${member_id}&memberId=${family_member_id}&recipeId=${item.id}`)">
						<Typography color="gray2">详情</Typography>
						<Icon src="b_arrow-right-gray3.png" size="20"></Icon>
					</Flexbox>
				</Flexbox>
				<Flexbox>
					<Typography color="gray2">制定要点：</Typography>
					<Typography color="gray1">《{{ item.title }}》</Typography>
				</Flexbox>
				<Flexbox align="justify">
					<Flexbox align="center" gap="8">
						<Icon :src="item.creator_avatar" size="28" type="remote" :circle="true"></Icon>
						<Typography fontSize="12" color="gray1">{{ item.creator }}制定</Typography>
					</Flexbox>
					<Flexbox align="center" className="use-btn" @tap="getCookbook(item.id)">
						<Typography fontSize="16" color="primary">复用</Typography>
					</Flexbox>
				</Flexbox>
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
			navbarBgColor: 'transparent',
			member_id: '',
			family_member_id: '',
			page: 1,
			cookbooks: [],
			total: 0
		};
	},
	onLoad(option) {
		this.member_id = parseInt(option.id);
		this.family_member_id = parseInt(option.memberId);
		this.getCookbooks();
	},
	onReachBottom() {
		if (this.cookbooks.length < this.total) {
			this.page++;
			this.getCookbooks();
		}
	},
	onPageScroll(e) {
		if (e.scrollTop >= 50) {
			this.navbarBgColor = '#ffffff';
		} else {
			this.navbarBgColor = 'transparent';
		}
	},
	methods: {
		...mapMutations(['setRecipeData']),
		navigateTo(url) {
			uni.navigateTo({
				url
			});
		},
		getCookbook(recipe_id) {
			request({
				url: '/api/health-service/diet-scheme/get-user-recipe',
				method: 'POST',
				data: {
					user_id: this.member_id,
					member_id: this.family_member_id,
					recipe_id
				},
				success: (res) => {
					if (res) {
						this.setRecipeData(res);
						this.navigateTo(`/pagesA/scheme/scheme?id=${this.member_id}`);
					}
				}
			});
		},
		getCookbooks() {
			request({
				url: '/api/health-service/diet-scheme/user-recipe-history',
				method: 'POST',
				data: {
					user_id: this.member_id,
					member_id: this.family_member_id,
					page: this.page,
					page_size: 20
				},
				success: (res) => {
					if (res && res.total) {
						if (this.page === 1) {
							this.cookbooks = res.items;
						} else {
							this.cookbooks = this.cookbooks.concat(res.items);
						}
						this.total = res.total;
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
.cookbook-page {
	min-height: 100vh;
	background-color: $uni-bg-color;
	padding: 20rpx 32rpx env(safe-area-inset-bottom) 32rpx;

	.cookbook-item {
		padding: 32rpx;
		border-radius: 24rpx;
		background-color: #fff;
	}

	.use-btn {
		width: 160rpx;
		height: 72rpx;
		background-color: $uni-color-accent2;
		border-radius: 44rpx;
	}
}
</style>
