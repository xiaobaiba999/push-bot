const aiChat = require('./aiChat')
const { aiConfig } = require('../input')
const robot = require('./robotPush')

module.exports.verify = (query) => {
    return query.echostr || ''
}

module.exports.handleMessage = async (body) => {
    try {
        if (!aiConfig.open) {
            return { success: false, msg: 'AI对话功能未开启' }
        }

        let userId = ''
        let userMessage = ''

        if (body && body.Event) {
            return { success: true, msg: 'event received' }
        }

        if (body && body.Content) {
            userId = body.FromUserName || 'default_user'
            userMessage = body.Content.trim()
        } else if (body && body.text) {
            userId = body.fromUserId || 'default_user'
            userMessage = body.text.trim()
        }

        if (!userMessage) {
            return { success: false, msg: '空消息' }
        }

        if (userMessage === '历史记录' || userMessage === '查看对话') {
            const history = aiChat.getHistory(userId)
            await robot.sendText(history)
            return { success: true, msg: '历史记录已发送' }
        }

        if (userMessage === '清除记录') {
            aiChat.clearHistory(userId)
            await robot.sendText('对话记录已清除~')
            return { success: true, msg: '记录已清除' }
        }

        const aiReply = await aiChat.chat(userId, userMessage)
        await robot.sendText(`🤖 ${aiReply}`)

        return { success: true, msg: '回复已发送' }
    } catch (error) {
        console.log('处理回调消息失败:', error.message || error)
        try {
            await robot.sendText('我暂时走神了，稍后再问我好吗~💕')
        } catch (e) {
        }
        return { success: false, msg: error.message || '处理失败' }
    }
}
