const express = require('express')
const axios = require('axios')

const app = express()
app.use(express.json())

const { aiConfig } = require('./input')

// AI对话上下文缓存
const conversationCache = new Map()
const MAX_HISTORY = 5

app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Push Bot API is running' })
})

// 企业微信回调验证
app.get('/callback', (req, res) => {
    const echostr = req.query.echostr || ''
    res.send(echostr)
})

// AI对话主接口
app.post('/callback', async (req, res) => {
    try {
        let body = req.body
        
        // 解析消息
        const userId = body.FromUserName || body.fromUserId || 'default_user'
        const userMessage = (body.Content || body.text || '').trim()

        if (!userMessage) {
            return res.json({ success: false, msg: '空消息' })
        }

        console.log(`[${new Date().toLocaleString()}] 用户 ${userId}: ${userMessage}`)

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
        console.error('处理失败:', error.message)
        res.status(500).json({ success: false, msg: error.message })
    }
})

// AI对话函数
async function chatWithAI(userId, userMessage) {
    try {
        // 获取或创建历史
        if (!conversationCache.has(userId)) {
            conversationCache.set(userId, [])
        }
        const history = conversationCache.get(userId)
        
        // 添加用户消息
        history.push({ role: 'user', content: userMessage })
        
        // 调用NVIDIA API
        const response = await axios.post(
            'https://integrate.api.nvidia.com/v1/chat/completions',
            {
                model: aiConfig.model || 'z-ai/glm-4.7',
                messages: [
                    { 
                        role: 'system', 
                        content: aiConfig.systemPrompt || '你是一个温柔体贴的AI助手，专门为情侣提供日常问候、天气建议和甜蜜互动。回答要言简意赅简洁温暖。' 
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
                timeout: 5000
            }
        )
        
        const aiReply = response.data.choices[0].message.content
        
        // 添加AI回复到历史
        history.push({ role: 'assistant', content: aiReply })
        
        // 保持最近5轮（10条消息）
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
    const { robotKey } = require('./input')
    
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
    console.log(`📡 Callback URL: https://你的域名.vercel.app/callback\n`)
})
