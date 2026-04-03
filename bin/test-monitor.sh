#!/bin/bash

# 电商AI Agents测试监控脚本
# 监控测试期间的系统状态

echo "=========================================="
echo "📊 电商AI Agents测试监控开始"
echo "=========================================="

BASE_URL="http://119.45.238.161"
MONITOR_LOG="/opt/ecommerce-ai-agents/logs/monitor-$(date +%Y%m%d_%H%M%S).log"
CHECK_INTERVAL=60  # 检查间隔(秒)
TOTAL_CHECKS=30    # 总检查次数

# 创建日志目录
mkdir -p /opt/ecommerce-ai-agents/logs

# 监控函数
monitor_check() {
    local check_num=$1
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    echo ""
    echo "=== 监控检查 #${check_num} (${timestamp}) ==="
    
    # 1. 检查系统健康
    echo "🔍 检查系统健康..."
    local health_response
    health_response=$(curl -s -w " HTTP_STATUS:%{http_code}" "$BASE_URL/health" 2>/dev/null || echo "CONNECTION_FAILED")
    
    if [[ "$health_response" == *"HTTP_STATUS:200"* ]]; then
        local status=$(echo "$health_response" | sed 's/ HTTP_STATUS:200//' | python3 -c "import sys,json; data=json.load(sys.stdin); print(data.get('status', 'unknown'))" 2>/dev/null || echo "parse_error")
        echo "✅ 健康检查: $status"
    else
        echo "❌ 健康检查失败"
    fi
    
    # 2. 检查API响应
    echo "🔍 检查API响应..."
    local api_start=$(date +%s%N)
    curl -s -o /dev/null "$BASE_URL/api/products"
    local api_end=$(date +%s%N)
    local api_time=$(( (api_end - api_start) / 1000000 ))
    echo "⏱️  API响应时间: ${api_time}ms"
    
    # 3. 检查服务状态
    echo "🔍 检查服务状态..."
    if systemctl is-active --quiet ecommerce-ai-agents; then
        local pid=$(systemctl show ecommerce-ai-agents --property=MainPID --value)
        local memory=$(ps -o rss= -p $pid 2>/dev/null | awk '{printf "%.1f", $1/1024}' || echo "N/A")
        echo "✅ 服务运行中 (PID: $pid, 内存: ${memory}MB)"
    else
        echo "❌ 服务未运行"
    fi
    
    # 4. 检查系统资源
    echo "🔍 检查系统资源..."
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    local mem_total=$(free -m | awk '/^Mem:/{print $2}')
    local mem_used=$(free -m | awk '/^Mem:/{print $3}')
    local mem_percent=$((mem_used * 100 / mem_total))
    
    echo "🖥️  CPU使用率: ${cpu_usage}%"
    echo "💾 内存使用: ${mem_used}MB/${mem_total}MB (${mem_percent}%)"
    
    # 5. 检查nginx状态
    echo "🔍 检查nginx状态..."
    if systemctl is-active --quiet nginx; then
        echo "✅ nginx运行正常"
    else
        echo "❌ nginx未运行"
    fi
    
    # 记录到日志
    {
        echo "[${timestamp}] 监控检查 #${check_num}"
        echo "  健康状态: ${status:-unknown}"
        echo "  API响应: ${api_time}ms"
        echo "  服务状态: $(systemctl is-active ecommerce-ai-agents 2>/dev/null || echo 'inactive')"
        echo "  CPU使用: ${cpu_usage}%"
        echo "  内存使用: ${mem_percent}%"
        echo "  nginx状态: $(systemctl is-active nginx 2>/dev/null || echo 'inactive')"
        echo ""
    } >> "$MONITOR_LOG"
    
    # 检查是否有异常
    if [[ "$status" != "healthy" ]] || [ $api_time -gt 1000 ] || [ $mem_percent -gt 90 ]; then
        echo "⚠️  检测到潜在问题，请关注！"
    fi
}

# 显示监控信息
echo "监控配置:"
echo "  监控地址: $BASE_URL"
echo "  检查间隔: ${CHECK_INTERVAL}秒"
echo "  总检查次数: ${TOTAL_CHECKS}"
echo "  日志文件: $MONITOR_LOG"
echo ""
echo "按 Ctrl+C 停止监控"
echo "=========================================="

# 开始监控
for ((i=1; i<=TOTAL_CHECKS; i++)); do
    monitor_check $i
    
    # 如果不是最后一次检查，则等待
    if [ $i -lt $TOTAL_CHECKS ]; then
        echo ""
        echo "⏳ 等待 ${CHECK_INTERVAL} 秒后进行下一次检查..."
        echo "=========================================="
        sleep $CHECK_INTERVAL
    fi
done

# 监控总结
echo ""
echo "=========================================="
echo "📈 监控总结"
echo "=========================================="

# 分析监控日志
if [ -f "$MONITOR_LOG" ]; then
    echo "监控日志分析:"
    echo "  日志文件: $MONITOR_LOG"
    echo "  总检查次数: $TOTAL_CHECKS"
    
    # 统计健康状态
    local healthy_count=$(grep -c "健康状态: healthy" "$MONITOR_LOG" || echo 0)
    local healthy_rate=$((healthy_count * 100 / TOTAL_CHECKS))
    echo "  健康检查通过率: ${healthy_rate}% (${healthy_count}/${TOTAL_CHECKS})"
    
    # 检查是否有错误
    local error_count=$(grep -c "❌" "$MONITOR_LOG" || echo 0)
    if [ $error_count -gt 0 ]; then
        echo "  ⚠️  发现 ${error_count} 个错误，请查看日志详情"
    else
        echo "  ✅ 监控期间未发现错误"
    fi
    
    echo ""
    echo "监控期间的关键指标:"
    echo "  查看详细日志: tail -f $MONITOR_LOG"
    echo "  查看实时状态: ./status.sh"
    echo "  运行自动化测试: ./run-automated-tests.sh"
else
    echo "❌ 监控日志文件未生成"
fi

echo ""
echo "=========================================="
echo "📊 测试监控完成"
echo "=========================================="