<template>
  <view class="container">
    <view class="card">
      <view class="title">数据备份与恢复</view>
      <view class="desc">可以导出数据进行备份，或从备份文件中恢复数据</view>
      
      <view class="button-group">
        <button class="btn" @click="exportData">导出数据</button>
        <button class="btn import-btn" @click="importData">导入数据</button>
      </view>
      
      <view class="info">
        <text class="label">账单数量：</text>
        <text class="value">{{ billCount }}条</text>
      </view>
      <view class="info">
        <text class="label">分类数量：</text>
        <text class="value">{{ categoryCount }}个</text>
      </view>
      <view class="info">
        <text class="label">最早记录：</text>
        <text class="value">{{ earliestRecord }}</text>
      </view>
    </view>
    
    <view class="card">
      <view class="title">手动备份数据</view>
      <view class="desc">
        <text>如果自动导出失败，可以复制以下数据手动保存：</text>
        <button class="copy-btn" size="mini" @click="copyData">复制数据</button>
      </view>
      <textarea 
        class="json-data" 
        :value="jsonData" 
        placeholder="点击导出数据后将显示在这里"
        maxlength="-1"
        @input="onJsonInput"
      />
      <button 
        class="btn verify-btn" 
        @click="verifyAndImport" 
        v-if="jsonData"
      >验证并导入</button>
    </view>
    
    <view class="card danger-zone">
      <view class="title warning">危险区域</view>
      <button class="btn danger" @click="clearData">清空所有数据</button>
    </view>
  </view>
</template>

<script>
import db from '@/utils/database.js'

export default {
  data() {
    return {
      billCount: 0,
      categoryCount: 0,
      earliestRecord: '-',
      jsonData: ''
    }
  },
  onShow() {
    this.loadStatistics()
  },
  methods: {
    loadStatistics() {
      const bills = db.getBills()
      const categories = db.getCategories()
      
      this.billCount = bills.length
      this.categoryCount = categories.length
      
      if (bills.length > 0) {
        const dates = bills.map(bill => new Date(bill.date))
        const earliest = new Date(Math.min(...dates))
        this.earliestRecord = earliest.toLocaleDateString()
      }
    },
    
    async exportData() {
      try {
        const data = {
          bills: db.getBills(),
          categories: db.getCategories(),
          exportTime: new Date().toISOString(),
          version: '1.0'
        }
        
        const jsonStr = JSON.stringify(data, null, 2)
        this.jsonData = jsonStr
        
        // #ifdef APP-PLUS
        const downloadDir = plus.io.convertLocalFileSystemURL('_downloads')
        const fileName = `账本备份_${new Date().getTime()}.json`
        const filePath = `${downloadDir}/${fileName}`
        
        try {
          const fs = uni.saveFile(filePath)
          fs.writeFileSync(filePath, jsonStr, 'utf8')          
          uni.showModal({
            title: '导出成功',
            content: `文件已保存到：${filePath}`,
            showCancel: false,
            success: () => {
              plus.runtime.openFile(filePath)
            }
          })
        } catch (err) {
          throw new Error('写入文件失败：' + err.message)
        }
        // #endif
        
        // #ifdef H5
        const blob = new Blob([jsonStr], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `账本备份_${new Date().toLocaleDateString()}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        uni.showToast({
          title: '导出成功',
          icon: 'success'
        })
        // #endif
        
      } catch (error) {
        console.error('导出失败:', error)
        uni.showToast({
          title: '自动导出失败，请使用手动复制',
          icon: 'none',
          duration: 2000
        })
      }
    },
    
    importData() {
      try {
        // #ifdef APP-PLUS
      uni.chooseFile({
        extension: ['.json'],
        success: (res) => {
          if (res.tempFilePaths && res.tempFilePaths.length > 0) {
            const filePath = res.tempFilePaths[0]
            try {
              const fs = uni.getFileSystemManager()
              fs.readFile({
                filePath,
                encoding: 'utf8',
                success: (res) => {
                  try {
                    const data = JSON.parse(res.data)
                    this.validateAndImportData(data)
                  } catch (e) {
                    uni.showToast({
                      title: '文件��式错误',
                      icon: 'none'
                    })
                  }
                },
                fail: (err) => {
                  uni.showToast({
                    title: '读取文件失败',
                    icon: 'none'
                  })
                }
              })
            } catch (err) {
              uni.showToast({
                title: '读取文件失败',
                icon: 'none'
              })
            }
          }
        },
        fail: (err) => {
          uni.showToast({
            title: '选择文件失败',
            icon: 'none'
          })
        }
      })
        // #endif
      
      // #ifdef H5
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.onchange = (event) => {
        const file = event.target.files[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (e) => {
            try {
              const data = JSON.parse(e.target.result)
              this.validateAndImportData(data)
            } catch (err) {
              uni.showToast({
                title: '文件格式错误',
                icon: 'none'
              })
            }
          }
          reader.readAsText(file)
        }
      }
        input.click()
        // #endif
      } catch (error) {
        console.error('导入失败:', error)
        uni.showToast({
          title: '导入失败：' + error.message,
          icon: 'none',
          duration: 2000
        })
      }
      
    },
    
    async validateAndImportData(data) {
      try {
        // 基本格式验证
        if (!data.bills || !Array.isArray(data.bills) || 
            !data.categories || !Array.isArray(data.categories) || 
            !data.version) {
          uni.showToast({
            title: '无效的备份文件',
            icon: 'none'
          })
          return
        }
        
        // 验证账单数据
        const validBills = data.bills.every(bill => {
          return bill.id && 
                 bill.category && 
                 bill.category.id &&
                 bill.category.name &&
                 bill.category.icon &&
                 bill.category.color &&
                 bill.category.type &&
                 bill.type && 
                 bill.amount && 
                 bill.date
        })
        
        // 验证分类数据
        const validCategories = data.categories.every(category => {
          return category.id && 
                 category.name && 
                 category.icon && 
                 category.color && 
                 category.type &&
                 ['expense', 'income'].includes(category.type) &&
                 category.name.length <= 6
        })
        
        if (!validBills || !validCategories) {
          uni.showToast({
            title: '备份文件数据格式错误',
            icon: 'none'
          })
          return
        }
        
        // 验证分类引用
        const categoryIds = new Set(data.categories.map(c => c.id))
        const validCategoryRefs = data.bills.every(bill => 
          categoryIds.has(bill.category.id)
        )
        
        if (!validCategoryRefs) {
          uni.showToast({
            title: '账单分类引用错误',
            icon: 'none'
          })
          return
        }
        
        // 显示导入确认
        uni.showModal({
          title: '确认导入',
          content: `将导入:\n${data.bills.length} 条账单\n${data.categories.length} 个分类\n注意：这将覆盖现有数据！`,
          success: (res) => {
            if (res.confirm) {
              try {
                // 先导入分类
                uni.setStorageSync('categories', data.categories)
                // 再导入账单
                uni.setStorageSync('bills', data.bills)
                
                uni.showToast({
                  title: '导入成功',
                  icon: 'success'
                })
                
                this.loadStatistics()
              } catch (err) {
                uni.showToast({
                  title: '导入失败：' + err.message,
                  icon: 'none'
                })
              }
            }
          }
        })
      } catch (err) {
        uni.showToast({
          title: '数据格式错误',
          icon: 'none'
        })
      }
    },
    
    clearData() {
      uni.showModal({
        title: '警告',
        content: '确定要清空所有数据吗？此操作不可恢复！',
        confirmColor: '#FF0000',
        success: (res) => {
          if (res.confirm) {
            uni.setStorageSync('bills', [])
            db.initStorage()
            
            uni.showToast({
              title: '已清空数据',
              icon: 'success'
            })
            
            this.loadStatistics()
          }
        }
      })
    },
    
    copyData() {
      // if (!this.jsonData) {
      //   uni.showToast({
      //     title: '请先导出数据',
      //     icon: 'none'
      //   })
      //   return
      // }
      const data = {
          bills: db.getBills(),
          categories: db.getCategories(),
          exportTime: new Date().toISOString(),
          version: '1.0'
        }
        
      const jsonStr = JSON.stringify(data, null, 2)
      this.jsonData = jsonStr
      uni.setClipboardData({
        data: this.jsonData,
        success: () => {
          uni.showToast({
            title: '已复制到剪贴板',
            icon: 'success'
          })
        }
      })
    },
    
    onJsonInput(e) {
      this.jsonData = e.detail.value
    },
    
    async verifyAndImport() {
      try {
        const data = JSON.parse(this.jsonData)
        await this.validateAndImportData(data)
        this.jsonData = ''
      } catch (err) {
        uni.showToast({
          title: '数据格式错误',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style>
.container {
  padding: 20rpx;
  background: #f5f5f5;
  min-height: 100vh;
}
.card {
  background: #fff;
  border-radius: 10rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}
.title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}
.desc {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 30rpx;
}
.button-group {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
}
.btn {
  flex: 1;
  font-size: 28rpx;
  padding: 20rpx;
}
.import-btn {
  background: #007AFF;
  color: #fff;
}
.info {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eee;
}
.label {
  color: #666;
  font-size: 28rpx;
}
.value {
  color: #333;
  font-size: 28rpx;
}
.danger-zone {
  margin-top: 40rpx;
}
.warning {
  color: #FF5722;
}
.danger {
  background: #FF5722;
  color: #fff;
}
.json-data {
  width: 100%;
  height: 300rpx;
  background: #f8f8f8;
  padding: 20rpx;
  box-sizing: border-box;
  font-size: 24rpx;
  color: #666;
  margin: 20rpx 0;
  border-radius: 8rpx;
}
.copy-btn {
  margin-left: 20rpx;
  background: #007AFF;
  color: #fff;
}
.verify-btn {
  margin-top: 20rpx;
  background: #4CAF50;
  color: #fff;
}
.desc {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.desc text {
  flex: 1;
  margin-right: 20rpx;
}
</style> 