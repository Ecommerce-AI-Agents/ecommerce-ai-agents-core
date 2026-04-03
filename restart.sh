#!/bin/bash
echo "🔄 重启电商AI Agents生产环境..."
systemctl restart ecommerce-ai-agents
sleep 2
if systemctl is-active --quiet ecommerce-ai-agents; then
    echo "✅ 服务重启成功"
else
    echo "❌ 服务重启失败"
fi