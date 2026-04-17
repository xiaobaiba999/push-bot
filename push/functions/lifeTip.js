const { getNowDay, addZerp } = require('./utils')

const breakfastList = [
    { food: '豆浆 + 包子', msg: '暖暖的～' },
    { food: '牛奶 + 面包', msg: '简单又营养～' },
    { food: '粥 + 鸡蛋', msg: '养胃又健康～' },
    { food: '酸奶 + 水果', msg: '清爽好心情～' },
    { food: '三明治 + 咖啡', msg: '元气满满～' },
    { food: '馄饨 / 水饺', msg: '热乎乎的最好吃～' },
    { food: '煎饼果子', msg: '路边摊的快乐～' },
]

const periodConfig = {
    open: true,
    lastPeriodDate: '2026-04-14',
    cycleDays: 30,
    fluctuation: 5,
    advanceRemindDays: 3,
}

const getDaySeed = () => {
    const date = getNowDay()
    return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
}

const seededRandom = (seed) => {
    let x = Math.sin(seed) * 10000
    return x - Math.floor(x)
}

const getPeriodInfo = () => {
    if (!periodConfig.open) return null
    
    const date = getNowDay()
    const nowTime = `${date.getFullYear()}-${addZerp(date.getMonth() + 1)}-${addZerp(date.getDate())}`
    
    const lastPeriod = new Date(periodConfig.lastPeriodDate.replace(/-/g, '/'))
    const now = new Date(nowTime.replace(/-/g, '/'))
    
    const daysSinceLast = Math.floor((now - lastPeriod) / (3600 * 1000 * 24))
    
    const daysUntilNext = periodConfig.cycleDays - (daysSinceLast % periodConfig.cycleDays)
    const isInPeriodRange = daysSinceLast % periodConfig.cycleDays <= 5
    const isNearPeriod = daysUntilNext <= periodConfig.advanceRemindDays && daysUntilNext > 0
    
    return {
        daysUntilNext,
        isInPeriodRange,
        isNearPeriod,
        daysSinceLast: daysSinceLast % periodConfig.cycleDays,
    }
}

module.exports = handleLifeTip = async () => {
    try {
        const date = getNowDay()
        const seed = getDaySeed()
        let content = ''
        
        const bfIndex = Math.floor(seededRandom(seed) * breakfastList.length)
        const bf = breakfastList[bfIndex]
        content += `🥐早餐提醒:\n· 宝贝记得吃早餐呀，今天推荐 ${bf.food}，${bf.msg}`
        
        const periodInfo = getPeriodInfo()
        if (periodInfo) {
            if (periodInfo.isInPeriodRange) {
                content += `\n\n🩷特殊提醒:\n· 宝贝现在是特殊时期，记得别吃冰的，多喝热水，注意保暖哦～\n· 辛苦了，我会一直陪着你❤️`
            } else if (periodInfo.isNearPeriod) {
                content += `\n\n🩷特殊提醒:\n· 距离下次姨妈期大约还有 ${periodInfo.daysUntilNext} 天，提前备好用品哦～\n· 快到特殊时期了，注意饮食别太凉～`
            }
        }
        
        return content
    } catch (error) {
        console.log('生活提醒处理失败', error.message || error)
        return '🥐记得吃早餐哦～'
    }
}

module.exports.periodConfig = periodConfig