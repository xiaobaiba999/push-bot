const { getNowDay, addZerp } = require('./utils')

const periodConfig = {
    open: true,
    lastPeriodDate: '2026-04-14',
    cycleDays: 30,
    periodDuration: 7,
    advanceRemindDays: 3,
}

const phaseInfo = {
    period: {
        name: '经期',
        emoji: '🩷',
        color: '🔴',
        tips: [
            '宝贝现在是经期，记得别吃冰的，多喝热水，注意保暖哦～',
            '经期要注意休息，别太累了，我会心疼的～',
            '特殊时期别碰凉的，喝点红糖姜茶暖暖身子～',
        ],
        care: '辛苦了，我会一直陪着你❤️',
        diet: '宜：红糖姜茶、温热食物、红枣桂圆汤\n· 忌：冰冷食物、辛辣刺激、咖啡浓茶',
    },
    follicular: {
        name: '卵泡期',
        emoji: '🌱',
        color: '🟢',
        tips: [
            '卵泡期是身体恢复的好时候，皮肤状态也会变好哦～',
            '现在是卵泡期，精力充沛，适合做喜欢的事～',
            '卵泡期新陈代谢加快，可以适当运动哦～',
        ],
        care: '现在状态不错，好好享受每一天～',
        diet: '宜：豆制品、新鲜蔬果、优质蛋白\n· 忌：过度节食、高糖零食',
    },
    ovulation: {
        name: '排卵期',
        emoji: '🌸',
        color: '🟡',
        tips: [
            '现在是排卵期，精力最旺盛，气色也最好～',
            '排卵期体温会略微升高，是正常现象哦～',
            '排卵期是整个周期中状态最好的时候～',
        ],
        care: '状态最好的时候，好好爱自己～',
        diet: '宜：黑豆、核桃、富含锌的食物\n· 忌：生冷食物、酒精',
    },
    luteal: {
        name: '黄体期',
        emoji: '🍂',
        color: '🟠',
        tips: [
            '黄体期情绪可能波动，是正常的哦，别给自己太大压力～',
            '黄体期容易水肿和长痘，少吃咸的，多喝水～',
            '快到经期了，注意保暖，别让自己受凉～',
        ],
        care: '如果心情不好，随时找我，我一直在❤️',
        diet: '宜：全谷物、香蕉、牛奶、坚果\n· 忌：高盐食物、咖啡因、酒精',
    },
}

const getPeriodPhase = (dayInCycle, cycleDays, periodDuration) => {
    if (dayInCycle < periodDuration) {
        return {
            phase: 'period',
            dayInPhase: dayInCycle,
            totalDays: periodDuration,
        }
    }

    const ovulationDay = cycleDays - 14

    if (dayInCycle < ovulationDay) {
        return {
            phase: 'follicular',
            dayInPhase: dayInCycle - periodDuration + 1,
            totalDays: ovulationDay - periodDuration - 1,
        }
    }

    if (dayInCycle >= ovulationDay - 2 && dayInCycle <= ovulationDay) {
        return {
            phase: 'ovulation',
            dayInPhase: dayInCycle - ovulationDay + 3,
            totalDays: 3,
        }
    }

    return {
        phase: 'luteal',
        dayInPhase: dayInCycle - ovulationDay,
        totalDays: cycleDays - ovulationDay,
    }
}

const formatDate = (y, m, d) => `${y}年${m}月${d}日`

const getPeriodInfo = () => {
    if (!periodConfig.open) return null

    const date = new Date()
    const nowYear = date.getFullYear()
    const nowMonth = date.getMonth() + 1
    const nowDay = date.getDate()

    const [lastYear, lastMonth, lastDay] = periodConfig.lastPeriodDate.split('-').map(Number)

    const nowDateObj = new Date(nowYear, nowMonth - 1, nowDay)
    const lastDateObj = new Date(lastYear, lastMonth - 1, lastDay)

    const totalDaysSinceLast = Math.round((nowDateObj - lastDateObj) / (3600 * 1000 * 24))
    
    const completedCycles = Math.floor(totalDaysSinceLast / periodConfig.cycleDays)
    const currentCycleDay = totalDaysSinceLast % periodConfig.cycleDays
    
    const actualLastPeriod = new Date(lastDateObj)
    actualLastPeriod.setDate(actualLastPeriod.getDate() + completedCycles * periodConfig.cycleDays)
    
    const nextPeriodDate = new Date(actualLastPeriod)
    nextPeriodDate.setDate(nextPeriodDate.getDate() + periodConfig.cycleDays)
    
    const daysUntilNext = Math.round((nextPeriodDate - nowDateObj) / (3600 * 1000 * 24))
    const isInPeriodRange = currentCycleDay < periodConfig.periodDuration
    const isNearPeriod = daysUntilNext <= periodConfig.advanceRemindDays && daysUntilNext > 0

    const phaseData = getPeriodPhase(currentCycleDay, periodConfig.cycleDays, periodConfig.periodDuration)

    return {
        totalDaysSinceLast,
        completedCycles,
        currentCycleDay: currentCycleDay + 1,
        daysUntilNext,
        isInPeriodRange,
        isNearPeriod,
        actualLastPeriod,
        nextPeriodDate,
        phaseData,
    }
}

const handleLifeTip = async () => {
    try {
        let content = ''

        const info = getPeriodInfo()
        if (!info) return content

        const phase = info.phaseData
        const phaseDetail = phaseInfo[phase.phase]
        const tipIndex = Math.abs(phase.dayInPhase) % phaseDetail.tips.length
        
        const cycleNum = info.completedCycles + 1
        content += `🩷【${phaseDetail.emoji}${phaseDetail.name}】第${info.currentCycleDay}天/第${cycleNum}个周期`
        
        if (info.completedCycles > 0) {
            content += `\n· 📅上次月经: ${formatDate(info.actualLastPeriod.getFullYear(), info.actualLastPeriod.getMonth() + 1, info.actualLastPeriod.getDate())}`
        }
        
        content += `\n· ${phaseDetail.tips[tipIndex]}`
        content += `\n· ${phaseDetail.care}`
        
        if (!info.isInPeriodRange) {
            content += `\n· ⏰预计下次月经: ${formatDate(info.nextPeriodDate.getFullYear(), info.nextPeriodDate.getMonth() + 1, info.nextPeriodDate.getDate())}（还有${info.daysUntilNext}天）`
            
            if (info.isNearPeriod) {
                content += `\n· 🔔快到经期了，提前备好用品哦～`
            }
        } else {
            const remaining = periodConfig.periodDuration - info.currentCycleDay
            if (remaining > 0 && remaining <= 2) {
                content += `\n· 💕经期即将结束，再坚持一下~`
            }
        }

        content += `\n· 🍽️饮食建议:\n· ${phaseDetail.diet}`

        if (Math.abs(daysDiff(info.actualLastPeriod, info.nextPeriodDate) - periodConfig.cycleDays) > 5) {
            content += `\n· ⚠️检测到周期可能不太规律（实际间隔${daysDiff(info.actualLastPeriod, info.nextPeriodDate)}天），建议关注身体变化~`
        }

        return content
    } catch (error) {
        console.log('生活提醒处理失败', error.message || error)
        return ''
    }
}

function daysDiff(d1, d2) {
    return Math.round((d2 - d1) / (3600 * 1000 * 24))
}

module.exports = handleLifeTip
module.exports.periodConfig = periodConfig