
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
    const { start, weather, daily, end, classTable, sentence, memorial } = require('./input')

    if (start.open) {
      content.push(`${start.content}`)
      cLog('开头语处理成功', start.content)
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
      content.push(`\n\n🏠我们的纪念网站:\n复制链接在浏览器打开: www.liyaoyao.top`)
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
    const { memorial } = require('./input')
    cLog('__当前时间为__', getNowDay(_ctx))
    const content = await handleContent()
    const robot = require('./functions/robotPush')
    const res = await robot(content)
    if (memorial.open) {
      try {
        await robot.sendMarkdown(`🏠 **我们的纪念网站**\n> [点击访问 liyaoyao.top](https://www.liyaoyao.top)\n> 如无法点击，请复制链接在浏览器打开: www.liyaoyao.top`)
        cLog('纪念网站markdown推送成功')
      } catch (e) {
        cLog('纪念网站markdown推送失败', e.message || e)
      }
    }
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

// ==================== 腾讯云 SCF 兼容入口 ====================
// 腾讯云云函数 SCF 使用 main_handler 作为入口
exports.main_handler = async (event, context) => {
  try {
    cLog('腾讯云 SCF 触发', context.function_name)
    
    // 判断触发类型
    const triggerType = event.TriggerName || 'unknown'
    
    // HTTP 触发（API 网关）
    if (event.httpMethod || (event.headers && event.requestContext)) {
      return await handleTencentCloudHTTP(event, context)
    }
    
    // 定时触发
    if (triggerType.includes('timer') || event.Type === 'Timer') {
      return await module.exports.handler()
    }
    
    // 默认执行推送
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

// 腾讯云 HTTP 触发器处理
const handleTencentCloudHTTP = async (event, context) => {
  const httpMethod = event.httpMethod || 'GET'
  const queryString = event.queryString || {}
  const body = event.body || '{}'
  
  // 构造兼容的 ctx 对象
  const tencentCtx = {
    method: httpMethod,
    queries: queryString,
    body: typeof body === 'string' ? body : JSON.stringify(body)
  }
  
  // 调用回调处理
  const result = await module.exports.callback(tencentCtx)
  
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: result
  }
}

// ==================== 本地测试 ====================
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
