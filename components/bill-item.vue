<template>
  <view class="bill-item" @click="showDetail" @longpress="showActions">
    <view class="left">
      <view class="icon" :style="{ backgroundColor: bill.category.color }">
        <svg-icon :name="bill.category.icon" color="#fff" size="40" />
      </view>
      <view class="info">
        <view class="name-row">
          <text class="name">{{ bill.category.name }}</text>
          <text class="remark" v-if="bill.remark">{{ bill.remark }}</text>
        </view>
        <text class="date">{{ bill.date }}</text>
      </view>
    </view>
    <view class="right">
      <view class="amount" :class="{ 'income': bill.type === 'income' }">
        {{ bill.type === 'income' ? '+' : '-' }}{{ bill.amount }}
      </view>
      <view class="time">{{ formattedTime(bill.createTime) }}</view>
    </view>
  </view>
</template>

<script>
import SvgIcon from './SvgIcon.vue'
import { timestampToDateTime } from '@/utils/common.js'
import db from '@/utils/database.js'

export default {
  components: {
    SvgIcon
  },
  props: {
    bill: {
      type: Object,
      required: true
    }
  },
  methods: {
    showDetail() {
      uni.showModal({
        title: '账单详情',
        content: `分类：${this.bill.category.name}\n金额：${this.bill.amount}\n日期：${this.bill.date}\n备注：${this.bill.remark || '无'}`,
        showCancel: false
      })
    },
    formattedTime(date) {
      return timestampToDateTime(date, true)
    },
    showActions() {
      uni.showActionSheet({
        itemList: ['删除'],
        itemColor: '#FF5722',
        success: (res) => {
          if (res.tapIndex === 0) {
            this.deleteBill()
          }
        }
      })
    },
    deleteBill() {
      uni.showModal({
        title: '删除账单',
        content: '确定要删除这条账单记录吗？',
        success: (res) => {
          if (res.confirm) {
            // 删除账单
            const bills = db.getBills()
            const newBills = bills.filter(b => b.id !== this.bill.id)
            uni.setStorageSync('bills', newBills)
            
            // 发送删除事件
            this.$emit('delete', this.bill.id)
            
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            })
          }
        }
      })
    }
  }
}
</script>

<style>
.bill-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: #fff;
  margin-bottom: 20rpx;
  border-radius: 10rpx;
}
.left {
  display: flex;
  align-items: center;
  flex: 1;
  margin-right: 20rpx;
}
.icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
}
.info {
  flex: 1;
  min-width: 0; /* 防止文本溢出 */
}
.name-row {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}
.name {
  font-size: 28rpx;
  color: #333;
  margin-right: 16rpx;
}
.remark {
  font-size: 24rpx;
  color: #999;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.date {
  font-size: 24rpx;
  color: #999;
}
.right {
  text-align: right;
  flex-shrink: 0;
}
.amount {
  font-size: 32rpx;
  color: #FF5722;
  font-weight: bold;
  margin-bottom: 8rpx;
}
.amount.income {
  color: #4CAF50;
}
.time {
  font-size: 24rpx;
  color: #999;
}
</style> 