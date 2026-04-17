const { daily } = require('../input')
const { getNowDay, addZerp } = require('./utils')

const progressConfig = {
    open: true,
    targetDays: 3650,
    targetName: '十年之约',
    startDate: '2023-02-28',
}

const getProgressBar = (percent) => {
    const totalBlocks = 10
    const filled = Math.round(percent / 100 * totalBlocks)
    const empty = totalBlocks - filled
    return '■'.repeat(filled) + '□'.repeat(empty)
}

module.exports = handleProgress = async () => {
    try {
        const date = getNowDay()
        const nowTime = `${date.getFullYear()}-${addZerp(date.getMonth() + 1)}-${addZerp(date.getDate())}`
        
        const start = new Date(progressConfig.startDate.replace(/-/g, '/'))
        const now = new Date(nowTime.replace(/-/g, '/'))
        const diffDays = Math.floor((now - start) / (3600 * 1000 * 24))
        
        const percent = ((diffDays / progressConfig.targetDays) * 100).toFixed(1)
        const bar = getProgressBar(parseFloat(percent))
        
        let content = `💖恋爱进度条:\n· 相识 ${diffDays} 天 / 目标 ${progressConfig.targetDays} 天（${progressConfig.targetName}）\n· 【${bar}】${percent}%`
        
        if (parseFloat(percent) >= 100) {
            content += `\n· 🎉 十年之约已达成！我们做到了！`
        } else if (parseFloat(percent) >= 75) {
            content += `\n· 🌟 已走过四分之三，胜利在望！`
        } else if (parseFloat(percent) >= 50) {
            content += `\n· 💪 已过半程，继续加油～`
        } else if (parseFloat(percent) >= 25) {
            content += `\n· 🌈 每一天都在靠近目标～`
        } else {
            content += `\n· 🌱 故事才刚开始，未来可期～`
        }
        
        return content
    } catch (error) {
        console.log('恋爱进度条处理失败', error.message || error)
        return '💖恋爱进度条: 计算失败~'
    }
}

module.exports.progressConfig = progressConfig