/**
 * —————— ！！请在这个文件里，在对应的位置输入对应的内容！！ ——————
 */

let robotKey = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=ee02c921-9000-4f0b-bcad-4deea4114b01'

let start = {
    open: true,
    content: '宏宝早上好~❤️',
}

let weather = {
    open: true,
    city: '龙子湖区',
    key: '06dd3fdb9b914a58933afca5b8fd2776',
    index: 0,
}

let daily = {
    open: true,
    data: [
        {
            name: '相识',
            time: '2023-02-28'
        },
        {
            name: '相爱',
            time: '2023-05-20'
        },
        {
            name: '宏宝生日',
            time: 'YYYY-06-08'
        },
        {
            name: '宏宝大哥生日',
            time: 'YYYY-07-24'
        },
    ]
}

let end = {
    open: false,
    content: '这里放结束语, 或者不放, 用彩虹屁代替结束语',
}

let atAll = false

let classTable = {
    open: false,
    startTime: [2023, 9, 4],
    index: 0,
    list: [
        {
            name: '税务管理',
            address: 'A-108',
            week: [1, 3, 5, 7, 9, 11, 13, 15],
            day: [1],
            jie: [2],
        },
        {
            name: '税务管理',
            address: 'C-304',
            week: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
            day: [3],
            jie: [1],
        },
        {
            name: '地方财政学',
            address: 'A-308',
            week: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
            day: [1],
            jie: [4],
        },
        {
            name: '国际经济学',
            address: 'C-110',
            week: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
            day: [2],
            jie: [2],
        },
        {
            name: '税收风险管理',
            address: 'A-101',
            week: [1, 3, 5, 7, 9, 11, 13, 15],
            day: [2],
            jie: [3],
        },
        {
            name: '税收风险管理',
            address: 'A-301',
            week: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
            day: [4],
            jie: [3],
        },
        {
            name: '税收筹划',
            address: 'C-301',
            week: [1, 3, 5, 7, 9, 11, 13, 15],
            day: [3],
            jie: [2],
        },
        {
            name: '税收筹划',
            address: 'E-207',
            week: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
            day: [5],
            jie: [1],
        },
        {
            name: '税收综合模拟实验',
            address: '系北楼202',
            week: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
            day: [4],
            jie: [1],
        },
    ],
    endWord: '爱你宝宝💓',
}

let sentence = {
    open: true,
}

let memorial = {
    open: true,
}

let aiConfig = {
    open: true,
    provider: 'deepseek',
    apiKey: '',
    model: 'deepseek-chat',
    systemPrompt: '你是一个温柔体贴的AI助手，专门为情侣提供日常问候、天气建议和甜蜜互动。回答要简洁温暖，每次回复不超过100字。',
}

// provider 可选值:
//   'deepseek' - DeepSeek API (https://platform.deepseek.com), 免费额度500万tokens/月
//   'nvidia'  - NVIDIA NIM API (https://build.nvidia.com), 免费额度40次/分钟
//
// nvidia 模型可选值:
//   'z-ai/glm-4-9b-chat'     - GLM-4 9B, 中文能力强, 推荐
//   'z-ai/glm-4.7'          - GLM-4.7 358B MoE, 最新版, 推理/编码强
//   'moonshotai/kimi-k2-instruct' - Kimi K2, 长上下文
//   'deepseek-ai/deepseek-v3.2'     - DeepSeek V3.2 via NIM
//
// 获取 NVIDIA API Key 步骤:
//   1. 访问 https://build.nvidia.com
//   2. 点击右上角 Login，使用邮箱/QQ/微信登录
//   3. 验证邮箱后，点击 API Keys → Generate API Key
//   4. 复制以 nvapi- 开头的 Key 到下方 apiKey

module.exports = { robotKey, start, weather, daily, end, atAll, classTable, sentence, memorial, aiConfig }
