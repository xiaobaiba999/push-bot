const { daily } = require('../input')
const { getNowDay, addZerp } = require('./utils')

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
    return [unit, formatTimeDiff]
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
        content.push(`· ${element.name} <${element.time.split('-').join('.')}>\n    ${timeArr.join('')}`)
    }
    return content.join('\n')
}
