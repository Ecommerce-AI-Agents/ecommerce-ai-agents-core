#!/bin/bash
echo "🚀 启动电商AI Agents登录页面服务器..."
cd /opt/ecommerce-ai-agents

# 检查是否已有进程在运行
if pgrep -f "server-login-simple.js" > /dev/null; then
    echo "⚠️  服务器已在运行，正在停止..."
    pkill -f "server-login-simple.js"
    sleep 2
fi

# 启动服务器
nohup node bin/server-login-simple.js > logs/server-login.log 2>&1 &
SERVER_PID=$!

sleep 3

# 检查是否启动成功
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ 服务器启动成功！PID: $SERVER_PID"
    echo "📡 访问地址: http://localhost:3000"
    echo "🌐 公网访问: http://119.45.238.161"
    echo "📝 日志文件: logs/server-login.log"
    
    # 测试服务器
    echo ""
    echo "🧪 测试服务器状态:"
    curl -s http://localhost:3000/health | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print('✅ 健康检查: ' + data['status'])
    print('✅ 版本: ' + data['version'])
    print('✅ 环境: ' + data['environment'])
except:
    print('❌ 服务器未响应')
"
else
    echo "❌ 服务器启动失败"
    echo "查看日志: tail -f logs/server-login.log"
fi
