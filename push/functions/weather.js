const { weather } = require('../input')
const axios = require('axios')

const WMO_CODE_MAP = {
    0: '晴', 1: '大部晴', 2: '多云', 3: '阴天',
    45: '雾', 48: '雾凇',
    51: '小毛毛雨', 53: '毛毛雨', 55: '大毛毛雨',
    56: '冻毛毛雨', 57: '大冻毛毛雨',
    61: '小雨', 63: '中雨', 65: '大雨',
    66: '冻雨', 67: '大冻雨',
    71: '小雪', 73: '中雪', 75: '大雪',
    77: '米雪', 80: '小阵雨', 81: '中阵雨', 82: '大阵雨',
    85: '小阵雪', 86: '大阵雪',
    95: '雷阵雨', 96: '雷阵雨伴冰雹', 99: '强雷阵雨伴冰雹',
}

const getUVLevelInfo = (uvIndex) => {
    const uv = Math.round(uvIndex * 10) / 10
    if (uv <= 2) return { level: 1, desc: '弱', color: '🟢', advice: '无需特别防护', travel: '放心出门玩耍～' }
    if (uv <= 5) return { level: 2, desc: '中等', color: '🟡', advice: '适当涂抹防晒霜', travel: '出门涂点防晒霜就好～' }
    if (uv <= 7) return { level: 3, desc: '强', color: '🟠', advice: '外出需涂防晒霜、戴帽子', travel: '出门记得涂SPF30+防晒霜，戴帽子哦❤️' }
    if (uv <= 10) return { level: 4, desc: '很强', color: '🔴', advice: '避免长时间户外活动，必须防晒', travel: '出门记得涂SPF50+的防晒霜，带遮阳伞哦❤️' }
    return { level: 5, desc: '极强', color: '⚫', advice: '尽量避免外出，必须全面防护', travel: '紫外线极强，尽量别在太阳下暴晒，出门必须全副武装❤️' }
}

const getWeatherDesc = (code) => {
    return WMO_CODE_MAP[code] || '未知'
}

const getWindDir = (deg) => {
    const dirs = ['北', '北东北', '东北', '东东北', '东', '东东南', '东南', '南东南', '南', '南西南', '西南', '西西南', '西', '西西北', '西北', '北西北']
    return dirs[Math.round(deg / 22.5) % 16]
}

const getWindScale = (speedKmh) => {
    if (speedKmh < 1) return 0
    if (speedKmh < 6) return 1
    if (speedKmh < 12) return 2
    if (speedKmh < 20) return 3
    if (speedKmh < 29) return 4
    if (speedKmh < 39) return 5
    if (speedKmh < 50) return 6
    if (speedKmh < 62) return 7
    if (speedKmh < 75) return 8
    if (speedKmh < 89) return 9
    if (speedKmh < 103) return 10
    if (speedKmh < 117) return 11
    return 12
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

const isRainCode = (code) => {
    return [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)
}

const handleWeather = async () => {
    try {
        const lat = weather.latitude
        const lon = weather.longitude
        const dayIndex = parseInt(weather.index)

        const url = 'https://api.open-meteo.com/v1/forecast'
        const params = {
            latitude: lat,
            longitude: lon,
            current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,is_day',
            hourly: 'uv_index',
            daily: 'weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_sum,precipitation_probability_max,sunrise,sunset',
            timezone: 'Asia/Shanghai',
            forecast_days: 3,
        }

        const res = await axios.get(url, { params, timeout: 10000 })

        if (!res.data || !res.data.current) {
            throw new Error('Open-Meteo API返回数据异常')
        }

        const current = res.data.current
        const daily = res.data.daily
        const hourly = res.data.hourly

        const day = ['今日', '明日', '后天'][dayIndex]
        const period = getTimePeriod()
        const currentHour = new Date().getHours()

        const nowTemp = Math.round(current.temperature_2m)
        const nowHumidity = current.relative_humidity_2m
        const nowFeelsLike = Math.round(current.apparent_temperature)
        const nowWeatherCode = current.weather_code
        const nowWeatherText = getWeatherDesc(nowWeatherCode)
        const nowWindSpeed = current.wind_speed_10m
        const nowWindDir = getWindDir(current.wind_direction_10m)
        const nowWindScale = getWindScale(nowWindSpeed)
        const nowColor = getTempColor(nowTemp)
        const nowWindColor = getWindColor(nowWindScale)

        let nowLine = `\n· 📍【${period}实况 ${nowColor}${nowTemp}℃${nowColor}】${nowWeatherText}，体感${nowFeelsLike}℃，湿度${nowHumidity}%\n· 💨【当前风况 ${nowWindColor}${nowWindDir} ${nowWindScale}级(${Math.round(nowWindSpeed)}km/h)${nowWindColor}】`

        const dayTempMax = Math.round(daily.temperature_2m_max[dayIndex])
        const dayTempMin = Math.round(daily.temperature_2m_min[dayIndex])
        const dayWeatherCode = daily.weather_code[dayIndex]
        const dayWeatherText = getWeatherDesc(dayWeatherCode)
        const tempColor = getTempColor(dayTempMax)

        let dailyLine = `\n· 🌡️【${day}气温 ${tempColor}${dayTempMin} ~ ${dayTempMax}℃${tempColor}】 ${dayWeatherText}`

        let rainTip = ''
        if (isRainCode(dayWeatherCode)) {
            rainTip = `\n· ☔${day}有雨, 出门记得带伞哦！`
        }
        const precipProb = daily.precipitation_probability_max[dayIndex]
        if (precipProb > 30 && !isRainCode(dayWeatherCode)) {
            rainTip = `\n· ☔${day}降水概率${precipProb}%, 建议带伞备用`
        }

        const dailyUVMax = daily.uv_index_max[dayIndex]
        const uvInfo = getUVLevelInfo(dailyUVMax)

        let uvLine = ''
        let travelLine = ''
        if (currentHour >= 18 || currentHour < 6) {
            uvLine = `\n· 🌙【当前紫外线 🟢 无🟢】夜间无紫外线`
        } else {
            let currentUV = 0
            if (hourly && hourly.uv_index) {
                const nowISO = new Date().toISOString().slice(0, 13)
                for (let i = 0; i < hourly.time.length; i++) {
                    if (hourly.time[i].startsWith(nowISO)) {
                        currentUV = hourly.uv_index[i] || 0
                        break
                    }
                }
            }
            const currentUVInfo = getUVLevelInfo(currentUV)

            uvLine = `\n· ☀️【${period}紫外线 ${currentUVInfo.color} UV${currentUV.toFixed(1)} ${currentUVInfo.desc}${currentUVInfo.color}】\n  ⚠️ ${currentUVInfo.advice}`

            if (dailyUVMax > currentUV + 1) {
                uvLine += `\n  📊今日最高UV${dailyUVMax.toFixed(1)}(${uvInfo.desc})`
            }

            const peakUVInfo = getUVLevelInfo(dailyUVMax)
            travelLine = `\n· 🧴【出行提醒】${peakUVInfo.travel}`
        }

        let outfitTemp = nowTemp
        let outfitLine = `\n· 👗【穿搭建议】${getOutfitAdvice(outfitTemp)}`

        const qweatherLink = 'https://www.qweather.com/weather/longzihu-101220205.html'
        let weatherContent = `🌍${weather.city}${day}天气:${nowLine}${dailyLine}${rainTip}${uvLine}${travelLine}${outfitLine}\n· 🔗天气详情: ${qweatherLink}`

        console.log('获取天气成功(Open-Meteo)，含实时UV数据')
        return weatherContent
    } catch (error) {
        console.log('处理天气数据失败', error.message || error)
        return `🌍天气获取失败，记得看天气预报哦～`
    }
}

module.exports = handleWeather
