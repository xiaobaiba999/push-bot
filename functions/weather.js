const { weather } = require('../input')
const axios = require('axios')

const getCityCode = async (cityName) => {
    try {
        const res = await axios.get(`https://geoapi.qweather.com/v2/city/lookup?location=${encodeURI(weather.city, 'gbk')}&key=${weather.key}`, { timeout: 5000 })
        if (res.data.code == 200) {
            return res.data.location[0].id
        } else {
            throw new Error(`天气API返回错误码: ${res.data.code}`)
        }
    } catch (error) {
        console.log('获取城市代码失败', error.message || error)
        throw error
    }
}

const getUVIndex = async (cityId) => {
    try {
        const res = await axios.get(`https://devapi.qweather.com/v7/indices/1d?key=${weather.key}&location=${cityId}&type=5`, { timeout: 5000 })
        if (res.data.code == 200) {
            return {
                category: res.data.daily[0].category,
                text: res.data.daily[0].text,
            }
        } else {
            throw new Error(`紫外线API返回错误码: ${res.data.code}`)
        }
    } catch (error) {
        console.log('获取紫外线指数失败', error.message || error)
        throw error
    }
}

const getNowWeather = async (cityId) => {
    try {
        const res = await axios.get(`https://devapi.qweather.com/v7/weather/now?key=${weather.key}&location=${cityId}`, { timeout: 5000 })
        if (res.data.code == 200) {
            return res.data.now
        } else {
            throw new Error(`实时天气API返回错误码: ${res.data.code}`)
        }
    } catch (error) {
        console.log('获取实时天气失败', error.message || error)
        throw error
    }
}

const getUVLevel = (uvIndex) => {
    if (uvIndex <= 2) return { level: 1, desc: '最弱', color: '🟢', advice: '无需特别防护', travel: '放心出门玩耍～' }
    if (uvIndex <= 5) return { level: 2, desc: '弱', color: '🟡', advice: '适当涂抹防晒霜', travel: '出门涂点防晒霜就好～' }
    if (uvIndex <= 7) return { level: 3, desc: '中等', color: '🟠', advice: '外出需涂防晒霜、戴帽子', travel: '出门记得涂SPF30+防晒霜，戴帽子哦❤️' }
    if (uvIndex <= 10) return { level: 4, desc: '强', color: '🔴', advice: '避免长时间户外活动，必须防晒', travel: '出门记得涂SPF50+的防晒霜，带遮阳伞哦❤️' }
    return { level: 5, desc: '极强', color: '⚫', advice: '尽量避免外出，必须全面防护', travel: '紫外线很强，尽量别在太阳下暴晒，出门必须全副武装❤️' }
}

const estimateRealTimeUV = (dailyUV, hour, weatherText, month) => {
    const maxUV = parseInt(dailyUV)
    if (isNaN(maxUV) || maxUV <= 0) return 0

    let timeFactor = 0
    if (hour >= 11 && hour <= 13) timeFactor = 1.0
    else if (hour >= 10 && hour <= 14) timeFactor = 0.85
    else if (hour >= 9 && hour <= 15) timeFactor = 0.65
    else if (hour >= 8 && hour <= 16) timeFactor = 0.4
    else if (hour >= 7 && hour <= 17) timeFactor = 0.2
    else return 0

    let seasonFactor = 1.0
    if (month >= 6 && month <= 8) seasonFactor = 1.15
    else if (month >= 5 || month === 9) seasonFactor = 1.05
    else if (month >= 4 || month === 10) seasonFactor = 0.95
    else if (month >= 11 || month <= 2) seasonFactor = 0.75
    else seasonFactor = 0.85

    const text = (weatherText || '').toLowerCase()
    let weatherFactor = 1.0

    if (text.includes('大暴雨') || text.includes('雷暴') || text.includes('冰雹')) {
        weatherFactor = 0.15
    } else if (text.includes('大雨') || text.includes('中雨') || text.includes('雷阵雨')) {
        weatherFactor = 0.25
    } else if (text.includes('小雨') || text.includes('阵雨') || text.includes('毛毛雨')) {
        weatherFactor = 0.45
    } else if (text.includes('重度霾') || text.includes('浓雾') || text.includes('沙尘')) {
        weatherFactor = 0.25
    } else if (text.includes('霾') || text.includes('轻雾') || text.includes('薄雾') || text.includes('浮尘')) {
        weatherFactor = 0.35
    } else if (text.includes('阴') || text.includes('厚云')) {
        weatherFactor = 0.40
    } else if (text.includes('少云') || text.includes('散片云')) {
        weatherFactor = 0.80
    } else if (text.includes('多云')) {
        weatherFactor = 0.65
    } else if (text.includes('晴间多云') || text.includes('晴转多云')) {
        weatherFactor = 0.85
    } else if (text.includes('晴') || text.includes('阳光充足')) {
        weatherFactor = 1.0
    }

    return Math.max(0, Math.round(maxUV * timeFactor * seasonFactor * weatherFactor))
}

const getTempColor = (temp) => {
    const t = parseInt(temp)
    if (t <= 10) return '🔵'
    if (t <= 20) return '🟢'
    if (t <= 30) return '🟡'
    if (t <= 35) return '🟠'
    return '🔴'
}

const getWindColor = (windScale) => {
    const s = parseInt(windScale)
    if (s <= 2) return '🍃'
    if (s <= 4) return '🌿'
    if (s <= 6) return '💨'
    return '🌪️'
}

const getOutfitAdvice = (temp) => {
    const t = parseInt(temp)
    if (t <= 0) return '🧥 天寒地冻！穿厚羽绒服+保暖内衣+围巾手套，里三层外三层就对了～'
    if (t <= 5) return '🧥 很冷！穿厚羽绒服+毛衣+保暖裤，别让自己冻着～'
    if (t <= 10) return '🧥 偏冷！穿棉服/厚外套+毛衣+长裤，出门记得戴围巾～'
    if (t <= 15) return '🧥 微冷！穿薄外套+长袖T恤+长裤，早晚加件外套就好～'
    if (t <= 20) return '👔 舒适！穿薄外套+长袖T恤就刚刚好～'
    if (t <= 25) return '👕 温暖！穿短袖/薄长袖+长裤/裙子，很适合出门～'
    if (t <= 30) return '🩳 偏热！穿短袖短裤/短裙，轻薄透气最重要～'
    if (t <= 35) return '🩳 炎热！穿最轻薄的衣服，尽量待在室内～'
    return '🩳 酷暑！能不出门就不出门，出门必须防晒防暑～'
}

const getTimePeriod = () => {
    const hour = new Date().getHours()
    if (hour >= 6 && hour < 9) return '早上'
    if (hour >= 9 && hour < 11) return '上午'
    if (hour >= 11 && hour < 13) return '中午'
    if (hour >= 13 && hour < 17) return '下午'
    if (hour >= 17 && hour < 19) return '傍晚'
    return '晚上'
}

const handleWeather = async () => {
    try {
        const cityId = await getCityCode(weather.city)
        
        const [dailyRes, nowData, uvData] = await Promise.all([
            axios(`https://devapi.qweather.com/v7/weather/3d?key=${weather.key}&location=${cityId}`, { timeout: 5000 }),
            getNowWeather(cityId).catch(err => {
                console.log('获取实时天气失败，降级处理', err.message || err)
                return null
            }),
            getUVIndex(cityId).catch(err => {
                console.log('获取紫外线数据失败，降级处理', err.message || err)
                return null
            })
        ])

        if (dailyRes.data.code != 200) {
            throw new Error(`天气数据返回错误码: ${dailyRes.data.code}`)
        }

        const daily = dailyRes.data.daily[parseInt(weather.index)]
        const fxLink = dailyRes.data.fxLink
        const day = ['今日', '明日', '后天'][weather.index]
        const period = getTimePeriod()
        const currentHour = new Date().getHours()

        let rainTip = daily.iconDay >= 300 && daily.iconDay < 400 ? `\n· ☔${day}有雨, 出门记得带伞哦！` : ''

        let nowLine = ''
        if (nowData) {
            const nowTemp = nowData.temp
            const nowText = nowData.text
            const nowWindDir = nowData.windDir
            const nowWindScale = nowData.windScale
            const nowHumidity = nowData.humidity
            const nowFeelsLike = nowData.feelsLike
            const nowColor = getTempColor(nowTemp)
            const nowWindColor = getWindColor(nowWindScale)

            nowLine = `\n· 📍【${period}实况 ${nowColor}${nowTemp}℃${nowColor}】${nowText}，体感${nowFeelsLike}℃，湿度${nowHumidity}%\n· 💨【当前风况 ${nowWindColor}${nowWindDir} ${nowWindScale}级${nowWindColor}】`
        }

        let tempColor = getTempColor(daily.tempMax)
        let dailyLine = `\n· 🌡️【${day}气温 ${tempColor}${daily.tempMin} ~ ${daily.tempMax}℃${tempColor}】 ${daily.textDay}`

        let uvLine = ''
        let travelLine = ''
        if (uvData) {
            const currentWeatherText = nowData ? nowData.text : daily.textDay
            const currentMonth = new Date().getMonth() + 1
            const realTimeUV = estimateRealTimeUV(uvData.text, currentHour, currentWeatherText, currentMonth)
            const uvInfo = getUVLevel(realTimeUV)
            
            if (currentHour >= 18 || currentHour < 6) {
                uvLine = `\n· 🌙【当前紫外线 🟢 0级(无)🟢】夜间无紫外线`
            } else {
                uvLine = `\n· ☀️【${period}紫外线 ${uvInfo.color} ${uvInfo.level}级(${uvInfo.desc})${uvInfo.color}】\n  ⚠️ ${uvInfo.advice}`
                travelLine = `\n· 🧴【出行提醒】${uvInfo.travel}`
            }
        } else {
            uvLine = '\n· 紫外线 暂无数据'
        }

        let outfitTemp = nowData ? nowData.temp : daily.tempMax
        let outfitLine = `\n· 👗【穿搭建议】${getOutfitAdvice(outfitTemp)}`

        let weatherContent = `🌍${weather.city}${day}天气:${nowLine}${dailyLine}${rainTip}${uvLine}${travelLine}${outfitLine}\n· 🔗天气详情: ${fxLink || 'https://www.qweather.com'}`
        
        console.log('获取天气成功，含实时紫外线数据')
        return weatherContent
    } catch (error) {
        console.log('处理天气数据失败', error.message || error)
        return `🌍天气获取失败，记得看天气预报哦～`
    }
}

module.exports = handleWeather