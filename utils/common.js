// 格式化日期
export function formatDate(date) {
    if (!date) return ''
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
}

export function timestampToDateTime(timestamp,bool=false) {
    if (!timestamp) return ''
    var date = new Date(timestamp);  // 将时间戳转换为Date对象
   
    var year = date.getFullYear();   // 获取年份
    var month = date.getMonth() + 1;  // 获取月份，需要+1因为月份是从0开始计算的
    var day = date.getDate();         // 获取日
    var hours = date.getHours();      // 获取小时
    var minutes = date.getMinutes();  // 获取分钟
    var seconds = date.getSeconds();  // 获取秒钟
   
    // 格式化月份和日期，如果小于10，则前面加0
    month = (month < 10 ? "0" : "") + month;
    day = (day < 10 ? "0" : "") + day;
    hours = (hours < 10 ? "0" : "") + hours;
    minutes = (minutes < 10 ? "0" : "") + minutes;
    seconds = (seconds < 10 ? "0" : "") + seconds;
   
    // 拼接字符串返回
    return bool ? `${month}-${day} ${hours}:${minutes}` : year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
}

// 格式化金额
export function formatAmount(amount) {
    return Number(amount).toFixed(2)
} 