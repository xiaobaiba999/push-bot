const { getNowDay } = require('./utils')

const fortuneData = {
    starMap: ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'],
    categories: [
        { name: '财运', range: [2, 5] },
        { name: '桃花运', range: [3, 5] },
        { name: '事业运', range: [2, 4] },
        { name: '健康运', range: [3, 5] },
    ],
    luckyMessages: [
        '会收到我给你的小惊喜，记得查收～',
        '今天适合吃一顿好的，犒劳一下自己～',
        '出门可能会遇到好事，保持好心情～',
        '今天适合做一件浪漫的小事～',
        '会有意想不到的好消息哦～',
        '今天运气超好，适合许个愿～',
        '可能会收到一条暖心的消息～',
        '今天适合拍一张美美的照片～',
    ],
    sweetBonus: [
        '当然啦，有我就够了～',
        '不过最幸运的事是遇见我吧～',
        '但最好的运气就是和你在一起～',
        '有我在，每天都是好运气～',
    ],
}

const getDaySeed = () => {
    const date = getNowDay()
    return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
}

const seededRandom = (seed) => {
    let x = Math.sin(seed) * 10000
    return x - Math.floor(x)
}

module.exports = handleFortune = async () => {
    try {
        const seed = getDaySeed()
        
        let content = '🔮今日运势:'
        
        fortuneData.categories.forEach((cat, i) => {
            const min = cat.range[0]
            const max = cat.range[1]
            const rand = seededRandom(seed + i * 137)
            const stars = min + Math.floor(rand * (max - min + 1))
            content += `\n· ${cat.name} ${fortuneData.starMap[stars - 1]}`
        })
        
        const luckyIndex = Math.floor(seededRandom(seed + 999) * fortuneData.luckyMessages.length)
        content += `\n· 🍀今日小幸运: ${fortuneData.luckyMessages[luckyIndex]}`
        
        const bonusIndex = Math.floor(seededRandom(seed + 777) * fortuneData.sweetBonus.length)
        content += `\n· 💕${fortuneData.sweetBonus[bonusIndex]}`
        
        return content
    } catch (error) {
        console.log('运势处理失败', error.message || error)
        return '🔮今日运势: 运势计算中～'
    }
}