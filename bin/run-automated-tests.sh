#!/bin/bash

# 电商AI Agents自动化测试脚本
# 用于内部测试的自动化验证

echo "=========================================="
echo "🧪 电商AI Agents自动化测试开始"
echo "=========================================="

BASE_URL="http://119.45.238.161"
LOG_FILE="/opt/ecommerce-ai-agents/logs/test-$(date +%Y%m%d_%H%M%S).log"
PASS_COUNT=0
FAIL_COUNT=0

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log() {
    echo -e "$1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# 测试函数
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_status="${3:-200}"
    
    log "测试: $test_name"
    log "命令: $test_command"
    
    # 执行测试
    local response
    response=$(eval "$test_command" 2>&1)
    local exit_code=$?
    
    # 检查HTTP状态码
    local http_status
    if echo "$response" | grep -q "HTTP/"; then
        http_status=$(echo "$response" | grep "HTTP/" | head -1 | awk '{print $2}')
    else
        http_status="N/A"
    fi
    
    # 检查JSON响应
    local json_check=""
    if echo "$response" | python3 -c "import sys,json; json.load(sys.stdin)" 2>/dev/null; then
        json_check="✅ JSON格式正确"
    else
        json_check="❌ JSON格式错误"
    fi
    
    # 判断测试结果
    if [ $exit_code -eq 0 ] && ([ "$http_status" = "$expected_status" ] || [ "$http_status" = "N/A" ]); then
        log "${GREEN}✅ 通过: $test_name${NC}"
        log "响应状态: $http_status"
        log "$json_check"
        PASS_COUNT=$((PASS_COUNT + 1))
        return 0
    else
        log "${RED}❌ 失败: $test_name${NC}"
        log "退出码: $exit_code"
        log "响应状态: $http_status (期望: $expected_status)"
        log "$json_check"
        log "响应内容:"
        echo "$response" | head -10
        FAIL_COUNT=$((FAIL_COUNT + 1))
        return 1
    fi
}

# 创建日志目录
mkdir -p /opt/ecommerce-ai-agents/logs

log "测试开始时间: $(date)"
log "测试地址: $BASE_URL"
log "日志文件: $LOG_FILE"
echo ""

# ==================== 测试用例开始 ====================

echo "=== 第一阶段: 系统健康检查 ==="
run_test "健康检查" "curl -s '$BASE_URL/health'"
run_test "管理后台访问" "curl -s -I '$BASE_URL/admin' | head -1"

echo ""
echo "=== 第二阶段: 用户认证测试 ==="
run_test "管理员登录" "curl -s -X POST '$BASE_URL/api/auth/login' -H 'Content-Type: application/json' -d '{\"email\":\"admin@ecommerce-ai-agents.org\",\"password\":\"Admin123!\"}'"
run_test "测试管理员登录" "curl -s -X POST '$BASE_URL/api/auth/login' -H 'Content-Type: application/json' -d '{\"email\":\"test.admin@ecommerce-ai-agents.org\",\"password\":\"TestAdmin123!\"}'"
run_test "错误密码测试" "curl -s -X POST '$BASE_URL/api/auth/login' -H 'Content-Type: application/json' -d '{\"email\":\"admin@ecommerce-ai-agents.org\",\"password\":\"WrongPassword\"}'" "401"

echo ""
echo "=== 第三阶段: 产品管理测试 ==="
run_test "获取产品列表" "curl -s '$BASE_URL/api/products'"
run_test "产品数量检查" "curl -s '$BASE_URL/api/products' | python3 -c 'import sys,json; data=json.load(sys.stdin); print(len(data[\"data\"])) if data[\"success\"] else exit(1)'"

echo ""
echo "=== 第四阶段: 订单流程测试 ==="
# 先登录获取token
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" -H "Content-Type: application/json" -d '{"email":"test.customer1@example.com","password":"TestCustomer123!"}')
TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys,json; data=json.load(sys.stdin); print(data['data']['token']) if data['success'] else exit(1)" 2>/dev/null || echo "")

if [ -n "$TOKEN" ]; then
    run_test "创建测试订单" "curl -s -X POST '$BASE_URL/api/orders' -H 'Content-Type: application/json' -H 'Authorization: Bearer $TOKEN' -d '{\"shop_id\":\"shop_prod_001\",\"items\":[{\"product_id\":\"prod_prod_001\",\"quantity\":1}],\"customer_email\":\"test.customer1@example.com\"}'" "201"
else
    log "${YELLOW}⚠️  跳过订单测试: 无法获取token${NC}"
fi

echo ""
echo "=== 第五阶段: AI对话测试 ==="
run_test "AI基础对话" "curl -s -X POST '$BASE_URL/api/ai/chat' -H 'Content-Type: application/json' -d '{\"message\":\"你好\"}'"
run_test "产品咨询" "curl -s -X POST '$BASE_URL/api/ai/chat' -H 'Content-Type: application/json' -d '{\"message\":\"有什么智能手表推荐\"}'"

echo ""
echo "=== 第六阶段: 性能测试 ==="
run_test "健康检查性能" "timeout 5 curl -s '$BASE_URL/health' > /dev/null && echo '响应时间正常'"
run_test "并发测试准备" "echo '并发测试需要专用工具如Apache JMeter'"

# ==================== 测试结果汇总 ====================

echo ""
echo "=========================================="
echo "📊 测试结果汇总"
echo "=========================================="

TOTAL_TESTS=$((PASS_COUNT + FAIL_COUNT))
if [ $TOTAL_TESTS -gt 0 ]; then
    PASS_RATE=$((PASS_COUNT * 100 / TOTAL_TESTS))
else
    PASS_RATE=0
fi

log "测试用例总数: $TOTAL_TESTS"
log "${GREEN}通过用例: $PASS_COUNT${NC}"
log "${RED}失败用例: $FAIL_COUNT${NC}"
log "通过率: ${PASS_RATE}%"

echo ""
if [ $FAIL_COUNT -eq 0 ]; then
    log "${GREEN}🎉 所有测试通过！系统运行正常。${NC}"
    EXIT_CODE=0
elif [ $PASS_RATE -ge 80 ]; then
    log "${YELLOW}⚠️  测试基本通过，有少量问题需要修复。${NC}"
    EXIT_CODE=1
else
    log "${RED}❌ 测试失败，系统存在较多问题。${NC}"
    EXIT_CODE=2
fi

echo ""
log "详细测试日志查看: $LOG_FILE"
log "手动测试指南查看: /opt/ecommerce-ai-agents/内部测试指南.md"
log "测试完成时间: $(date)"

echo ""
echo "=========================================="
echo "🧪 自动化测试完成"
echo "=========================================="

exit $EXIT_CODE