#!/bin/bash
echo "🛑 停止电商AI Agents生产环境..."
systemctl stop ecommerce-ai-agents
if systemctl is-active --quiet ecommerce-ai-agents; then
    echo "❌ 服务停止失败"
else
    echo "✅ 服务已停止"
fi