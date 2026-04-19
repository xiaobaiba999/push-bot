/**
 * —————— ！！请在这个文件里，在对应的位置输入对应的内容！！ ——————
 */

let robotKey = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=ee02c921-9000-4f0b-bcad-4deea4114b01'

let start = {
    open: true,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        content: '宏宝早上好~❤️',
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    }

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    let weather = {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        open: true,
    city: '龙子湖区',
    key: '06dd3fdb9b914a58933afca5b8fd2776',
    index: 0,
}

let daily = {
    open: true,
    data: [
        {
            name: '相识',
            time: '2023-02-28'
        },
        {
            name: '相爱',
            time: '2023-05-20'
        },
        {
            name: '宏宝生日',
            time: 'YYYY-06-08'
        },
        {
            name: '宏宝大哥生日',
            time: 'YYYY-07-24'
        },
    ]
}

let end = {
    open: false,
    content: '这里放结束语, 或者不放, 用彩虹屁代替结束语',
}

let atAll = false

let classTable = {
    open: false,
    startTime: [2023, 9, 4],
    index: 0,
    list: [],
    endWord: '爱你宝宝💓',
}

let sentence = {
    open: true,
}

let memorial = {
    open: true,
}

let progress = {
    open: true,
    targetDays: 3650,
    targetName: '十年之约',
    startDate: '2023-02-28',
}

let solarTerm = {
    open: true,
}

let fortune = {
    open: true,
}

let lifeTip = {
    open: true,
    period: {
        open: true,
        lastPeriodDate: '2026-04-14',
        cycleDays: 30,
        fluctuation: 5,
        advanceRemindDays: 3,
    }
}

module.exports = { robotKey, start, weather, daily, end, atAll, classTable, sentence, memorial, progress, solarTerm, fortune, lifeTip }