<template>
  <view class="container">
    <!-- 时间选择器 -->
    <view class="date-picker">
      <picker mode="date" fields="month" :value="currentDate" @change="onDateChange">
        <text class="date">{{ currentYear }}年{{ currentMonth }}月</text>
      </picker>
    </view>
    
    <!-- 总览 -->
    <view class="overview">
      <view class="item">
        <text class="label">收入</text>
        <text class="amount income">¥{{ monthlyIncome }}</text>
      </view>
      <view class="item">
        <text class="label">支出</text>
        <text class="amount expense">¥{{ monthlyExpense }}</text>
      </view>
      <view class="item">
        <text class="label">结余</text>
        <text class="amount">¥{{ monthlyBalance }}</text>
      </view>
    </view>
    
    <!-- 分类统计 -->
    <view class="statistics-section">
      <view class="section-header">
        <text class="title">支出分类统计</text>
        <view class="type-switch">
          <text 
            :class="['type-btn', { active: showType === 'expense' }]"
            @click="showType = 'expense'"
          >支出</text>
          <text 
            :class="['type-btn', { active: showType === 'income' }]"
            @click="showType = 'income'"
          >收入</text>
        </view>
      </view>
      
      <view class="category-list">
        <view 
          class="category-item"
          v-for="item in currentStatistics"
          :key="item.category.id"
        >
          <view class="category-info">
            <view class="icon" :style="{ backgroundColor: item.category.color }">
              <text class="iconfont" :class="'icon-' + item.category.icon"></text>
            </view>
            <view class="detail">
              <text class="name">{{ item.category.name }}</text>
              <text class="percent">{{ item.percent }}%</text>
            </view>
          </view>
          <text class="amount">¥{{ item.amount }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import db from '@/utils/database.js'
import { formatAmount } from '@/utils/common.js'

export default {
  data() {
    return {
      currentDate: '',
      showType: 'expense',
      monthlyIncome: '0.00',
      monthlyExpense: '0.00',
      statistics: {
        expense: [],
        income: []
      }
    }
  },
  computed: {
    currentYear() {
      return this.currentDate.split('-')[0]
    },
    currentMonth() {
      return this.currentDate.split('-')[1]
    },
    monthlyBalance() {
      return formatAmount(Number(this.monthlyIncome) - Number(this.monthlyExpense))
    },
    currentStatistics() {
      return this.statistics[this.showType]
    }
  },
  created() {
    const now = new Date()
    this.currentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    this.calculateStatistics()
  },
  methods: {
    onDateChange(e) {
      this.currentDate = e.detail.value
      this.calculateStatistics()
    },
    calculateStatistics() {
      const bills = db.getBills()
      const [year, month] = this.currentDate.split('-')
      
      // 筛选当月账单
      const monthlyBills = bills.filter(bill => {
        const billDate = new Date(bill.date)
        return billDate.getFullYear() === Number(year) && 
               billDate.getMonth() + 1 === Number(month)
      })
      
      // 计算总收支
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
      
      // 计算分类统计
      const categories = db.getCategories()
      
      // 支出统计
      const expenseTotal = Number(this.monthlyExpense)
      this.statistics.expense = categories
        .filter(c => c.type === 'expense')
        .map(category => {
          const amount = formatAmount(
            monthlyBills
              .filter(bill => bill.category.id === category.id)
              .reduce((sum, bill) => sum + Number(bill.amount), 0)
          )
          return {
            category,
            amount,
            percent: expenseTotal ? Math.round(Number(amount) / expenseTotal * 100) : 0
          }
        })
        .filter(item => Number(item.amount) > 0)
        .sort((a, b) => Number(b.amount) - Number(a.amount))
      
      // 收入统计
      const incomeTotal = Number(this.monthlyIncome)
      this.statistics.income = categories
        .filter(c => c.type === 'income')
        .map(category => {
          const amount = formatAmount(
            monthlyBills
              .filter(bill => bill.category.id === category.id)
              .reduce((sum, bill) => sum + Number(bill.amount), 0)
          )
          return {
            category,
            amount,
            percent: incomeTotal ? Math.round(Number(amount) / incomeTotal * 100) : 0
          }
        })
        .filter(item => Number(item.amount) > 0)
        .sort((a, b) => Number(b.amount) - Number(a.amount))
    }
  }
}
</script>

<style>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}
.date-picker {
  background: #fff;
  padding: 20rpx;
  text-align: center;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
}
.date {
  font-size: 32rpx;
  color: #333;
}
.overview {
  display: flex;
  justify-content: space-between;
  background: #fff;
  padding: 30rpx 20rpx;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
}
.overview .item {
  flex: 1;
  text-align: center;
}
.overview .label {
  font-size: 24rpx;
  color: #666;
}
.overview .amount {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  margin-top: 10rpx;
}
.amount.income {
  color: #4CAF50;
}
.amount.expense {
  color: #FF5722;
}
.statistics-section {
  background: #fff;
  border-radius: 10rpx;
  padding: 20rpx;
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
.type-switch {
  display: flex;
  background: #f5f5f5;
  border-radius: 30rpx;
  overflow: hidden;
}
.type-btn {
  padding: 10rpx 30rpx;
  font-size: 24rpx;
  color: #666;
}
.type-btn.active {
  background: #007AFF;
  color: #fff;
}
.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eee;
}
.category-info {
  display: flex;
  align-items: center;
}
.icon {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}
.icon text {
  color: #fff;
  font-size: 30rpx;
}
.detail {
  display: flex;
  flex-direction: column;
}
.name {
  font-size: 28rpx;
  color: #333;
}
.percent {
  font-size: 24rpx;
  color: #999;
  margin-top: 5rpx;
}
</style> 