const express = require('express')
const crypto = require('crypto')
const xml2js = require('xml2js')

const app = express()

app.use(express.json())
app.use(express.text({ type: 'text/xml' }))

const WX_TOKEN = process.env.WX_TOKEN || ''

app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Push Bot API is running' })
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
        
        let fromUserName = ''
        let toUserName = ''
        
        if (typeof req.body === 'string' && req.body.includes('<xml>')) {
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
            
            console.log(`  XML解析: FromUserName=${fromUserName}, ToUserName=${toUserName}`)
        }
        
        const createTime = Math.floor(Date.now() / 1000)
        
        const replyXml = `<xml>
<ToUserName><![CDATA[${fromUserName}]]></ToUserName>
<FromUserName><![CDATA[${toUserName}]]></FromUserName>
<CreateTime>${createTime}</CreateTime>
<MsgType><![CDATA[text]]></MsgType>
<Content><![CDATA[收到你的消息啦~💕 每日推送正在运行中，期待明天的见面哦～]]></Content>
</xml>`
        
        res.set('Content-Type', 'application/xml')
        res.send(replyXml)
        console.log(`  ✅ 已回复XML消息`)
    } catch (error) {
        console.error('[POST /callback] 错误:', error.message)
        res.status(500).send(error.message)
    }
})

function getSignature(token, timestamp, nonce, echostr) {
    const arr = [token, timestamp, nonce, echostr].sort()
    const str = arr.join('')
    return crypto.createHash('sha1').update(str).digest('hex')
}

module.exports = app