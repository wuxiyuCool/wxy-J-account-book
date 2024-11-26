<template>
  <view class="category-picker">
    <view class="type-switch">
      <text 
        class="type-btn" 
        :class="{ active: type === 'expense' }"
        @click="switchType('expense')"
      >支出</text>
      <text 
        class="type-btn" 
        :class="{ active: type === 'income' }"
        @click="switchType('income')"
      >收入</text>
    </view>
    <scroll-view class="categories" scroll-x>
      <view 
        class="category-item"
        v-for="category in filteredCategories"
        :key="category.id"
        :class="{ active: selectedId === category.id }"
        @click="selectCategory(category)"
      >
        <view class="icon" :style="{ backgroundColor: category.color }">
          <svg-icon :name="category.icon" color="#fff" size="40" />
        </view>
        <text class="name">{{ category.name }}</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import db from '@/utils/database.js'
import SvgIcon from './SvgIcon.vue'

export default {
  components: {
    SvgIcon
  },
  data() {
    return {
      type: 'expense',
      categories: [],
      selectedId: null
    }
  },
  computed: {
    filteredCategories() {
      return this.categories.filter(c => c.type === this.type)
    }
  },
  created() {
    this.categories = db.getCategories()
    if (this.categories.length > 0) {
      this.selectCategory(this.categories[0])
    }
  },
  methods: {
    switchType(type) {
      this.type = type
      if (this.filteredCategories.length > 0) {
        this.selectCategory(this.filteredCategories[0])
      }
    },
    selectCategory(category) {
      this.selectedId = category.id
      this.$emit('select', {
        category,
        type: this.type
      })
    }
  }
}
</script>

<style>
.category-picker {
  background: #fff;
  padding: 20rpx;
}
.type-switch {
  display: flex;
  margin-bottom: 20rpx;
}
.type-btn {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  font-size: 28rpx;
  color: #666;
}
.type-btn.active {
  color: #007AFF;
  font-weight: bold;
}
.categories {
  white-space: nowrap;
}
.category-item {
  display: inline-block;
  width: 120rpx;
  text-align: center;
  margin-right: 20rpx;
}
.category-item.active .icon {
  transform: scale(1.1);
}
.category-item.active .name {
  color: #007AFF;
}
.icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10rpx;
  transition: transform 0.2s;
}
.name {
  font-size: 24rpx;
  color: #666;
}
</style> 