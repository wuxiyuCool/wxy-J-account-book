<template>
  <view class="tab-bar">
    <view 
      v-for="(item, index) in list" 
      :key="index"
      class="tab-bar-item"
      @click="switchTab(item.pagePath)"
    >
      <svg-icon 
        :name="selected === index ? item.activeIcon : item.icon"
        :color="selected === index ? selectedColor : color"
        size="48"
      />
      <view 
        class="tab-bar-item-text"
        :style="{ color: selected === index ? selectedColor : color }"
      >
        {{ item.text }}
      </view>
    </view>
  </view>
</template>

<script>
import SvgIcon from '@/components/SvgIcon.vue'

export default {
  components: {
    SvgIcon
  },
  data() {
    return {
      color: "#999999",
      selectedColor: "#007AFF",
      list: [
        {
          pagePath: "pages/index/index",
          text: "明细",
          icon: "tabbar-list",
          activeIcon: "tabbar-list-active"
        },
        {
          pagePath: "pages/statistics/statistics",
          text: "统计",
          icon: "tabbar-stats",
          activeIcon: "tabbar-stats-active"
        },
        {
          pagePath: "pages/category/category",
          text: "分类",
          icon: "tabbar-category",
          activeIcon: "tabbar-category-active"
        },
        {
          pagePath: "pages/data-manager/data-manager",
          text: "数据",
          icon: "tabbar-data",
          activeIcon: "tabbar-data-active"
        }
      ],
      selected: 0
    }
  },
  methods: {
    switchTab(path) {
      uni.switchTab({
        url: `/${path}`
      })
    }
  }
}
</script>

<style>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background: white;
  display: flex;
  padding-bottom: env(safe-area-inset-bottom);
  border-top: 1rpx solid #eee;
  z-index: 99;
}

.tab-bar-item {
  flex: 1;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 10rpx 0;
}

.tab-bar-item-text {
  font-size: 20rpx;
  margin-top: 4rpx;
}
</style> 