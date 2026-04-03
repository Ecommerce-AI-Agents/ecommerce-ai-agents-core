#!/bin/bash
echo "🚀 启动电商AI Agents生产环境..."
systemctl start ecommerce-ai-agents
sleep 2
if systemctl is-active --quiet ecommerce-ai-agents; then
    echo "✅ 服务启动成功"
    echo "📊 服务状态: $(systemctl is-active ecommerce-ai-agents)"
    echo "📝 查看日志: journalctl -u ecommerce-ai-agents -f"
    echo "🌐 访问地址: http://localhost:3000/health"
else
    echo "❌ 服务启动失败"
    journalctl -u ecommerce-ai-agents --no-pager -l | tail -20
fi