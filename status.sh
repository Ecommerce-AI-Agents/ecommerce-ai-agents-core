#!/bin/bash
echo "📊 电商AI Agents生产环境状态"
echo "================================"
echo "服务状态: $(systemctl is-active ecommerce-ai-agents 2>/dev/null || echo '未安装')"
if systemctl is-active --quiet ecommerce-ai-agents; then
    echo "进程ID: $(systemctl show ecommerce-ai-agents --property=MainPID --value)"
    echo "运行时间: $(systemctl show ecommerce-ai-agents --property=ActiveEnterTimestamp --value)"
    echo ""
    echo "🌐 API测试:"
    curl -s http://localhost:3000/health 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print('   状态:', data.get('status', '未知'))
    print('   版本:', data.get('version', '未知'))
except:
    print('   ❌ API无法访问')
"
fi