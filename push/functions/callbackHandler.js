const robot = require('./robotPush')

module.exports.verify = (query) => {
    return query.echostr || ''
}

module.exports.handleMessage = async (body) => {
    try {
        if (body && body.Event) {
            return { success: true, msg: 'event received' }
        }

        return { success: true, msg: '消息已接收' }
    } catch (error) {
        console.log('处理回调消息失败:', error.message || error)
        return { success: false, msg: error.message || '处理失败' }
    }
}