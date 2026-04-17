
const axios = require('axios')
const { aiConfig } = require('../input')

const conversationCache = new Map()
const MAX_HISTORY = 5

const getConversation = (userId) => {
    if (!conversationCache.has(userId)) {
        conversationCache.set(userId, [])
    }
    return conversationCache.get(userId)
}

const addMessage = (userId, role, content) => {
    const history = getConversation(userId)
    history.push({ role, content })
    if (history.length > MAX_HISTORY * 2) {
        history.splice(0, history.length - MAX_HISTORY * 2)
    }
}

const getProviderConfig = () => {
    const provider = (aiConfig.provider || 'deepseek').toLowerCase()
    if (provider === 'nvidia') {
        return {
            url: 'https://integrate.api.nvidia.com/v1/chat/completions',
            model: aiConfig.model || 'z-ai/glm-4-9b-chat',
            apiKey: aiConfig.apiKey,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${aiConfig.apiKey}`,
                'Accept': 'application/json'
            }
        }
    }
    return {
        url: 'https://api.deepseek.com/v1/chat/completions',
        model: aiConfig.model || 'deepseek-chat',
        apiKey: aiConfig.apiKey,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${aiConfig.apiKey}`
        }
    }
}

const callAI = async (messages) => {
    const config = getProviderConfig()
    const response = await axios.post(
        config.url,
        {
            model: config.model,
            messages: [
                { role: 'system', content: aiConfig.systemPrompt || '你是一个温柔体贴的AI助手，专门为情侣提供日常问候、天气建议和甜蜜互动。回答要简洁温暖，每次回复不超过100字。' },
                ...messages
            ],
            max_tokens: 200,
            temperature: 0.7,
        },
        {
            headers: config.headers,
            timeout: 3000
        }
    )
    return response.data.choices[0].message.content
}

module.exports.chat = async (userId, userMessage) => {
    try {
        const history = getConversation(userId)
        addMessage(userId, 'user', userMessage)

        const aiReply = await callAI(history)
        addMessage(userId, 'assistant', aiReply)

        return aiReply
    } catch (error) {
        console.log('AI对话失败:', error.message || error)
        return '我暂时走神了，稍后再问我好吗~💕'
    }
}

module.exports.getHistory = (userId) => {
    const history = getConversation(userId)
    if (history.length === 0) return '暂无对话记录'

    const recent = history.slice(-10)
    let summary = '📝最近对话:\n'
    recent.forEach((msg, i) => {
        const prefix = msg.role === 'user' ? '🙋' : '🤖'
        const text = msg.content.length > 30 ? msg.content.substring(0, 30) + '...' : msg.content
        summary += `${prefix} ${text}\n`
    })
    return summary
}

module.exports.clearHistory = (userId) => {
    conversationCache.delete(userId)
}
