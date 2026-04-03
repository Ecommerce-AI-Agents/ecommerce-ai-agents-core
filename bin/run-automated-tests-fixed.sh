#!/bin/bash

# 电商AI Agents自动化测试脚本（修复版）

echo "=========================================="
echo "🧪 电商AI Agents自动化测试开始（修复版）"
echo "=========================================="

BASE_URL="http://119.45.238.161"
LOG_FILE="/opt/ecommerce-ai-agents/logs/test-fixed-$(date +%Y%m%d_%H%M%S).log"
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
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $(echo "$1" | sed 's/\\033\[[0-9;]*m//g')" >> "$LOG_FILE"
}

# 测试函数（修复版）
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_success="${3:-true}"  # true/false 表示期望成功或失败
    
    log "测试: $test_name"
    log "命令: $test_command"
    
    # 执行测试
    local response
    response=$(eval "$test_command" 2>&1)
    local exit_code=$?
    
    # 检查响应内容（不再严格检查HTTP状态码）
    local success_check=""
    
    if [ $exit_code -eq 0 ]; then
        # 检查响应是否包含预期内容
        if echo "$response" | grep -q "电商AI Agents" || 
           echo "$response" | grep -q '"success":true' || 
           echo "$response" | grep -q '"status":"healthy"'; then
            success_check="✅ 响应内容正确"
            if [ "$expected_success" = "true" ]; then
                log "${GREEN}✅ 通过: $test_name${NC}"
                log "$success_check"
                PASS_COUNT=$((PASS_COUNT + 1))
                return 0
            else
                log "${RED}❌ 失败: $test_name (期望失败但成功)${NC}"
                FAIL_COUNT=$((FAIL_COUNT + 1))
                return 1
            fi
        else
            success_check="⚠️  响应内容不符合预期"
            if [ "$expected_success" = "false" ]; then
                log "${GREEN}✅ 通过: $test_name (期望失败且失败)${NC}"
                PASS_COUNT=$((PASS_COUNT + 1))
                return 0
            else
                log "${RED}❌ 失败: $test_name${NC}"
                log "$success_check"
                log "响应内容:"
                echo "$response" | head -5
                FAIL_COUNT=$((FAIL_COUNT + 1))
                return 1
            fi
        fi
    else
        log "${RED}❌ 失败: $test_name (命令执行失败)${NC}"
        log "退出码: $exit_code"
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
run_test "管理后台HTML访问" "curl -s '$BASE_URL/admin' | head -3"

echo ""
echo "=== 第二阶段: 用户认证测试 ==="
run_test "管理员登录" "curl -s -X POST '$BASE_URL/api/auth/login' -H 'Content-Type: application/json' -d '{\"email\":\"admin@ecommerce-ai-agents.org\",\"password\":\"Admin123!\"}'"
run_test "测试管理员登录" "curl -s -X POST '$BASE_URL/api/auth/login' -H 'Content-Type: application/json' -d '{\"email\":\"test.admin@ecommerce-ai-agents.org\",\"password\":\"TestAdmin123!\"}'"
run_test "错误密码测试（期望失败）" "curl -s -X POST '$BASE_URL/api/auth/login' -H 'Content-Type: application/json' -d '{\"email\":\"admin@ecommerce-ai-agents.org\",\"password\":\"WrongPassword\"}'" "false"

echo ""
echo "=== 第三阶段: 产品管理测试 ==="
run_test "获取产品列表" "curl -s '$BASE_URL/api/products'"
run_test "产品数量检查" "curl -s '$BASE_URL/api/products' | python3 -c 'import sys,json; data=json.load(sys.stdin); print(\"产品数量:\", len(data[\"data\"])) if data[\"success\"] else exit(1)'"

echo ""
echo "=== 第四阶段: AI对话测试 ==="
run_test "AI基础对话" "curl -s -X POST '$BASE_URL/api/ai/chat' -H 'Content-Type: application/json' -d '{\"message\":\"你好\"}'"
run_test "产品咨询" "curl -s -X POST '$BASE_URL/api/ai/chat' -H 'Content-Type: application/json' -d '{\"message\":\"有什么智能手表推荐\"}'"

echo ""
echo "=== 第五阶段: 综合功能测试 ==="
run_test "系统端点检查" "curl -s '$BASE_URL/health' | python3 -c 'import sys,json; data=json.load(sys.stdin); print(\"系统端点:\", \", \".join(data.get(\"endpoints\", [])[:3]))'"
run_test "API响应时间测试" "time curl -s -o /dev/null -w '响应时间: %{time_total}s\\n' '$BASE_URL/health'"

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