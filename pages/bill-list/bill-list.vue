<template>
  <view class="container">
    <!-- 筛选器 -->
    <view class="filter-bar">
      <!-- 日期筛选 -->
      <view class="filter-item">
        <picker mode="date" fields="month" :value="currentDate" @change="onDateChange">
          <view class="picker">
            <text>{{ currentDate || '选择月份' }}</text>
            <svg-icon name="arrow-down" color="#666" size="24" />
          </view>
        </picker>
      </view>
      
      <!-- 类型筛选 -->
      <view class="filter-item">
        <picker :range="billTypes" range-key="label" @change="onTypeChange">
          <view class="picker">
            <text>{{ currentType.label }}</text>
            <svg-icon name="arrow-down" color="#666" size="24" />
          </view>
        </picker>
      </view>
      
      <!-- 分类筛选 -->
      <view class="filter-item">
        <picker :range="categories" range-key="name" @change="onCategoryChange">
          <view class="picker">
            <text>{{ currentCategory ? currentCategory.name : '全部分类' }}</text>
            <svg-icon name="arrow-down" color="#666" size="24" />
          </view>
        </picker>
      </view>
    </view>
    
    <!-- 统计信息 -->
    <view class="statistics-bar">
      <view class="stat-item">
        <text class="label">收入</text>
        <text class="amount income">¥{{ totalIncome }}</text>
      </view>
      <view class="stat-item">
        <text class="label">支出</text>
        <text class="amount expense">¥{{ totalExpense }}</text>
      </view>
      <view class="stat-item">
        <text class="label">结余</text>
        <text class="amount">¥{{ balance }}</text>
      </view>
    </view>
    
    <!-- 账单列表 -->
    <scroll-view 
      class="bill-list" 
      scroll-y 
      @scrolltolower="loadMore"
      :style="{ height: listHeight + 'px' }"
    >
      <template v-if="filteredBills.length">
        <bill-item 
          v-for="bill in displayBills" 
          :key="bill.id" 
          :bill="bill"
          @delete="onBillDelete"
        />
        <view class="load-more" v-if="hasMore">加载更多...</view>
        <view class="load-more" v-else>没有更多了</view>
      </template>
      <view v-else class="empty">
        <text>暂无账单记录</text>
      </view>
    </scroll-view>
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
      currentDate: '',
      billTypes: [
        { value: 'all', label: '全部类型' },
        { value: 'expense', label: '支出' },
        { value: 'income', label: '收入' }
      ],
      currentType: { value: 'all', label: '全部类型' },
      categories: [{ id: 0, name: '全部分类' }],
      currentCategory: null,
      bills: [],
      pageSize: 20,
      currentPage: 1,
      listHeight: 0
    }
  },
  computed: {
    filteredBills() {
      let result = this.bills
      
      // 按月份筛选
      if (this.currentDate) {
        const [year, month] = this.currentDate.split('-')
        result = result.filter(bill => {
          const billDate = new Date(bill.date)
          return billDate.getFullYear() === Number(year) && 
                 billDate.getMonth() + 1 === Number(month)
        })
      }
      
      // 按类型筛选
      if (this.currentType.value !== 'all') {
        result = result.filter(bill => bill.type === this.currentType.value)
      }
      
      // 按分类筛选
      if (this.currentCategory && this.currentCategory.id !== 0) {
        result = result.filter(bill => bill.category.id === this.currentCategory.id)
      }
      
      return result
    },
    displayBills() {
      return this.filteredBills.slice(0, this.currentPage * this.pageSize)
    },
    hasMore() {
      return this.displayBills.length < this.filteredBills.length
    },
    totalIncome() {
      return formatAmount(
        this.filteredBills
          .filter(bill => bill.type === 'income')
          .reduce((sum, bill) => sum + Number(bill.amount), 0)
      )
    },
    totalExpense() {
      return formatAmount(
        this.filteredBills
          .filter(bill => bill.type === 'expense')
          .reduce((sum, bill) => sum + Number(bill.amount), 0)
      )
    },
    balance() {
      return formatAmount(Number(this.totalIncome) - Number(this.totalExpense))
    }
  },
  onLoad() {
    // 设置当前月份
    const now = new Date()
    this.currentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    
    // 加载数据
    this.loadData()
    
    // 计算列表高度
    const systemInfo = uni.getSystemInfoSync()
    // 减去筛选栏和统计栏的高度
    this.listHeight = systemInfo.windowHeight - uni.upx2px(280)
  },
  methods: {
    loadData() {
      this.bills = db.getBills()
      this.categories = [
        { id: 0, name: '全部分类' },
        ...db.getCategories()
      ]
    },
    onDateChange(e) {
      this.currentDate = e.detail.value
      this.currentPage = 1
    },
    onTypeChange(e) {
      this.currentType = this.billTypes[e.detail.value]
      this.currentPage = 1
      
      // 更新分类列表
      if (this.currentType.value !== 'all') {
        this.categories = [
          { id: 0, name: '全部分类' },
          ...db.getCategories().filter(c => c.type === this.currentType.value)
        ]
        this.currentCategory = this.categories[0]
      } else {
        this.categories = [
          { id: 0, name: '全部分类' },
          ...db.getCategories()
        ]
      }
    },
    onCategoryChange(e) {
      this.currentCategory = this.categories[e.detail.value]
      this.currentPage = 1
    },
    loadMore() {
      if (this.hasMore) {
        this.currentPage++
      }
    },
    onBillDelete() {
      // 重新加载账单数据
      this.loadData()
    }
  }
}
</script>

<style>
.container {
  min-height: 100vh;
  background: #f5f5f5;
}
.filter-bar {
  background: #fff;
  padding: 20rpx;
  display: flex;
  justify-content: space-between;
}
.filter-item {
  flex: 1;
  margin: 0 10rpx;
}
.picker {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10rpx 20rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
}
.picker text {
  font-size: 24rpx;
  color: #333;
  margin-right: 10rpx;
}
.statistics-bar {
  background: #fff;
  padding: 30rpx 20rpx;
  display: flex;
  justify-content: space-around;
  margin: 20rpx 0;
}
.stat-item {
  text-align: center;
}
.label {
  font-size: 24rpx;
  color: #666;
}
.amount {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  margin-top: 10rpx;
}
.amount.income {
  color: #4CAF50;
}
.amount.expense {
  color: #FF5722;
}
.bill-list {
  padding: 0;
}
.load-more {
  text-align: center;
  padding: 20rpx;
  color: #999;
  font-size: 24rpx;
}
.empty {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
}
</style> 