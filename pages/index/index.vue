<template>
	<view class="index-page">
		<Typography fontSize="22" :bold="true" className="title">服务台</Typography>
		<Flexbox align="justify" className="search-content">
			<input v-model="search" type="text" placeholder="关键字搜索" placeholder-class="placeholder" class="search-input" @confirm="onSearch" />
			<Icon src="b_search.png" size="24" @tap="onSearch"></Icon>
		</Flexbox>
		<Flexbox align="justify" className="tab-content">
			<Flexbox gap="20">
				<Typography
					fontSize="16"
					:color="status === tab.label ? 'primary' : 'gray1'"
					:bold="status === tab.value"
					v-for="tab in tabs"
					:key="tab.value"
					@tap="selectTab(tab.label)"
				>
					{{ tab.label }}
				</Typography>
			</Flexbox>
			<Flexbox align="center" @tap="onSort">
				<Typography color="gray1">时间</Typography>
				<Icon src="b_descend.png" size="24" v-if="sort_order === 'desc'"></Icon>
				<Icon src="b_ascend.png" size="24" v-else></Icon>
			</Flexbox>
		</Flexbox>
		<Flexbox direction="column" gap="12">
			<Flexbox align="left" gap="12" className="customer-item" v-for="customer in customers" :key="customer.card_id" @tap="navigateTo(customer.member_id)">
				<Icon :src="customer.member_avatar" size="44" type="remote" :circle="true"></Icon>
				<Flexbox direction="column" gap="6" className="customer-content">
					<Flexbox align="justify">
						<Typography fontSize="16" :bold="true">{{ customer.member_name }}</Typography>
						<Flexbox align="center" gap="2" v-if="customer.service_status">
							<Icon src="b_robot.png" size="20"></Icon>
							<Typography fontSize="12" color="primary">{{ customer.service_status }}</Typography>
						</Flexbox>
					</Flexbox>
					<Flexbox align="justify">
						<Flexbox gap="8">
							<Typography fontSize="12" color="gray1">{{ customer.card_name }}</Typography>
							<Typography fontSize="12" color="gray1">|</Typography>
							<Typography fontSize="12" color="warning">{{ customer.remaining_days }}天后到期</Typography>
						</Flexbox>
						<Typography fontSize="12" color="gray2">已服务{{ customer.service_days }}天</Typography>
					</Flexbox>
				</Flexbox>
			</Flexbox>
		</Flexbox>
		<Flexbox align="center" direction="column" className="empty-content" v-if="!customers.length && loaded">
			<Icon src="empty.png" size="128"></Icon>
			<Typography color="gray2">暂无数据</Typography>
		</Flexbox>
	</view>
</template>

<script>
import { request } from '@/utils/request';
export default {
	data() {
		return {
			loaded: false,
			page: 1,
			status: '服务中',
			sort_order: 'desc',
			search: '',
			tabs: [
				{
					label: '服务中',
					value: 'active'
				},
				{
					label: '临期',
					value: 'advent'
				},
				{
					label: '历史客户',
					value: 'history'
				}
			],
			customers: [],
			total: 0
		};
	},
	onShow() {
		this.getCustomers();
	},
	onReachBottom() {
		if (this.customers.length < this.total) {
			this.page++;
			this.getCustomers();
		}
	},
	methods: {
		onSearch() {
			this.loaded = false;
			this.page = 1;
			this.customers = [];
			this.getCustomers();
		},
		onSort() {
			if (this.sort_order === 'desc') {
				this.sort_order = 'asc';
			} else {
				this.sort_order = 'desc';
			}
			this.loaded = false;
			this.page = 1;
			this.customers = [];
			this.getCustomers();
		},
		selectTab(label) {
			this.loaded = false;
			this.status = label;
			this.page = 1;
			this.customers = [];
			this.getCustomers();
		},
		navigateTo(id) {
			uni.navigateTo({
				url: `/pagesA/customer/customer?id=${id}`
			});
		},
		getCustomers() {
			request({
				url: '/api/customers/list',
				data: {
					page: this.page,
					status: this.status,
					sort_order: this.sort_order,
					sort_by: 'use_time',
					page_size: 20,
					search: this.search
				},
				success: (res) => {
					if (res && res.total) {
						if (this.page === 1) {
							this.customers = res.customers;
						} else {
							this.customers = this.customers.concat(res.customers);
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
.index-page {
	min-height: 100vh;
	padding: 0 32rpx 24rpx 32rpx;
	background-color: $uni-bg-color;

	.title {
		padding-top: 88rpx;
	}

	.search-content {
		margin: 32rpx 0;
		padding: 0 24rpx;
		height: 72rpx;
		background-color: #ffffff;
		border-radius: 48rpx;
	}

	.search-input {
		flex: 1;
	}

	.tab-content {
		margin: 32rpx 0;
	}

	.customer-item {
		height: 160rpx;
		background-color: #fff;
		border-radius: 24rpx;
		padding: 0 28rpx 0 24rpx;
	}

	.customer-content {
		flex: 1;
	}

	.empty-content {
		margin-top: 200rpx;
	}
}
</style>
