#!/bin/bash

# 本地开发启动脚本（不使用Docker）

echo "🚀 启动 AIToughTalk-Pro 本地开发环境..."

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查Python
if ! command -v python &> /dev/null; then
    echo "❌ Python 未安装，请先安装 Python"
    exit 1
fi

# 复制背景图片
if [ -f "code/static/background.jpg" ]; then
    echo "📸 复制背景图片..."
    cp code/static/background.jpg frontend/public/background.jpg
fi

# 安装前端依赖
echo "📦 安装前端依赖..."
cd frontend
npm install
cd ..

# 安装后端依赖
echo "🐍 安装后端依赖..."
pip install -r backend/requirements.txt

# 启动后端
echo "🔧 启动后端服务..."
cd backend
export PYTHONPATH="../code:../backend"
python server.py &
BACKEND_PID=$!
cd ..

# 等待后端启动
sleep 5

# 启动前端
echo "🌐 启动前端服务..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ 本地开发环境启动完成！"
echo "🌐 前端访问地址: http://localhost:3000"
echo "🔧 后端API地址: http://localhost:9200"
echo ""
echo "按 Ctrl+C 停止服务"

# 等待用户中断
wait $BACKEND_PID $FRONTEND_PID 