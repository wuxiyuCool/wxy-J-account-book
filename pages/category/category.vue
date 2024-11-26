<template>
  <view class="container">
    <!-- 类型切换 -->
    <view class="type-switch">
      <text 
        :class="['type-btn', { active: currentType === 'expense' }]"
        @click="switchType('expense')"
      >支出分类</text>
      <text 
        :class="['type-btn', { active: currentType === 'income' }]"
        @click="switchType('income')"
      >收入分类</text>
    </view>
    
    <!-- 分类列表 -->
    <view class="category-list">
      <view 
        class="category-item"
        v-for="category in currentCategories"
        :key="category.id"
        @longpress="showEditMenu(category)"
      >
        <view class="icon" :style="{ backgroundColor: category.color }">
          <svg-icon :name="category.icon" color="#fff" size="40" />
        </view>
        <text class="name">{{ category.name }}</text>
      </view>
      
      <!-- 添加按钮 -->
      <view class="category-item add-btn" @click="showAddModal">
        <view class="icon">
          <svg-icon name="add" color="#999" size="40" />
        </view>
        <text class="name">添加分类</text>
      </view>
    </view>
    
    <!-- 图标选择弹窗 -->
    <uni-popup ref="iconPopup" type="bottom">
      <view class="icon-picker">
        <view class="popup-header">
          <text class="popup-title">{{ isEdit ? '编辑分类' : '添加分类' }}</text>
          <text class="popup-close" @click="closeIconPicker">关闭</text>
        </view>
        
        <!-- 分类名称输入 -->
        <view class="input-section">
          <text class="section-title">分类名称</text>
          <input 
            class="category-input"
            v-model="tempCategoryName"
            placeholder="请输入分类名称"
            maxlength="6"
          />
        </view>
        
        <!-- 图标选择 -->
        <text class="section-title">选择图标</text>
        <scroll-view class="icon-list" scroll-y>
          <view 
            v-for="(icon, index) in filteredIcons" 
            :key="index"
            class="icon-item"
            :class="{ active: selectedIcon === icon.name }"
            @click="selectIcon(icon)"
          >
            <view class="icon-preview" :style="{ backgroundColor: selectedColor }">
              <svg-icon :name="icon.name" color="#fff" size="40" />
            </view>
            <text class="icon-label">{{ icon.label }}</text>
          </view>
        </scroll-view>
        
        <!-- 颜色选择 -->
        <view class="color-picker">
          <text class="section-title">选择颜色</text>
          <scroll-view class="color-list" scroll-x>
            <view 
              v-for="(color, index) in colors" 
              :key="index"
              class="color-item"
              :style="{ backgroundColor: color }"
              :class="{ active: selectedColor === color }"
              @click="selectColor(color)"
            />
          </scroll-view>
        </view>
        
        <button class="confirm-btn" @click="confirmIconSelect">确定</button>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import db from '@/utils/database.js'
import SvgIcon from '@/components/SvgIcon.vue'

export default {
  components: {
    SvgIcon
  },
  data() {
    return {
      currentType: 'expense',
      categories: [],
      isEdit: false,
      editingCategory: null,
      tempCategoryName: '',
      selectedIcon: '',
      selectedColor: '',
      icons: [
        { name: 'food', label: '餐饮' },
        { name: 'car', label: '交通' },
        { name: 'shop', label: '购物' },
        { name: 'entertainment', label: '娱乐' },
        { name: 'medical', label: '医疗' },
        { name: 'education', label: '教育' },
        { name: 'house', label: '住房' },
        { name: 'gift', label: '礼物' },
        { name: 'salary', label: '工资' },
        { name: 'bonus', label: '奖金' },
        { name: 'investment', label: '投资' },
        { name: 'part-time', label: '兼职' },
        { name: 'extra-income', label: '外快' },
        { name: 'rent', label: '租金' },
        { name: 'dividend', label: '分红' },
        { name: 'subsidy', label: '补贴' },
        { name: 'other', label: '其他' },
        { name: 'social', label: '人情' },
        { name: 'wedding', label: '丧事' },
        { name: 'birthday', label: '生日' },
        { name: 'gift-money', label: '红包' },
        { name: 'accident', label: '意外' },
        { name: 'celebration', label: '庆典' },
      ],
      colors: [
        '#FF9800', '#2196F3', '#9C27B0', '#FF5722', 
        '#4CAF50', '#009688', '#795548', '#E91E63', 
        '#FFC107', '#3F51B5', '#607D8B', '#673AB7'
      ]
    }
  },
  computed: {
    currentCategories() {
      return this.categories.filter(c => c.type === this.currentType)
    },
    filteredIcons() {
      // 根据当前类型筛选图标
      return this.icons.filter(icon => {
        if (this.currentType === 'expense') {
          return !['salary', 'bonus', 'part-time', 'extra-income', 'rent', 'dividend', 'subsidy'].includes(icon.name)
        } else {
          return ['salary', 'bonus', 'part-time', 'extra-income', 'rent', 'dividend', 'subsidy', 'other'].includes(icon.name)
        }
      })
    }
  },
  onShow() {
    this.loadCategories()
  },
  methods: {
    loadCategories() {
      this.categories = db.getCategories()
    },
    switchType(type) {
      this.currentType = type
    },
    showAddModal() {
      this.isEdit = false
      this.editingCategory = null
      this.tempCategoryName = ''
      this.selectedIcon = this.filteredIcons[0].name
      this.selectedColor = this.colors[0]
      this.$refs.iconPopup.open()
    },
    closeIconPicker() {
      this.$refs.iconPopup.close()
      this.resetForm()
    },
    resetForm() {
      this.isEdit = false
      this.editingCategory = null
      this.tempCategoryName = ''
      this.selectedIcon = ''
      this.selectedColor = ''
    },
    selectIcon(icon) {
      this.selectedIcon = icon.name
    },
    selectColor(color) {
      this.selectedColor = color
    },
    confirmIconSelect() {
      if (!this.tempCategoryName.trim()) {
        uni.showToast({
          title: '请输入分类名称',
          icon: 'none'
        })
        return
      }
      
      const category = {
        name: this.tempCategoryName,
        type: this.currentType,
        icon: this.selectedIcon,
        color: this.selectedColor
      }
      
      if (this.isEdit && this.editingCategory) {
        // 更新分类
        category.id = this.editingCategory.id
        db.updateCategory(category)
      } else {
        // 添加分类
        db.addCategory(category)
      }
      
      this.loadCategories()
      this.closeIconPicker()
      
      uni.showToast({
        title: this.isEdit ? '修改成功' : '添加成功',
        icon: 'success'
      })
    },
    showEditMenu(category) {
      uni.showActionSheet({
        itemList: ['编辑', '删除'],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.editCategory(category)
          } else if (res.tapIndex === 1) {
            this.deleteCategory(category)
          }
        }
      })
    },
    editCategory(category) {
      this.isEdit = true
      this.editingCategory = category
      this.tempCategoryName = category.name
      this.selectedIcon = category.icon
      this.selectedColor = category.color
      this.$refs.iconPopup.open()
    },
    deleteCategory(category) {
      uni.showModal({
        title: '删除分类',
        content: '确定要删除该分类吗？',
        success: (res) => {
          if (res.confirm) {
            db.deleteCategory(category.id)
            this.loadCategories()
          }
        }
      })
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
.type-switch {
  display: flex;
  background: #fff;
  padding: 20rpx;
  border-radius: 10rpx;
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
.category-list {
  display: flex;
  flex-wrap: wrap;
  background: #fff;
  padding: 20rpx;
  border-radius: 10rpx;
}
.category-item {
  width: 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
  box-sizing: border-box;
}
.icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10rpx;
}
.name {
  font-size: 24rpx;
  color: #333;
}
.add-btn .icon {
  background: #f5f5f5;
}

.icon-picker {
  background: #fff;
  border-radius: 20rpx 20rpx 0 0;
  padding: 30rpx;
  margin-bottom: 80rpx;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
}

.popup-close {
  font-size: 28rpx;
  color: #999;
}

.input-section {
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.category-input {
  width: 100%;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.icon-list {
  display: flex;
  flex-wrap: wrap;
  max-height: 400rpx;
  margin-bottom: 30rpx;
}

.icon-item {
  width: 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
  box-sizing: border-box;
}

.icon-item.active .icon-preview {
  transform: scale(1.1);
  border: 2rpx solid #007AFF;
}

.icon-preview {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10rpx;
  transition: transform 0.2s;
}

.icon-label {
  font-size: 24rpx;
  color: #666;
}

.color-picker {
  margin-top: 30rpx;
}

.color-list {
  white-space: nowrap;
  padding: 10rpx 0;
}

.color-item {
  display: inline-block;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  border: 2rpx solid transparent;
}

.color-item.active {
  transform: scale(1.1);
  border-color: #007AFF;
}

.confirm-btn {
  margin-top: 30rpx;
  background: #007AFF;
  color: #fff;
}
</style> 