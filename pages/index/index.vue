<template>
	<view class="container">
		<!-- 搜索栏 -->
		<view class="search-bar">
			<view class="search-input">
				<svg-icon name="search" color="#999" size="32" />
				<input 
					type="text" 
					v-model="searchKey" 
					placeholder="搜索账单" 
					@input="onSearch"
				/>
			</view>
		</view>
		
		<!-- 顶部统计 -->
		<view class="statistics-bar">
			<view class="amount-box">
				<text class="label">本月支出</text>
				<text class="amount">¥{{ monthlyExpense }}</text>
			</view>
			<view class="amount-box">
				<text class="label">本月收入</text>
				<text class="amount">¥{{ monthlyIncome }}</text>
			</view>
		</view>
		
		<!-- 最近添加 -->
		<view class="recent-section" v-if="!searchKey">
			<view class="section-header">
				<text class="title">最近添加</text>
				<text class="more" @click="showAllRecent">查看更多</text>
			</view>
			<scroll-view class="recent-list" scroll-x>
				<view 
					class="recent-item"
					v-for="bill in recentBills"
					:key="bill.id"
					@click="showBillDetail(bill)"
				>
					<view class="icon" :style="{ backgroundColor: bill.category.color }">
						<svg-icon :name="bill.category.icon" color="#fff" size="40" />
					</view>
					<text class="amount" :class="{ 'income': bill.type === 'income' }">
						{{ bill.type === 'income' ? '+' : '-' }}{{ bill.amount }}
					</text>
					<text class="date">{{ formatRecentDate(bill.date) }}</text>
				</view>
			</scroll-view>
		</view>
		
		<!-- 账单列表 -->
		<view class="bill-list">
			<template v-if="searchKey && !filteredBills.length">
				<view class="empty-result">
					<text>未找到相关账单</text>
				</view>
			</template>
			<template v-else>
				<bill-item 
					v-for="bill in (searchKey ? filteredBills : bills)" 
					:key="bill.id" 
					:bill="bill"
					@delete="onBillDelete"
				/>
			</template>
		</view>
		
		<!-- 添加按钮 -->
		<view class="add-btn" @click="navigateToAdd">
			<svg-icon name="add" color="#fff" size="50" />
		</view>
	</view>
</template>

<script>
import db from '@/utils/database.js'
import { formatAmount } from '@/utils/common.js'
import BillItem from '@/components/bill-item.vue'
import SvgIcon from '@/components/SvgIcon.vue'

export default {
	components: {
		BillItem,
		SvgIcon
	},
	data() {
		return {
			bills: [],
			searchKey: '',
			monthlyExpense: '0.00',
			monthlyIncome: '0.00',
			filteredBills: []
		}
	},
	computed: {
		recentBills() {
			return this.bills.slice(0, 5) // 只显示最近5条
		}
	},
	onShow() {
		this.loadBills()
		this.calculateMonthlyStats()
	},
	methods: {
		loadBills() {
			this.bills = db.getBills()
		},
		calculateMonthlyStats() {
			const currentMonth = new Date().getMonth() + 1
			const monthlyBills = this.bills.filter(bill => {
				const billMonth = new Date(bill.date).getMonth() + 1
				return billMonth === currentMonth
			})
			
			this.monthlyExpense = formatAmount(
				monthlyBills
					.filter(bill => bill.type === 'expense')
					.reduce((sum, bill) => sum + Number(bill.amount), 0)
			)
			
			this.monthlyIncome = formatAmount(
				monthlyBills
					.filter(bill => bill.type === 'income')
					.reduce((sum, bill) => sum + Number(bill.amount), 0)
			)
		},
		onSearch() {
			if (!this.searchKey) {
				this.filteredBills = []
				return
			}
			
			const key = this.searchKey.toLowerCase()
			this.filteredBills = this.bills.filter(bill => 
				bill.category.name.toLowerCase().includes(key) ||
				bill.amount.toString().includes(key) ||
				bill.remark?.toLowerCase().includes(key)
			)
		},
		formatRecentDate(date) {
			const billDate = new Date(date)
			const today = new Date()
			const yesterday = new Date(today)
			yesterday.setDate(yesterday.getDate() - 1)
			
			if (billDate.toDateString() === today.toDateString()) {
				return '今天'
			} else if (billDate.toDateString() === yesterday.toDateString()) {
				return '昨天'
			} else {
				return `${billDate.getMonth() + 1}月${billDate.getDate()}日`
			}
		},
		showAllRecent() {
			uni.navigateTo({
				url: '/pages/bill-list/bill-list'
			})
		},
		showBillDetail(bill) {
			uni.showModal({
				title: '账单详情',
				content: `分类：${bill.category.name}\n金额：${bill.amount}\n日期：${bill.date}\n备注：${bill.remark || '无'}`,
				showCancel: false
			})
		},
		navigateToAdd() {
			uni.navigateTo({
				url: '/pages/add/add'
			})
		},
		onBillDelete() {
			// 重新加载账单数据
			this.loadBills()
			this.calculateMonthlyStats()
		}
	}
}
</script>

<style>
.container {
	padding: 20rpx;
}
.search-bar {
	margin-bottom: 20rpx;
}
.search-input {
	background: #fff;
	border-radius: 10rpx;
	padding: 20rpx;
	display: flex;
	align-items: center;
}
.search-input input {
	flex: 1;
	margin-left: 20rpx;
	font-size: 28rpx;
}
.statistics-bar {
	display: flex;
	justify-content: space-around;
	padding: 20rpx;
	background: #fff;
	border-radius: 10rpx;
	margin-bottom: 20rpx;
}
.amount-box {
	text-align: center;
}
.label {
	font-size: 24rpx;
	color: #666;
}
.amount {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
}
.recent-section {
	background: #fff;
	border-radius: 10rpx;
	padding: 20rpx;
	margin-bottom: 20rpx;
}
.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}
.title {
	font-size: 32rpx;
	font-weight: bold;
}
.more {
	font-size: 24rpx;
	color: #007AFF;
}
.recent-list {
	white-space: nowrap;
}
.recent-item {
	display: inline-block;
	width: 160rpx;
	text-align: center;
	margin-right: 20rpx;
}
.recent-item .icon {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 0 auto 10rpx;
}
.recent-item .amount {
	font-size: 28rpx;
	display: block;
	margin-bottom: 5rpx;
}
.recent-item .amount.income {
	color: #4CAF50;
}
.recent-item .date {
	font-size: 24rpx;
	color: #999;
}
.empty-result {
	text-align: center;
	padding: 100rpx 0;
	color: #999;
	font-size: 28rpx;
}
.add-btn {
	position: fixed;
	right: 30rpx;
	bottom: 150rpx;
	width: 100rpx;
	height: 100rpx;
	background: #007AFF;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}
</style>
