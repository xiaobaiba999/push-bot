
const axios = require('axios')
axios.defaults.timeout = 8000

let _ctx
const cLog = (...msg) => {
  let data = ['\n', ...msg, '\n']
  if (_ctx) {
    _ctx.logger.info(...data) 
  }
  console.log(...data)
}

const handleContent = async () => {
  try {
    let content = []
    const { start, weather, daily, end, classTable, sentence, memorial, progress, solarTerm, fortune, lifeTip } = require('./input')

    if (start.open) {
      content.push(`${start.content}`)
      cLog('开头语处理成功', start.content)
    }

    if (solarTerm && solarTerm.open) {
      try {
        const handleSolarTerm = require('./functions/solarTerm')
        const solarTermContent = await handleSolarTerm()
        if (solarTermContent) {
          content.push(`\n\n${solarTermContent}`)
          cLog('节气彩蛋处理成功')
        }
      } catch (e) {
        cLog('节气彩蛋处理失败', e.message || e)
      }
    }

    if (lifeTip && lifeTip.open) {
      try {
        const handleLifeTip = require('./functions/lifeTip')
        const lifeTipContent = await handleLifeTip()
        if (lifeTipContent) {
          content.push(`\n\n${lifeTipContent}`)
          cLog('生活提醒处理成功')
        }
      } catch (e) {
        cLog('生活提醒处理失败', e.message || e)
      }
    }

    if (classTable.open) {
      try {
        const handleClassTable = require('./functions/classTable')
        const classTableContent = await handleClassTable()
        content.push(`\n\n${classTableContent}`)
        cLog('课表处理成功', classTableContent)
      } catch (e) {
        cLog('课表处理失败', e.message || e)
        content.push('\n\n📕课表获取失败，稍后再看哦~')
      }
    }

    if (weather.open) {
      try {
        const handleWeather = require('./functions/weather')
        const weatherContent = await handleWeather()
        content.push(`\n\n${weatherContent}`)
        cLog('天气处理成功', weatherContent)
      } catch (e) {
        cLog('天气处理失败', e.message || e)
        content.push('\n\n🌍天气获取失败，记得自己看天气预报哦~')
      }
    }

    if (daily.open) {
      try {
        const handleTimeList = require('./functions/daily')
        const dailyContent = await handleTimeList()
        content.push(`\n\n${dailyContent}`)
        cLog('纪念日处理成功', dailyContent)
      } catch (e) {
        cLog('纪念日处理失败', e.message || e)
        content.push('\n\n📆纪念日计算失败~')
      }
    }

    if (progress && progress.open) {
      try {
        const handleProgress = require('./functions/progressBar')
        const progressContent = await handleProgress()
        content.push(`\n\n${progressContent}`)
        cLog('恋爱进度条处理成功')
      } catch (e) {
        cLog('恋爱进度条处理失败', e.message || e)
      }
    }

    if (fortune && fortune.open) {
      try {
        const handleFortune = require('./functions/fortune')
        const fortuneContent = await handleFortune()
        content.push(`\n\n${fortuneContent}`)
        cLog('运势处理成功')
      } catch (e) {
        cLog('运势处理失败', e.message || e)
      }
    }

    if (sentence.open) {
      try {
        const res = await axios.get('https://api.shadiao.pro/chp', { timeout: 5000 })
        content.push(`\n\n💘${res.data.data.text}`)
        cLog('彩虹屁处理成功', res.data.data.text)
      } catch (e) {
        cLog('彩虹屁处理失败', e.message || e)
        content.push('\n\n💘你是我见过最美的风景~')
      }
    }

    if (memorial.open) {
      content.push(`\n\n🏠我们的纪念网站:\n👉 https://www.liyaoyao.top`)
      cLog('纪念网站链接添加成功')
    }

    if (end.open) {
      content.push(`\n\n${end.content}`)
      cLog('结束语处理成功')
    }

    if (content.length == 0) {
      content.push('请最少配置一个模块内容,没有内容无法推送')
    }
    return content.join('')
  } catch (error) {
    cLog('处理内容失败', error.message || error)
    throw error
  }
}

module.exports.handler = async (ctx) => {
  try {
    _ctx = ctx
    const { getNowDay } = require('./functions/utils')
    cLog('__当前时间为__', getNowDay(_ctx))
    const content = await handleContent()
    const robot = require('./functions/robotPush')
    const res = await robot(content)
    return JSON.stringify({ success: true, data: res })
  } catch (error) {
    cLog('推送失败', error.message || error)
    return JSON.stringify({ success: false, errMsg: error.message || error })
  }
}

module.exports.push = module.exports.handler

module.exports.callback = async (ctx) => {
    const callbackHandler = require('./functions/callbackHandler')
    
    if (ctx.method === 'GET') {
        const echostr = ctx.queries.echostr || ''
        return echostr
    }
    
    if (ctx.method === 'POST') {
        let body = {}
        try {
            body = typeof ctx.body === 'string' ? JSON.parse(ctx.body) : (ctx.body || {})
        } catch (e) {
            body = {}
        }
        const result = await callbackHandler.handleMessage(body)
        return JSON.stringify(result)
    }
    
    return JSON.stringify({ success: false, msg: 'unsupported method' })
}

exports.main_handler = async (event, context) => {
  try {
    cLog('腾讯云 SCF 触发', context.function_name)
    
    const triggerType = event.TriggerName || 'unknown'
    
    if (event.httpMethod || (event.headers && event.requestContext)) {
      return await handleTencentCloudHTTP(event, context)
    }
    
    if (triggerType.includes('timer') || event.Type === 'Timer') {
      return await module.exports.handler()
    }
    
    return await module.exports.handler()
  } catch (error) {
    cLog('腾讯云 SCF 执行失败', error.message || error)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, errMsg: error.message || error })
    }
  }
}

const handleTencentCloudHTTP = async (event, context) => {
  const httpMethod = event.httpMethod || 'GET'
  const queryString = event.queryString || {}
  const body = event.body || '{}'
  
  const tencentCtx = {
    method: httpMethod,
    queries: queryString,
    body: typeof body === 'string' ? body : JSON.stringify(body)
  }
  
  const result = await module.exports.callback(tencentCtx)
  
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: result
  }
}

const isLocal = typeof require.main !== 'undefined' && require.main === module
if (isLocal) {
  const express = require('express')
  const app = express()
  app.listen(8090, () => {
    console.log('\n本地测试环境开启于 http://localhost:8090 \n')
  })
  app.get('/', async (req, res) => {
    const pushRes = await module.exports.handler()
    res.send(pushRes)
  })
}