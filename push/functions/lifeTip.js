const { getNowDay, addZerp } = require('./utils')

const periodConfig = {
    open: true,
    lastPeriodDate: '2026-04-14',
    cycleDays: 30,
    periodDuration: 5,
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

const getPeriodPhase = (daysSinceLast, cycleDays, periodDuration) => {
    const dayInCycle = daysSinceLast % cycleDays

    if (dayInCycle < periodDuration) {
        return {
            phase: 'period',
            dayInPhase: dayInCycle + 1,
            totalDays: periodDuration,
        }
    }

    const ovulationDay = cycleDays - 14
    const follicularEnd = ovulationDay - 1

    if (dayInCycle < follicularEnd) {
        return {
            phase: 'follicular',
            dayInPhase: dayInCycle - periodDuration + 1,
            totalDays: follicularEnd - periodDuration,
        }
    }

    if (dayInCycle >= ovulationDay - 1 && dayInCycle <= ovulationDay + 1) {
        return {
            phase: 'ovulation',
            dayInPhase: dayInCycle - ovulationDay + 2,
            totalDays: 3,
        }
    }

    return {
        phase: 'luteal',
        dayInPhase: dayInCycle - ovulationDay - 1 + 1,
        totalDays: cycleDays - ovulationDay - 1,
    }
}

const getPeriodInfo = () => {
    if (!periodConfig.open) return null

    const date = getNowDay()
    const nowTime = `${date.getFullYear()}-${addZerp(date.getMonth() + 1)}-${addZerp(date.getDate())}`

    const lastPeriod = new Date(periodConfig.lastPeriodDate.replace(/-/g, '/'))
    const now = new Date(nowTime.replace(/-/g, '/'))

    const daysSinceLast = Math.floor((now - lastPeriod) / (3600 * 1000 * 24))
    const daysUntilNext = periodConfig.cycleDays - (daysSinceLast % periodConfig.cycleDays)
    const isInPeriodRange = (daysSinceLast % periodConfig.cycleDays) < periodConfig.periodDuration
    const isNearPeriod = daysUntilNext <= periodConfig.advanceRemindDays && daysUntilNext > 0

    const phaseData = getPeriodPhase(daysSinceLast, periodConfig.cycleDays, periodConfig.periodDuration)

    return {
        daysUntilNext,
        isInPeriodRange,
        isNearPeriod,
        daysSinceLast: daysSinceLast % periodConfig.cycleDays,
        dayInCycle: daysSinceLast % periodConfig.cycleDays + 1,
        phaseData,
    }
}

const handleLifeTip = async () => {
    try {
        const date = getNowDay()
        let content = ''

        const periodInfo = getPeriodInfo()
        if (periodInfo) {
            const phase = periodInfo.phaseData
            const info = phaseInfo[phase.phase]
            const tipIndex = phase.dayInPhase % info.tips.length

            content += `🩷【${info.emoji}${info.name}】第${periodInfo.dayInCycle}天/周期${periodConfig.cycleDays}天`
            content += `\n· ${info.tips[tipIndex]}`
            content += `\n· ${info.care}`
            content += `\n· 🍽️饮食建议:\n· ${info.diet}`

            if (periodInfo.isNearPeriod && !periodInfo.isInPeriodRange) {
                content += `\n· ⏰距离下次经期还有 ${periodInfo.daysUntilNext} 天，提前备好用品哦～`
            }
        }

        return content
    } catch (error) {
        console.log('生活提醒处理失败', error.message || error)
        return ''
    }
}

module.exports = handleLifeTip

module.exports.periodConfig = periodConfig