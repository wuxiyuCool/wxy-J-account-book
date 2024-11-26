import { formatDate, timestampToDateTime } from './common.js'

class Database {
    constructor() {
        // 初始化本地存储
        this.initStorage()
    }
    
    initStorage() {
        const categories = uni.getStorageSync('categories')
        if (!categories) {
            // 初始化默认分类
            const defaultCategories = [
                // 支出分类
                { id: 1, name: '餐饮', icon: 'food', color: '#FF9800', type: 'expense' },
                { id: 2, name: '交通', icon: 'car', color: '#2196F3', type: 'expense' },
                { id: 3, name: '购物', icon: 'shop', color: '#9C27B0', type: 'expense' },
                { id: 4, name: '娱乐', icon: 'entertainment', color: '#FF5722', type: 'expense' },
                { id: 5, name: '医疗', icon: 'medical', color: '#4CAF50', type: 'expense' },
                { id: 6, name: '教育', icon: 'education', color: '#009688', type: 'expense' },
                { id: 7, name: '住房', icon: 'house', color: '#795548', type: 'expense' },
                { id: 8, name: '礼物', icon: 'gift', color: '#E91E63', type: 'expense' },
                { id: 9, name: '人情', icon: 'social', color: '#673AB7', type: 'expense' },
                { id: 10, name: '婚礼', icon: 'wedding', color: '#FF4081', type: 'expense' },
                { id: 11, name: '丧事', icon: 'funeral', color: '#607D8B', type: 'expense' },
                { id: 12, name: '生日', icon: 'birthday', color: '#FFC107', type: 'expense' },
                { id: 13, name: '红包', icon: 'gift-money', color: '#F44336', type: 'expense' },
                { id: 14, name: '意外', icon: 'accident', color: '#FF5722', type: 'expense' },
                { id: 15, name: '庆典', icon: 'celebration', color: '#9C27B0', type: 'expense' },
                
                // 收入分类
                { id: 9, name: '工资', icon: 'salary', color: '#4CAF50', type: 'income' },
                { id: 10, name: '奖金', icon: 'bonus', color: '#FFC107', type: 'income' },
                { id: 11, name: '兼职', icon: 'part-time', color: '#3F51B5', type: 'income' },
                { id: 12, name: '外快', icon: 'extra-income', color: '#9C27B0', type: 'income' },
                { id: 13, name: '租金', icon: 'rent', color: '#FF5722', type: 'income' },
                { id: 14, name: '分红', icon: 'dividend', color: '#2196F3', type: 'income' },
                { id: 15, name: '补贴', icon: 'subsidy', color: '#607D8B', type: 'income' }
            ]
            uni.setStorageSync('categories', defaultCategories)
        }
        
        const bills = uni.getStorageSync('bills')
        if (!bills) {
            uni.setStorageSync('bills', [])
        }
    }
    
    // 添加账单
    addBill(bill) {
        const bills = uni.getStorageSync('bills') || []
        bill.id = Date.now()
        bill.createTime =  Date.now()
        bills.unshift(bill)
        uni.setStorageSync('bills', bills)
        return bill
    }
    
    // 获取账单列表
    getBills() {
        return uni.getStorageSync('bills') || []
    }
    
    // 获取分类列表
    getCategories() {
        return uni.getStorageSync('categories') || []
    }
    
    // 添加分类
    addCategory(category) {
        const categories = this.getCategories()
        category.id = Date.now()
        categories.push(category)
        uni.setStorageSync('categories', categories)
        return category
    }
    
    // 更新分类
    updateCategory(category) {
        const categories = this.getCategories()
        const index = categories.findIndex(c => c.id === category.id)
        if (index !== -1) {
            categories[index] = category
            uni.setStorageSync('categories', categories)
        }
    }
    
    // 删除分类
    deleteCategory(categoryId) {
        const categories = this.getCategories()
        const newCategories = categories.filter(c => c.id !== categoryId)
        uni.setStorageSync('categories', newCategories)
    }
    
    // 删除账单
    deleteBill(billId) {
        const bills = this.getBills()
        const newBills = bills.filter(b => b.id !== billId)
        uni.setStorageSync('bills', newBills)
    }
}

export default new Database() 