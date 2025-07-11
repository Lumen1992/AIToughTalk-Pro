# AIToughTalk-Pro 🤖💬

一个基于FastAPI和Next.js的前后端分离实时语音聊天应用，集成了语音识别、文本转语音和大型语言模型对话功能。

## 🌟 功能特性

- **实时语音识别**: 使用先进的语音转文本技术，支持实时音频流处理
- **智能对话**: 集成多种LLM提供商（OpenAI、Ollama等），支持个性化对话体验
- **高质量语音合成**: 支持多种TTS引擎（Orpheus、Kokoro、Coqui），提供自然流畅的语音输出
- **WebSocket实时通信**: 基于WebSocket的低延迟双向通信
- **前后端分离**: 现代化架构，前端使用Next.js，后端使用FastAPI
- **Docker容器化**: 完整的Docker支持，便于部署和管理
- **GPU加速**: 支持NVIDIA GPU加速，提升处理性能
- **个性化角色**: 可配置的AI角色设定，支持定制化对话风格

## 🏗️ 技术架构

### 前端 (Next.js)
- **Next.js 14**: 现代React框架，支持App Router
- **TypeScript**: 类型安全的JavaScript超集
- **自定义Hooks**: 音频捕获、WebSocket连接、音频播放等
- **Web Audio API**: 实时音频处理和播放
- **响应式设计**: 适配桌面和移动设备

### 后端 (FastAPI)
- **FastAPI**: 高性能异步Web框架
- **WebSocket**: 实时双向通信
- **realtimestt**: 实时语音转文本
- **realtimetts**: 实时文本转语音
- **Ollama/OpenAI**: LLM提供商支持

### 主要模块
- `frontend/`: Next.js前端应用
- `backend/`: FastAPI后端服务
- `code/`: 核心语音处理模块
  - `speech_pipeline_manager.py`: 语音处理管道管理
  - `llm_module.py`: LLM对话模块
  - `audio_module.py`: 音频处理模块
  - `transcribe.py`: 语音转录功能
  - `turndetect.py`: 语音活动检测

## 🚀 快速开始

### 环境要求
- Python 3.8+
- Node.js 18+
- Docker & Docker Compose (可选)
- NVIDIA GPU (推荐，用于加速)
- 至少8GB RAM

### 方式一：Docker部署（推荐）

1. **克隆项目**
```bash
git clone <repository-url>
cd AIToughTalk-Pro
```

2. **复制背景图片**
```bash
# 如果存在背景图片，将其复制到前端目录
cp code/static/background.jpg frontend/public/background.jpg
```

3. **启动开发环境**
```bash
./scripts/start-dev.sh
```

4. **访问应用**
- 前端: http://localhost:3000
- 后端API: http://localhost:9200

### 方式二：本地开发

1. **克隆项目**
```bash
git clone <repository-url>
cd AIToughTalk-Pro
```

2. **启动本地开发环境**
```bash
./scripts/start-local.sh
```

### 方式三：手动启动

1. **安装后端依赖**
```bash
cd backend
pip install -r requirements.txt
cd ..
```

2. **安装前端依赖**
```bash
cd frontend
npm install
cd ..
```

3. **启动后端服务**
```bash
cd backend
export PYTHONPATH="../code:../backend"
python server.py
```

4. **启动前端服务**（新终端窗口）
```bash
cd frontend
npm run dev
```

## ⚙️ 配置选项

### 后端环境变量
在`backend`目录下创建`.env`文件：
```bash
# LLM 配置
LLM_PROVIDER=openai  # 或 ollama
LLM_MODEL=gpt-3.5-turbo
OPENAI_API_KEY=your_api_key

# TTS 配置
TTS_ENGINE=coqui  # orpheus, kokoro, coqui
TTS_MODEL_PATH=/path/to/model

# 音频配置
MAX_AUDIO_QUEUE_SIZE=50
SAMPLE_RATE=24000

# 服务配置
HOST=0.0.0.0
PORT=9200
LOG_LEVEL=INFO
```

### 前端环境变量
在`frontend`目录下创建`.env.local`文件：
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:9200
NEXT_PUBLIC_WS_URL=ws://localhost:9200
```

### TTS引擎配置
- **Orpheus**: 高质量神经网络TTS，需要GPU
- **Kokoro**: 轻量级TTS引擎
- **Coqui**: 开源TTS解决方案

### LLM提供商配置
- **OpenAI**: 需要API密钥
- **Ollama**: 本地LLM服务，需要先启动Ollama

## 📖 使用方法

1. **打开应用**: 访问 http://localhost:3000
2. **点击"开始"**: 授权麦克风访问权限
3. **开始对话**: 直接说话，AI会实时响应
4. **控制功能**:
   - 调节语速滑块控制TTS播放速度
   - 重置按钮清除对话历史
   - 复制按钮复制对话内容
5. **停止对话**: 点击停止按钮结束会话

## 📁 项目结构

```
AIToughTalk-Pro/
├── frontend/                 # Next.js前端应用
│   ├── src/
│   │   ├── app/             # App Router页面
│   │   ├── components/      # React组件
│   │   ├── hooks/           # 自定义Hooks
│   │   └── types/           # TypeScript类型定义
│   ├── public/              # 静态资源
│   ├── package.json
│   └── next.config.js
├── backend/                  # FastAPI后端服务
│   ├── server.py            # 主服务器文件
│   └── requirements.txt     # Python依赖
├── code/                    # 核心语音处理模块
│   ├── speech_pipeline_manager.py
│   ├── llm_module.py
│   ├── audio_module.py
│   ├── transcribe.py
│   └── turndetect.py
├── scripts/                 # 启动脚本
│   ├── start-dev.sh         # Docker开发环境
│   └── start-local.sh       # 本地开发环境
├── docker-compose.dev.yml   # 开发环境Docker配置
├── Dockerfile.backend       # 后端Docker文件
├── Dockerfile.frontend      # 前端Docker文件
└── README.md
```

## 🔧 开发指南

### 添加新的TTS引擎
1. 在`code/`目录下创建新的TTS模块
2. 在`speech_pipeline_manager.py`中注册新引擎
3. 更新配置选项

### 添加新的LLM提供商
1. 在`llm_module.py`中添加新的提供商类
2. 实现统一的接口方法
3. 更新配置和文档

### 前端组件开发
1. 在`frontend/src/components/`下创建新组件
2. 使用TypeScript进行类型检查
3. 遵循React Hooks最佳实践

### API接口扩展
1. 在`backend/server.py`中添加新的端点
2. 更新CORS配置（如需要）
3. 添加相应的前端调用代码

## 🐛 故障排除

### 常见问题

**1. 麦克风权限被拒绝**
- 检查浏览器麦克风权限设置
- 使用HTTPS或localhost访问

**2. WebSocket连接失败**
- 确认后端服务正常运行
- 检查端口9200是否被占用
- 查看浏览器控制台错误信息

**3. TTS不工作**
- 检查TTS引擎配置
- 确认模型文件路径正确
- 查看后端日志信息

**4. LLM响应慢**
- 检查网络连接（OpenAI）
- 优化Ollama模型配置
- 考虑使用更快的模型

**5. Docker启动失败**
- 检查Docker和Docker Compose版本
- 确认端口未被占用
- 查看Docker日志: `docker-compose logs`

### 性能优化

**音频处理优化**
- 调整音频缓冲区大小
- 使用GPU加速（如可用）
- 优化采样率设置

**网络优化**
- 使用WebSocket保持连接
- 实现音频数据压缩
- 添加重连机制

**前端性能**
- 使用React.memo避免不必要渲染
- 优化Audio Worklet处理
- 实现虚拟滚动（长对话）

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📧 联系方式

如有问题或建议，请通过以下方式联系：
- 创建GitHub Issue
- 发送邮件至 [your-email@example.com]