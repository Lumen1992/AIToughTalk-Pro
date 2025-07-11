# AIToughTalk-Pro 架构文档

## 重构概述

本项目已成功从单体应用重构为前后端分离的现代化架构：

### 重构前（原架构）
- **单体应用**: FastAPI + 静态HTML/JS文件
- **前端**: 纯HTML + Vanilla JavaScript
- **部署**: 单一服务器，静态文件由FastAPI服务

### 重构后（新架构）
- **前后端分离**: Next.js前端 + FastAPI后端
- **前端**: Next.js 14 + TypeScript + React Hooks
- **后端**: FastAPI纯API服务（移除静态文件服务）
- **部署**: 可独立部署和扩展

## 架构组件

### 前端 (frontend/)
```
frontend/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx       # 根布局
│   │   ├── page.tsx         # 主页面
│   │   └── globals.css      # 全局样式
│   ├── components/          # React组件
│   │   ├── VoiceChat.tsx    # 主聊天组件
│   │   ├── ChatHeader.tsx   # 聊天头部
│   │   ├── MessageList.tsx  # 消息列表
│   │   └── ControlBar.tsx   # 控制栏
│   ├── hooks/               # 自定义Hooks
│   │   ├── useWebSocket.ts  # WebSocket连接
│   │   ├── useAudioCapture.ts # 音频捕获
│   │   └── useAudioPlayback.ts # 音频播放
│   └── types/               # TypeScript类型
│       └── index.ts         # 通用类型定义
├── public/                  # 静态资源
│   ├── pcmWorkletProcessor.js    # PCM音频处理器
│   ├── ttsPlaybackProcessor.js   # TTS播放处理器
│   └── background.jpg            # 背景图片
├── package.json
├── next.config.js           # Next.js配置
└── tsconfig.json           # TypeScript配置
```

### 后端 (backend/)
```
backend/
├── server.py               # FastAPI主服务（重构后）
├── requirements.txt        # Python依赖
├── audio_in.py            # 音频输入处理
├── audio_module.py        # 音频模块
├── llm_module.py          # LLM对话模块
├── speech_pipeline_manager.py # 语音管道管理
├── transcribe.py          # 语音转录
├── turndetect.py          # 语音检测
├── text_context.py        # 文本上下文
├── text_similarity.py     # 文本相似度
├── upsample_overlap.py    # 音频上采样
├── colors.py              # 日志颜色
├── logsetup.py            # 日志设置
├── system_prompt.txt      # AI系统提示
└── reference_audio.json   # 参考音频数据
```

## 核心功能模块

### 1. WebSocket通信
- **前端**: `useWebSocket` Hook管理连接状态
- **后端**: FastAPI WebSocket端点处理实时通信
- **消息格式**: JSON文本消息 + 二进制音频数据

### 2. 音频处理
#### 前端音频捕获 (`useAudioCapture`)
- 使用Web Audio API获取麦克风输入
- Audio Worklet进行实时PCM处理
- 批量发送音频数据到后端

#### 前端音频播放 (`useAudioPlayback`)
- 接收后端TTS音频块
- Audio Worklet进行实时播放
- 支持动态音频队列管理

#### 后端音频处理
- 实时语音转文本 (realtimestt)
- 文本转语音合成 (realtimetts)
- 多引擎TTS支持 (Orpheus, Kokoro, Coqui)

### 3. 对话管理
- **LLM集成**: 支持OpenAI、Ollama等多种提供商
- **流式响应**: 实时文本生成和音频合成
- **会话状态**: 前后端同步的对话历史

## 数据流

### 用户说话流程
```
用户麦克风 → Web Audio API → PCM Worklet → WebSocket二进制消息 
→ 后端音频队列 → 语音识别 → LLM处理 → TTS合成 
→ Base64音频块 → WebSocket文本消息 → 前端音频播放
```

### 消息类型
- `partial_user_request`: 用户实时语音转录
- `final_user_request`: 用户最终语音文本
- `partial_assistant_answer`: AI实时文本响应
- `final_assistant_answer`: AI最终完整响应
- `tts_chunk`: TTS音频数据块
- `tts_interruption`: TTS中断信号

## 部署方案

### 开发环境
1. **Docker Compose**: `docker-compose.dev.yml`
   - 前端容器 (localhost:3000)
   - 后端容器 (localhost:9200)
   - 开发热重载支持

2. **本地开发**: `scripts/start-local.sh`
   - 直接运行Node.js和Python
   - 便于调试和开发

### 生产环境
1. **容器化部署**
   - 前端: Static build + Nginx
   - 后端: FastAPI + Gunicorn
   - 负载均衡和反向代理

2. **云平台部署**
   - 前端: Vercel/Netlify
   - 后端: Docker容器服务
   - 数据库: Redis/PostgreSQL (可选)

## 配置管理

### 前端配置
- **环境变量**: `.env.local`
- **API地址**: 通过环境变量配置
- **构建配置**: `next.config.js`

### 后端配置
- **环境变量**: `.env`
- **模型配置**: TTS和LLM引擎选择
- **性能调优**: 音频队列大小、采样率等

## 扩展性考虑

### 水平扩展
- **前端**: CDN分发，多地部署
- **后端**: 多实例负载均衡
- **状态管理**: Redis会话存储

### 功能扩展
- **多语言支持**: i18n国际化
- **用户认证**: JWT token认证
- **聊天室**: 多用户实时对话
- **文件上传**: 语音文件批量处理

## 性能优化

### 前端优化
- **代码分割**: Next.js自动代码分割
- **组件优化**: React.memo减少重渲染
- **音频优化**: Web Worker处理音频

### 后端优化
- **异步处理**: FastAPI原生异步支持
- **连接池**: 数据库和HTTP连接复用
- **缓存策略**: Redis缓存热点数据

### 网络优化
- **WebSocket**: 保持长连接减少握手开销
- **数据压缩**: 音频数据压缩传输
- **CDN**: 静态资源CDN加速

## 安全考虑

### API安全
- **CORS配置**: 限制跨域访问
- **速率限制**: API调用频率控制
- **输入验证**: 防止注入攻击

### 数据安全
- **HTTPS**: 强制SSL/TLS加密
- **敏感数据**: API密钥安全存储
- **用户隐私**: 音频数据不持久化存储

## 监控和日志

### 应用监控
- **健康检查**: `/health` 端点
- **性能指标**: 响应时间、错误率
- **资源使用**: CPU、内存、网络

### 日志管理
- **结构化日志**: JSON格式日志
- **日志级别**: 开发和生产环境区分
- **日志收集**: 集中式日志管理

这个重构保持了所有原有功能，同时提供了更好的开发体验、更强的扩展性和更现代的技术栈。 