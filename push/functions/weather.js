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

const getUVLevel = (uvText) => {
    const uvIndex = parseInt(uvText)
    if (uvIndex <= 2) return { level: 1, desc: '最弱', color: '🟢', advice: '无需特别防护' }
    if (uvIndex <= 5) return { level: 2, desc: '弱', color: '🟡', advice: '适当涂抹防晒霜' }
    if (uvIndex <= 7) return { level: 3, desc: '中等', color: '🟠', advice: '外出需涂防晒霜、戴帽子' }
    if (uvIndex <= 10) return { level: 4, desc: '强', color: '🔴', advice: '避免长时间户外活动，必须防晒' }
    return { level: 5, desc: '极强', color: '⚫', advice: '尽量避免外出，必须全面防护' }
}

const getWeather = async (cityName, index = 0) => {
    try {
        const cityId = await getCityCode(cityName)
        const [weatherRes, uvData] = await Promise.all([
            axios(`https://devapi.qweather.com/v7/weather/3d?key=${weather.key}&location=${cityId}`, { timeout: 5000 }),
            getUVIndex(cityId).catch(err => {
                console.log('获取紫外线数据失败，将使用降级处理', err.message || err)
                return null
            })
        ])

        if (weatherRes.data.code == 200) {
            let data = {
                daily: weatherRes.data.daily[index],
                fxLink: weatherRes.data.fxLink,
                uv: uvData,
            }
            console.log('获取今日天气成功', data.fxLink)
            return data
        } else {
            throw new Error(`天气数据返回错误码: ${weatherRes.data.code}`)
        }
    } catch (error) {
        console.log('获取今日天气失败', error.message || error)
        throw error
    }
}

module.exports = handleWeather = async () => {
    try {
        const { daily, fxLink, uv } = await getWeather(weather.city, parseInt(weather.index))
        let day = ['今日', '明日', '后天'][weather.index]
        
        let rainTip = daily.iconDay >= 300 && daily.iconDay < 400 ? `\n· ${day}有雨, 出门记得带伞哦☔` : ''
        
        let tempColor = getTempColor(daily.tempMax)
        let windColor = getWindColor(parseInt(daily.windScaleDay))
        
        let uvLine = ''
        if (uv) {
            const uvInfo = getUVLevel(uv.text)
            uvLine = `\n· ☀️【紫外线 ${uvInfo.color} ${uvInfo.level}级(${uvInfo.desc})${uvInfo.color}】\n  ⚠️ ${uvInfo.advice}`
        } else {
            uvLine = '\n· 紫外线 暂无数据'
        }
        
        let weatherContent = `🌍${weather.city}${day}天气:\n· 🌡️【气温 ${tempColor}${daily.tempMin} ~ ${daily.tempMax}℃${tempColor}】 ${daily.textDay}\n· 💨【风况 ${windColor}${daily.windDirDay} ${daily.windScaleDay}级${windColor}】${rainTip}${uvLine}\n· 天气详情: https://www.qweather.com/weather/longzihu-101220205.html`
        return weatherContent
    } catch (error) {
        console.log('处理天气数据失败', error.message || error)
        return `🌍天气获取失败，记得看天气预报哦~\n· 天气详情: https://www.qweather.com/weather/longzihu-101220205.html`
    }
}

const getTempColor = (maxTemp) => {
    if (maxTemp <= 10) return '🔵'
    if (maxTemp <= 20) return '🟢'
    if (maxTemp <= 30) return '🟡'
    if (maxTemp <= 35) return '🟠'
    return '🔴'
}

const getWindColor = (windScale) => {
    if (windScale <= 2) return '🍃'
    if (windScale <= 4) return '🌿'
    if (windScale <= 6) return '💨'
    return '🌪️'
}
