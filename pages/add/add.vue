<template>
  <view class="container">
    <category-picker @select="onCategorySelect" />
    
    <view class="form">
      <view class="amount-input">
        <text class="label">¥</text>
        <input 
          type="digit"
          v-model="amount"
          placeholder="请输入金额"
          @input="formatAmount"
        />
      </view>
      
      <view class="date-picker">
        <text class="label">日期</text>
        <picker 
          mode="date" 
          :value="date"
          @change="onDateChange"
        >
          <text>{{ date }}</text>
        </picker>
      </view>
      
      <view class="remark">
        <text class="label">备注</text>
        <input 
          type="text"
          v-model="remark"
          placeholder="添加备注"
        />
      </view>
    </view>
    
    <button class="submit-btn" @click="submit">保存</button>
  </view>
</template>

<script>
import CategoryPicker from '@/components/category-picker.vue'
import db from '@/utils/database.js'
import { formatDate, formatAmount } from '@/utils/common.js'

export default {
  components: {
    CategoryPicker
  },
  data() {
    return {
      category: null,
      type: 'expense',
      amount: '',
      date: formatDate(new Date()),
      remark: ''
    }
  },
  methods: {
    onCategorySelect({ category, type }) {
      this.category = category
      this.type = type
    },
    formatAmount(e) {
      this.amount = e.detail.value.replace(/[^\d.]/g, '')
    },
    onDateChange(e) {
      this.date = e.detail.value
    },
    submit() {
      if (!this.category) {
        uni.showToast({
          title: '请选择分类',
          icon: 'none'
        })
        return
      }
      if (!this.amount) {
        uni.showToast({
          title: '请输入金额',
          icon: 'none'
        })
        return
      }
      
      const bill = {
        category: this.category,
        type: this.type,
        amount: formatAmount(this.amount),
        date: this.date,
        remark: this.remark
      }
      
      db.addBill(bill)
      uni.showToast({
        title: '添加成功',
        icon: 'success'
      })
      uni.navigateBack()
    }
  }
}
</script>

<style>
.container {
  min-height: 100vh;
  background: #f5f5f5;
}
.form {
  background: #fff;
  padding: 20rpx;
  margin-top: 20rpx;
}
.amount-input {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eee;
}
.label {
  font-size: 32rpx;
  color: #333;
  margin-right: 20rpx;
}
input {
  flex: 1;
  font-size: 32rpx;
}
.date-picker, .remark {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eee;
}
.submit-btn {
  position: fixed;
  bottom: 40rpx;
  left: 20rpx;
  right: 20rpx;
  background: #007AFF;
  color: #fff;
}
</style> 