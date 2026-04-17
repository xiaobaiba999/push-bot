# Tasks

- [x] Task 1: 移除每日情话模块
  - [x] SubTask 1.1: 删除 `functions/loveSentence.js` 和 `push/functions/loveSentence.js`
  - [x] SubTask 1.2: 从 `input.js` 中移除 `loveSentence` 配置项和导出（两处）
  - [x] SubTask 1.3: 从 `index.js` 中移除 `loveSentence` 相关逻辑（解构、条件判断、内容拼接）（两处）
  - [x] SubTask 1.4: 验证移除后推送功能正常，彩虹屁模块不受影响

- [x] Task 2: 修复纪念网站微信访问问题
  - [x] SubTask 2.1: 将推送中的纪念网站链接改为markdown格式消息类型，使用文本引导+可复制URL方式展示
  - [x] SubTask 2.2: 修改 `robotPush.js` 支持markdown消息类型发送
  - [x] SubTask 2.3: 在 `input.js` 中新增 `memorial` 的展示格式配置
  - [x] SubTask 2.4: 验证链接在微信环境中可正常复制和访问

- [x] Task 3: 天气模块增加紫外线指数
  - [x] SubTask 3.1: 修改 `functions/weather.js`，新增调用和风天气indices API获取紫外线数据
  - [x] SubTask 3.2: 实现紫外线等级映射和防护建议文本生成逻辑
  - [x] SubTask 3.3: 将紫外线信息整合到天气推送内容中，保持格式统一
  - [x] SubTask 3.4: 添加紫外线API请求失败的降级处理
  - [x] SubTask 3.5: 验证天气推送包含正确的紫外线信息和防护建议

- [x] Task 4: 新增AI对话模式 - 基础架构
  - [x] SubTask 4.1: 创建 `functions/aiChat.js`，实现DeepSeek API调用封装
  - [x] SubTask 4.2: 在 `input.js` 中新增AI模块配置项（API Key、模型选择、系统提示词等）
  - [x] SubTask 4.3: 实现对话上下文管理（内存缓存最近5轮对话）
  - [x] SubTask 4.4: 实现对话历史持久化存储（当前使用内存缓存，OSS需额外配置）
  - [x] SubTask 4.5: 添加3秒超时控制和降级回复逻辑

- [x] Task 5: 新增AI对话模式 - 回调处理
  - [x] SubTask 5.1: 创建 `functions/callbackHandler.js`，实现企业微信回调URL验证
  - [x] SubTask 5.2: 实现消息回调解析（提取用户@机器人的文本内容）
  - [x] SubTask 5.3: 整合aiChat模块，实现"收到消息→AI处理→推送回复"完整链路
  - [x] SubTask 5.4: 实现特殊指令处理（"历史记录"查看对话历史）
  - [x] SubTask 5.5: 修改 `index.js` 导出回调处理函数，支持HTTP触发器调用

- [x] Task 6: 同步更新 push/push/ 部署目录
  - [x] SubTask 6.1: 同步所有修改到 `push/push/` 子目录
  - [x] SubTask 6.2: 更新 `package.json` 添加新依赖
  - [x] SubTask 6.3: 验证部署目录功能完整性

- [x] Task 7: 端到端测试验证
  - [x] SubTask 7.1: 测试定时推送功能（所有模块正常工作，无loveSentence残留）
  - [x] SubTask 7.2: 测试天气推送包含紫外线指数
  - [x] SubTask 7.3: 测试纪念网站链接展示格式
  - [x] SubTask 7.4: 测试AI对话回调处理链路
  - [x] SubTask 7.5: 测试AI多轮对话上下文保持
  - [x] SubTask 7.6: 测试各模块降级容错（API超时/失败场景）

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] independent
- [Task 4] independent
- [Task 5] depends on [Task 4]
- [Task 6] depends on [Task 1, 2, 3, 4, 5]
- [Task 7] depends on [Task 6]
