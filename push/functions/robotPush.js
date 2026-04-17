const axios = require('axios')
const { robotKey, atAll } = require('../input')

const sendText = async (content, mentionedList) => {
    let mentioned_list = mentionedList || []
    atAll && mentioned_list.push("@all")
    const params = {
        method: 'POST',
        url: robotKey.trim(),
        headers: { 'Content-Type': 'application/json' },
        timeout: 8000,
        data: {
            msgtype: "text",
            text: { content, mentioned_list }
        },
    }
    const { data } = await axios(params)
    if (data.errcode != 0) throw new Error(data.errmsg || '发送失败')
    return data
}

const sendMarkdown = async (content) => {
    const params = {
        method: 'POST',
        url: robotKey.trim(),
        headers: { 'Content-Type': 'application/json' },
        timeout: 8000,
        data: {
            msgtype: "markdown",
            markdown: { content }
        },
    }
    const { data } = await axios(params)
    if (data.errcode != 0) throw new Error(data.errmsg || '发送失败')
    return data
}

const robot = async (content) => {
    try {
        return await sendText(content)
    } catch (error) {
        throw new Error(error.message || error)
    }
}

robot.sendText = sendText
robot.sendMarkdown = sendMarkdown

module.exports = robot
