const { daily } = require('../input')
const { getNowDay, addZerp } = require('./utils')

const birthdayMessages = [
    '我已经偷偷开始准备惊喜啦😜',
    '我在想该送什么礼物才能配得上你～',
    '到时候一定要给你最大的惊喜！',
    '倒计时开始了，期待和你一起庆祝～',
    '你的生日是我最重视的日子！',
]

const diffTimeHour = (targetTime, nowTime) => {
    let diff = (new Date(nowTime.replace(/-/g, '/'))).getTime() - (new Date(targetTime.replace(/-/g, '/'))).getTime()
    const absTime = Math.abs(diff)
    let unit = diff > 0 ? '已经' : '还有'
    let formatTimeDiff = parseInt(absTime / (3600 * 1000 * 24))
    if (formatTimeDiff == 0) {
        unit = '就在'
        formatTimeDiff = '今天'
    } else {
        formatTimeDiff = ' ' + formatTimeDiff + ' 天'
    }
    return [unit, formatTimeDiff, diff > 0, formatTimeDiff === '今天' ? 0 : parseInt(absTime / (3600 * 1000 * 24))]
}

module.exports = handleTimeList = async () => {
    let date = getNowDay()
    console.log('今日日期为', date)
    let nowTime = `${date.getFullYear()}-${addZerp(date.getMonth() + 1)}-${addZerp(date.getDate())}`

    let content = ['📆纪念日:']
    for (let i = 0; i < daily.data.length; i++) {
        const element = daily.data[i]
        let targetArr = element.time.split('-')
        if (targetArr.length != 3) throw new Error('日期格式输入错误')

        if (targetArr[0] == 'YYYY') {
            if (`${addZerp(date.getMonth() + 1)}-${addZerp(date.getDate())}` > `${targetArr[1]}-${targetArr[2]}`) {
                targetArr[0] = date.getFullYear() + 1
                element.time = targetArr.join('-')
            } else {
                targetArr[0] = date.getFullYear()
                element.time = targetArr.join('-')
            }
        }

        let timeArr = diffTimeHour(element.time, nowTime)
        let [unit, days, isPast, daysNum] = timeArr
        
        let line = `· ${element.name} <${element.time.split('-').join('.')}>\n    ${unit}${days}`
        
        if (!isPast && daysNum > 0 && daysNum <= 60) {
            let isBirthday = element.name.includes('生日')
            if (isBirthday) {
                let msgIndex = daysNum % birthdayMessages.length
                line += `\n    🎁 距离${element.name}还有 ${daysNum} 天，${birthdayMessages[msgIndex]}`
            }
        }
        
        if (daysNum === 0) {
            let isBirthday = element.name.includes('生日')
            if (isBirthday) {
                line += `\n    🎂🎉 今天是${element.name}！生日快乐！永远爱你！`
            } else {
                line += `\n    🎉✨ 今天就是${element.name}！`
            }
        }
        
        content.push(line)
    }
    return content.join('\n')
}