const { getNowDay, addZerp } = require('./utils')

const solarTerms = [
    { month: 1, day: 6, name: '小寒', emoji: '❄️', msg: '小寒到了，天更冷了，出门记得裹紧围巾，回来我给你暖手～' },
    { month: 1, day: 20, name: '大寒', emoji: '🥶', msg: '大寒是一年最冷的时候，多穿点别感冒了，我的怀抱永远给你暖～' },
    { month: 2, day: 4, name: '立春', emoji: '🌱', msg: '立春啦！春天要来了，想和你一起去看第一朵花开～' },
    { month: 2, day: 19, name: '雨水', emoji: '🌧️', msg: '雨水节气，春雨贵如油，你比春雨更珍贵～' },
    { month: 3, day: 6, name: '惊蛰', emoji: '⚡', msg: '惊蛰到，春雷响，万物复苏，我对你的心动也从没停过～' },
    { month: 3, day: 21, name: '春分', emoji: '🌸', msg: '今日春分🌱，风变暖啦，想和你去公园走走，踩踩刚长出来的小草～' },
    { month: 4, day: 5, name: '清明', emoji: '🍃', msg: '清明时节，春意正浓，想和你一起踏青放风筝～' },
    { month: 4, day: 20, name: '谷雨', emoji: '🌾', msg: '谷雨是春天最后一个节气，趁着春光正好，我们出去走走吧～' },
    { month: 5, day: 6, name: '立夏', emoji: '☀️', msg: '立夏啦！夏天要来了，第一个冰淇淋想和你一起吃～' },
    { month: 5, day: 21, name: '小满', emoji: '🌾', msg: '小满，麦粒渐满，我对你的爱也是越来越满～' },
    { month: 6, day: 6, name: '芒种', emoji: '🌻', msg: '芒种忙种，种下希望，你就是我最美的希望～' },
    { month: 6, day: 21, name: '夏至', emoji: '🍉', msg: '夏至到了，白天最长，想你的时间也最长～第一个西瓜想和你分着吃，中间最甜的那口给你～' },
    { month: 7, day: 7, name: '小暑', emoji: '🌡️', msg: '小暑开始热啦，出门记得带伞遮阳，多喝水别中暑了～' },
    { month: 7, day: 23, name: '大暑', emoji: '🔥', msg: '大暑是一年最热的时候，待在室内别乱跑，我给你买冰西瓜～' },
    { month: 8, day: 7, name: '立秋', emoji: '🍂', msg: '立秋了，秋天的第一杯奶茶安排上！' },
    { month: 8, day: 23, name: '处暑', emoji: '🌤️', msg: '处暑，暑气渐消，终于不用天天蒸桑拿了～' },
    { month: 9, day: 8, name: '白露', emoji: '💧', msg: '白露到了，早晚温差大，出门记得带件外套～' },
    { month: 9, day: 23, name: '秋分', emoji: '🍁', msg: '秋分，昼夜等长，想你的白天和黑夜一样多～' },
    { month: 10, day: 8, name: '寒露', emoji: '🌬️', msg: '寒露到了，天渐凉，记得添衣，别让我担心～' },
    { month: 10, day: 23, name: '霜降', emoji: '🧊', msg: '霜降是秋天的最后一个节气，马上入冬了，准备好暖宝宝～' },
    { month: 11, day: 7, name: '立冬', emoji: '🧣', msg: '立冬啦！冬天来了，围巾手套安排上，我的温暖也随时给你～' },
    { month: 11, day: 22, name: '小雪', emoji: '🌨️', msg: '小雪到了，要是下雪了，第一个雪人我们一起堆～' },
    { month: 12, day: 7, name: '大雪', emoji: '⛄', msg: '大雪纷飞的日子，最想和你窝在沙发上看电影～' },
    { month: 12, day: 22, name: '冬至', emoji: '🥟', msg: '冬至大如年，今天必须吃饺子/汤圆，想和你一起包饺子～' },
]

const seasonMessages = {
    spring: [
        '🌸 春天来了，万物都在发芽，我对你的爱也在生长～',
        '🌿 春风十里不如你，今天也要开开心心的～',
        '🌼 春天适合出门，更适合和你在一起～',
    ],
    summer: [
        '🍉 夏天到了，西瓜空调和你，缺一不可～',
        '🍦 这么热的天，你就是我心中的清凉～',
        '🏖️ 夏天的风正舒服，想和你去海边踩浪花～',
    ],
    autumn: [
        '🍁 秋天是收获的季节，遇见你就是最大的收获～',
        '🌰 秋高气爽，适合和你一起散步～',
        '🍂 落叶纷飞，想牵着你的手走过每一条小路～',
    ],
    winter: [
        '❄️ 天冷了，记得多穿一件，我的怀抱随时给你暖～',
        '⛄ 冬天最适合窝在一起，哪里都不去～',
        '🧣 降温啦，出门记得戴围巾，别让我担心～',
    ],
}

const getSeason = (month) => {
    if (month >= 3 && month <= 5) return 'spring'
    if (month >= 6 && month <= 8) return 'summer'
    if (month >= 9 && month <= 11) return 'autumn'
    return 'winter'
}

module.exports = handleSolarTerm = async () => {
    try {
        const date = getNowDay()
        const month = date.getMonth() + 1
        const day = date.getDate()
        
        const todayTerm = solarTerms.find(t => t.month === month && t.day === day)
        
        if (todayTerm) {
            return `🎋【${todayTerm.emoji}${todayTerm.name}】${todayTerm.msg}`
        }
        
        const season = getSeason(month)
        const messages = seasonMessages[season]
        const msgIndex = Math.floor((date.getFullYear() * 366 + month * 31 + day) % messages.length)
        
        return `🌿【今日小语】${messages[msgIndex]}`
    } catch (error) {
        console.log('节气处理失败', error.message || error)
        return ''
    }
}