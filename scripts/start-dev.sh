#!/bin/bash

# 启动开发环境脚本

echo "🚀 启动 AIToughTalk-Pro 开发环境..."

# 检查 Docker 和 Docker Compose 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 复制背景图片
if [ -f "code/static/background.jpg" ]; then
    echo "📸 复制背景图片..."
    cp code/static/background.jpg frontend/public/background.jpg
fi

# 启动服务
echo "🐳 启动 Docker 容器..."
docker-compose -f docker-compose.dev.yml up --build

echo "✅ 开发环境启动完成！"
echo "🌐 前端访问地址: http://localhost:3000"
echo "🔧 后端API地址: http://localhost:9200" 