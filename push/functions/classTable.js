const { classTable } = require('../input')
const { getNowDay } = require('./utils')

const classFunction = {
    async getNowWeek() {
        try {
            let schoolTime = classTable.startTime
            let startDay = new Date(schoolTime[0], schoolTime[1] - 1, schoolTime[2])
            let startMs = startDay.getTime()
            let nowDay = getNowDay()
            let nowMs = nowDay.getTime()
            let startDays = parseInt(startMs / 86400000)
            let nowDays = parseInt(nowMs / 86400000)
            let totalDays = nowDays - startDays
            let week = parseInt(totalDays / 7) + 1
            if (totalDays < 0) {
                week = 0
            }
            let offectDay = nowDay.getDay() + classTable.index
            if (offectDay > 6) {
                offectDay = 0
            }
            let nowdate = parseInt('7123456'.charAt(offectDay))
            console.log('判断开学第几周 - 当前时间为', nowDay, '结果: ', [week, nowdate])
            return [week, nowdate]
        } catch (error) {
            console.log('获取当前第几周失败', error.message || error)
            throw new Error(error.message || '获取当前第几周失败')
        }
    },

    async getTodayClass() {
        try {
            const nowDayArrRes = await this.getNowWeek()
            const classList = classTable.list

            let todayList = []
            for (let i = 0; i < classList.length; i++) {
                const element = classList[i]
                let classIndex = element.day.indexOf(nowDayArrRes[1])
                if (element.week.indexOf(nowDayArrRes[0]) > -1 && classIndex > -1) {
                    element.jie = element.jie[classIndex]
                    todayList.push(element)
                }
            }
            console.log('今日课程表: ', todayList)
            return todayList
        } catch (error) {
            console.log('判断今日课程失败', error.message || error)
            throw new Error(error.message || '判断今日课程出错')
        }
    },

    async classToString() {
        try {
            const classLit = await this.getTodayClass()
            let classContent = []
            classLit.sort((a, b) => a.jie - b.jie)
            for (let i = 0; i < classLit.length; i++) {
                const element = classLit[i]
                classContent.push(`· 第${element.jie}节: ${element.name} ${element.address}`)
            }
            if (classTable.endWord) {
                classContent.push(`· ${classTable.endWord}`)
            }
            let content = ''
            let day = ['今日', '明日'][classTable.index]
            if (classContent.length) {
                content = `📕${day}课程提醒: \n${classContent.join('\n')}`
            } else {
                content = `📕${day}没课哦, 尽情睡懒觉吧~`
            }
            return content
        } catch (error) {
            throw new Error(error.message || error)
        }
    }
}

module.exports = handleClass = async () => {
    try {
        const res = await classFunction.classToString()
        return res
    } catch (error) {
        return `📕课程表处理失败: ${error.message || error}`
    }
}
