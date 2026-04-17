const express = require('express')
const axios = require('axios')
const crypto = require('crypto')
const xml2js = require('xml2js')

const app = express()

app.use(express.text({ type: 'text/xml' }))
app.use(express.json())

const aiConfig = {
  open: true,
  provider: 'nvidia',
  apiKey: process.env.NV_API_KEY || '',
  model: process.env.AI_MODEL || 'z-ai/glm-4.7',
  systemPrompt: '你是一个温柔体贴的AI助手，专门为情侣提供日常问候、天气建议和甜蜜互动。回答要言简意赅简洁温暖。'
}

const robotKey = process.env.WX_ROBOT_KEY || ''
const WX_CORP_ID = process.env.WX_CORP_ID || ''
const WX_AGENT_ID = process.env.WX_AGENT_ID || ''
const WX_SECRET = process.env.WX_SECRET || ''

const conversationCache = new Map()
const MAX_HISTORY = 5

const WX_TOKEN = process.env.WX_TOKEN || ''
const WX_ENCODING_AES_KEY = process.env.WX_ENCODING_AES_KEY || ''

app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Push Bot API is running', mode: 'enterprise-wechat-app' })
})

app.get('/callback', (req, res) => {
    try {
        const { msg_signature, timestamp, nonce, echostr } = req.query
        
        console.log(`[GET /callback] 验证请求 received`)
        console.log(`  echostr: ${echostr}`)
        
        if (!echostr) {
            return res.status(400).send('missing echostr')
        }
        
        if (WX_TOKEN) {
            const signature = getSignature(WX_TOKEN, timestamp, nonce, echostr)
            if (signature !== msg_signature) {
                console.log(`  签名不匹配! expected=${msg_signature}, got=${signature}`)
                return res.status(403).send('signature mismatch')
            }
            console.log(`  ✅ 签名验证通过`)
        }
        
        res.send(echostr)
        console.log(`  ✅ 返回echostr成功`)
    } catch (error) {
        console.error('[GET /callback] 错误:', error.message)
        res.status(500).send(error.message)
    }
})

app.post('/callback', async (req, res) => {
    try {
        console.log(`[POST /callback] 收到请求`)
        console.log(`  Content-Type: ${req.headers['content-type']}`)
        console.log(`  Body:`, req.body?.substring(0, 200) || req.body)

        let userId = 'default_user'
        let userMessage = ''
        let toUserName = ''
        let fromUserName = ''
        let createTime = ''
        let msgId = ''
        let agentId = ''

        if (typeof req.body === 'string' && req.body.includes('<xml>')) {
            console.log(`  检测到XML格式（企业微信自建应用）`)
            
            const parseXml = () => {
                return new Promise((resolve, reject) => {
                    xml2js.parseString(req.body, { explicitArray: false }, (err, result) => {
                        if (err) reject(err)
                        else resolve(result)
                    })
                })
            }

            const xmlData = await parseXml()
            const xml = xmlData.xml
            
            fromUserName = xml.FromUserName || ''
            toUserName = xml.ToUserName || ''
            createTime = xml.CreateTime || ''
            userMessage = (xml.Content || '').trim()
            msgId = xml.MsgId || ''
            agentId = xml.AgentId || ''
            
            userId = fromUserId || 'default_user'
            
            console.log(`  XML解析结果:`)
            console.log(`    FromUserName: ${fromUserName}`)
            console.log(`    Content: ${userMessage}`)
            console.log(`    AgentId: ${agentId}`)
        } else if (typeof req.body === 'object') {
            console.log(`  检测到JSON格式（群机器人）`)
            
            userId = req.body.FromUserName || req.body.FromUserID || req.body.fromUserId || 'default_user'
            userMessage = (req.body.Content || req.body.content || '').trim()
        }

        console.log(`[${new Date().toLocaleString()}] 用户 ${userId}: ${userMessage}`)

        if (!userMessage) {
            console.log(`  ⚠️ 空消息，返回success`)
            return res.send('success')
        }

        if (userMessage === '历史记录' || userMessage === '查看对话') {
            const history = getHistory(userId)
            await sendToWeChatApp(userId, history)
            return res.send('success')
        }

        if (userMessage === '清除记录') {
            conversationCache.delete(userId)
            await sendToWeChatApp(userId, '对话记录已清除~')
            return res.send('success')
        }

        const reply = await chatWithAI(userId, userMessage)
        
        await sendToWeChatApp(userId, reply)
        
        res.send('success')

    } catch (error) {
        console.error('[POST /callback] 处理失败:', error.message)
        res.status(500).send(error.message)
    }
})

function getSignature(token, timestamp, nonce, echostr) {
    const arr = [token, timestamp, nonce, echostr].sort()
    const str = arr.join('')
    return crypto.createHash('sha1').update(str).digest('hex')
}

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

async function sendToWeChatApp(userId, content) {
    if (robotKey) {
        console.log(`📤 通过群机器人Webhook发送`)
        await sendToWeChat(content)
        return
    }

    if (!WX_CORP_ID || !WX_SECRET || !WX_AGENT_ID) {
        console.log(`⚠️ 未配置企业微信应用凭证(CORP_ID/SECRET/AGENT_ID)，无法发送消息`)
        console.log(`   需要在Vercel环境变量中配置:`)
        console.log(`   - WX_CORP_ID (企业ID)`)
        console.log(`   - WX_SECRET (应用Secret)`)
        console.log(`   - WX_AGENT_ID (应用AgentId)`)
        return
    }

    try {
        console.log(`📤 通过企业微信API发送给用户: ${userId}`)
        
        const tokenRes = await axios.get(
            `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${WX_CORP_ID}&corpsecret=${WX_SECRET}`,
            { timeout: 5000 }
        )

        if (tokenRes.data.errcode !== 0) {
            throw new Error(`获取access_token失败: ${tokenRes.data.errmsg}`)
        }

        const accessToken = tokenRes.data.access_token

        const sendRes = await axios.post(
            `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${accessToken}`,
            {
                touser: userId,
                msgtype: "text",
                agentid: parseInt(WX_AGENT_ID),
                text: { content }
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 5000
            }
        )

        if (sendRes.data.errcode === 0) {
            console.log(`✅ 消息发送成功`)
        } else {
            console.error(`❌ 消息发送失败: ${sendRes.data.errmsg} (${sendRes.data.errcode})`)
        }

    } catch (error) {
        console.error(`❌ 发送消息异常:`, error.message)
    }
}

module.exports = app