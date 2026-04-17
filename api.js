const express = require('express')
const axios = require('axios')
const crypto = require('crypto')

const app = express()
app.use(express.json())

// 从环境变量读取配置（Vercel 部署用环境变量）
const aiConfig = {
  open: true,
  provider: 'nvidia',
  apiKey: process.env.NV_API_KEY || '',
  model: process.env.AI_MODEL || 'z-ai/glm-4.7',
  systemPrompt: '你是一个温柔体贴的AI助手，专门为情侣提供日常问候、天气建议和甜蜜互动。回答要言简意赅简洁温暖。'
}

const robotKey = process.env.WX_ROBOT_KEY || ''

// AI对话上下文缓存
const conversationCache = new Map()
const MAX_HISTORY = 5

// 企业微信配置（从环境变量或默认值读取）
const WX_TOKEN = process.env.WX_TOKEN || ''
const WX_ENCODING_AES_KEY = process.env.WX_ENCODING_AES_KEY || ''

app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Push Bot API is running' })
})

// 企业微信回调验证（GET请求 - URL验证）
app.get('/callback', (req, res) => {
    try {
        const { msg_signature, timestamp, nonce, echostr } = req.query
        
        console.log(`[GET /callback] 验证请求 received`)
        console.log(`  echostr: ${echostr}`)
        
        if (!echostr) {
            return res.status(400).send('missing echostr')
        }
        
        // 如果有token，进行签名验证
        if (WX_TOKEN) {
            const signature = getSignature(WX_TOKEN, timestamp, nonce, echostr)
            if (signature !== msg_signature) {
                console.log(`  签名不匹配! expected=${msg_signature}, got=${signature}`)
                return res.status(403).send('signature mismatch')
            }
            console.log(`  ✅ 签名验证通过`)
        }
        
        // 直接返回echostr（企业微信要求原样返回）
        res.send(echostr)
        console.log(`  ✅ 返回echostr成功`)
    } catch (error) {
        console.error('[GET /callback] 错误:', error.message)
        res.status(500).send(error.message)
    }
})

// AI对话主接口（POST请求 - 接收消息）
app.post('/callback', async (req, res) => {
    try {
        let body = req.body
        
        // 解析消息（企业微信XML格式或JSON格式）
        const userId = body.FromUserName || body.FromUserID || body.fromUserId || 'default_user'
        const userMessage = (body.Content || body.content || '').trim()

        console.log(`[${new Date().toLocaleString()}] 用户 ${userId}: ${userMessage}`)

        if (!userMessage) {
            return res.json({ success: false, msg: '空消息' })
        }

        // 特殊指令
        if (userMessage === '历史记录' || userMessage === '查看对话') {
            const history = getHistory(userId)
            await sendToWeChat(history)
            return res.json({ success: true, msg: '历史记录已发送' })
        }

        if (userMessage === '清除记录') {
            conversationCache.delete(userId)
            await sendToWeChat('对话记录已清除~')
            return res.json({ success: true, msg: '记录已清除' })
        }

        // AI对话
        const reply = await chatWithAI(userId, userMessage)
        
        // 通过企业微信Webhook回复
        await sendToWeChat(`🤖 ${reply}`)
        
        res.json({ success: true, msg: '回复已发送' })

    } catch (error) {
        console.error('[POST /callback] 处理失败:', error.message)
        res.status(500).json({ success: false, msg: error.message })
    }
})

// 企业微信签名算法
function getSignature(token, timestamp, nonce, echostr) {
    const arr = [token, timestamp, nonce, echostr].sort()
    const str = arr.join('')
    return crypto.createHash('sha1').update(str).digest('hex')
}

// AI对话函数
async function chatWithAI(userId, userMessage) {
    try {
        if (!conversationCache.has(userId)) {
            conversationCache.set(userId, [])
        }
        const history = conversationCache.get(userId)
        
        history.push({ role: 'user', content: userMessage })
        
        const response = await axios.post(
            'https://integrate.api.nvidia.com/v1/chat/completions',
            {
                model: aiConfig.model,
                messages: [
                    { 
                        role: 'system', 
                        content: aiConfig.systemPrompt
                    },
                    ...history
                ],
                max_tokens: 200,
                temperature: 0.7,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${aiConfig.apiKey}`,
                    'Accept': 'application/json'
                },
                timeout: 8000
            }
        )
        
        const aiReply = response.data.choices[0].message.content
        
        history.push({ role: 'assistant', content: aiReply })
        
        if (history.length > MAX_HISTORY * 2) {
            history.splice(0, history.length - MAX_HISTORY * 2)
        }
        
        return aiReply
        
    } catch (error) {
        console.error('AI调用失败:', error.message)
        return '我暂时走神了，稍后再问我好吗~💕'
    }
}

function getHistory(userId) {
    const history = conversationCache.get(userId) || []
    if (history.length === 0) return '暂无对话记录'
    
    const recent = history.slice(-10)
    let summary = '📝最近对话:\n'
    recent.forEach((msg) => {
        const prefix = msg.role === 'user' ? '🙋' : '🤖'
        const text = msg.content.length > 30 ? msg.content.substring(0, 30) + '...' : msg.content
        summary += `${prefix} ${text}\n`
    })
    return summary
}

async function sendToWeChat(content) {
    if (!robotKey) {
        console.log('⚠️ 未配置机器人Webhook，跳过发送')
        return
    }
    
    await axios.post(robotKey.trim(), {
        msgtype: "text",
        text: { content }
    }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 8000
    })
}

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`\n🤖 Push Bot API running on port ${PORT}`)
    console.log(`📡 Callback URL: https://push-bot-sootxvercel.app/callback\n`)
})

module.exports = app
