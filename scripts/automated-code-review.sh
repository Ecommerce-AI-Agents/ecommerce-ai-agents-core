#!/bin/bash

# 电商AI Agents自动化代码审查脚本
# 版本: 1.0.0
# 日期: 2026-04-03

echo "🔍 电商AI Agents自动化代码审查"
echo "================================"
echo ""

# 检查参数
if [ $# -eq 0 ]; then
    echo "使用方法: $0 <代码目录> [选项]"
    echo "选项:"
    echo "  --security   只进行安全审查"
    echo "  --quality    只进行质量审查"
    echo "  --full       完整审查（默认）"
    echo "  --report     生成详细报告"
    exit 1
fi

CODE_DIR=$1
REPORT_MODE=false
REVIEW_MODE="full"

# 解析参数
for arg in "$@"; do
    case $arg in
        --security)
            REVIEW_MODE="security"
            ;;
        --quality)
            REVIEW_MODE="quality"
            ;;
        --full)
            REVIEW_MODE="full"
            ;;
        --report)
            REPORT_MODE=true
            ;;
    esac
done

# 创建报告目录
REPORT_DIR="/tmp/code-review-$(date +%Y%m%d_%H%M%S)"
mkdir -p $REPORT_DIR

echo "📁 审查目录: $CODE_DIR"
echo "🎯 审查模式: $REVIEW_MODE"
echo "📊 报告模式: $REPORT_MODE"
echo "📂 报告目录: $REPORT_DIR"
echo ""

# 函数：记录审查结果
log_review() {
    local level=$1
    local category=$2
    local message=$3
    local file=$4
    local line=$5
    
    case $level in
        "CRITICAL")
            echo "❌ [CRITICAL] $category: $message"
            echo "   📄 $file:$line"
            ;;
        "HIGH")
            echo "⚠️  [HIGH] $category: $message"
            echo "   📄 $file:$line"
            ;;
        "MEDIUM")
            echo "🔶 [MEDIUM] $category: $message"
            echo "   📄 $file:$line"
            ;;
        "LOW")
            echo "🔸 [LOW] $category: $message"
            echo "   📄 $file:$line"
            ;;
        "INFO")
            echo "ℹ️  [INFO] $category: $message"
            ;;
        "SUCCESS")
            echo "✅ [SUCCESS] $category: $message"
            ;;
    esac
    
    # 记录到报告文件
    if [ "$REPORT_MODE" = true ]; then
        echo "$(date '+%Y-%m-%d %H:%M:%S')|$level|$category|$message|$file|$line" >> "$REPORT_DIR/review.log"
    fi
}

# 函数：安全审查
security_review() {
    echo "🔒 开始安全审查..."
    echo "-------------------"
    
    # 检查硬编码密码
    log_review "INFO" "SECURITY" "检查硬编码密码..."
    grep -r -n "password.*=.*['\"].*['\"]" "$CODE_DIR" --include="*.js" --include="*.ts" --include="*.json" 2>/dev/null | while read line; do
        file=$(echo $line | cut -d: -f1)
        line_num=$(echo $line | cut -d: -f2)
        log_review "CRITICAL" "SECURITY" "发现硬编码密码" "$file" "$line_num"
    done
    
    # 检查SQL注入风险
    log_review "INFO" "SECURITY" "检查SQL注入风险..."
    grep -r -n -i "query.*['\"].*\\$" "$CODE_DIR" --include="*.js" --include="*.ts" 2>/dev/null | while read line; do
        file=$(echo $line | cut -d: -f1)
        line_num=$(echo $line | cut -d: -f2)
        log_review "HIGH" "SECURITY" "可能的SQL注入风险" "$file" "$line_num"
    done
    
    # 检查XSS风险
    log_review "INFO" "SECURITY" "检查XSS风险..."
    grep -r -n -i "innerHTML\|\.html(" "$CODE_DIR" --include="*.js" --include="*.ts" --include="*.html" 2>/dev/null | while read line; do
        file=$(echo $line | cut -d: -f1)
        line_num=$(echo $line | cut -d: -f2)
        log_review "MEDIUM" "SECURITY" "可能的XSS风险" "$file" "$line_num"
    done
    
    # 检查依赖安全
    log_review "INFO" "SECURITY" "检查依赖安全..."
    if [ -f "$CODE_DIR/package.json" ]; then
        if command -v npm &> /dev/null; then
            cd "$CODE_DIR" && npm audit --json 2>/dev/null | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    if 'metadata' in data and 'vulnerabilities' in data['metadata']:
        vulns = data['metadata']['vulnerabilities']
        for level in ['critical', 'high', 'moderate', 'low']:
            count = vulns.get(level, 0)
            if count > 0:
                print(f'🔸 [LOW] SECURITY: 发现 {count} 个{level}级别依赖漏洞')
except:
    pass
"
        fi
    fi
    
    log_review "SUCCESS" "SECURITY" "安全审查完成"
}

# 函数：代码质量审查
quality_review() {
    echo "📝 开始代码质量审查..."
    echo "----------------------"
    
    # 检查文件大小
    log_review "INFO" "QUALITY" "检查文件大小..."
    find "$CODE_DIR" -name "*.js" -o -name "*.ts" 2>/dev/null | while read file; do
        lines=$(wc -l < "$file" 2>/dev/null || echo 0)
        if [ $lines -gt 500 ]; then
            log_review "MEDIUM" "QUALITY" "文件过大（$lines 行），建议拆分" "$file" "1"
        fi
    done
    
    # 检查函数长度
    log_review "INFO" "QUALITY" "检查函数长度..."
    find "$CODE_DIR" -name "*.js" -o -name "*.ts" 2>/dev/null | while read file; do
        # 简单检查函数行数
        awk '
        /function.*\(/ || /const.*=.*\(.*\).*=>/ || /let.*=.*\(.*\).*=>/ || /var.*=.*\(.*\).*=>/ {
            in_function=1
            function_start=NR
            function_name=$0
        }
        in_function && /^}/ {
            function_length=NR-function_start+1
            if (function_length > 50) {
                print "🔶 [MEDIUM] QUALITY: 函数过长（" function_length "行）" FILENAME ":" function_start
            }
            in_function=0
        }
        ' "$file" 2>/dev/null
    done
    
    # 检查注释比例
    log_review "INFO" "QUALITY" "检查注释比例..."
    find "$CODE_DIR" -name "*.js" -o -name "*.ts" 2>/dev/null | while read file; do
        total_lines=$(wc -l < "$file" 2>/dev/null || echo 0)
        comment_lines=$(grep -c "^\s*//\|^\s*/\*\|^\s*\*" "$file" 2>/dev/null || echo 0)
        if [ $total_lines -gt 10 ]; then
            ratio=$((comment_lines * 100 / total_lines))
            if [ $ratio -lt 10 ]; then
                log_review "LOW" "QUALITY" "注释比例较低（$ratio%），建议增加注释" "$file" "1"
            fi
        fi
    done
    
    # 检查控制台输出
    log_review "INFO" "QUALITY" "检查控制台输出..."
    grep -r -n "console\.log\|console\.error\|console\.warn" "$CODE_DIR" --include="*.js" --include="*.ts" 2>/dev/null | while read line; do
        file=$(echo $line | cut -d: -f1)
        line_num=$(echo $line | cut -d: -f2)
        log_review "LOW" "QUALITY" "生产代码中可能有调试输出" "$file" "$line_num"
    done
    
    log_review "SUCCESS" "QUALITY" "代码质量审查完成"
}

# 函数：架构审查
architecture_review() {
    echo "🏗️  开始架构审查..."
    echo "------------------"
    
    # 检查循环依赖
    log_review "INFO" "ARCHITECTURE" "检查循环依赖..."
    if [ -f "$CODE_DIR/package.json" ]; then
        if command -v madge &> /dev/null; then
            cd "$CODE_DIR" && madge --circular src/ 2>/dev/null | grep -q "No circular dependency found" || \
            log_review "MEDIUM" "ARCHITECTURE" "发现循环依赖" "package.json" "1"
        fi
    fi
    
    # 检查模块化程度
    log_review "INFO" "ARCHITECTURE" "检查模块化程度..."
    js_files=$(find "$CODE_DIR" -name "*.js" -o -name "*.ts" 2>/dev/null | wc -l)
    if [ $js_files -gt 0 ]; then
        module_files=$(grep -r "module.exports\|export default\|export const" "$CODE_DIR" --include="*.js" --include="*.ts" 2>/dev/null | wc -l)
        module_ratio=$((module_files * 100 / js_files))
        if [ $module_ratio -lt 50 ]; then
            log_review "LOW" "ARCHITECTURE" "模块化程度较低（$module_ratio%），建议提高模块化" "$CODE_DIR" "1"
        fi
    fi
    
    log_review "SUCCESS" "ARCHITECTURE" "架构审查完成"
}

# 函数：测试审查
test_review() {
    echo "🧪 开始测试审查..."
    echo "------------------"
    
    # 检查测试文件
    log_review "INFO" "TESTING" "检查测试文件..."
    test_files=$(find "$CODE_DIR" -name "*.test.js" -o -name "*.spec.js" -o -name "*.test.ts" -o -name "*.spec.ts" 2>/dev/null | wc -l)
    source_files=$(find "$CODE_DIR" -name "*.js" -o -name "*.ts" 2>/dev/null | grep -v "\.test\|\.spec" | wc -l)
    
    if [ $source_files -gt 0 ]; then
        test_ratio=$((test_files * 100 / source_files))
        if [ $test_ratio -lt 30 ]; then
            log_review "MEDIUM" "TESTING" "测试覆盖率较低（$test_ratio%），建议增加测试" "$CODE_DIR" "1"
        fi
    fi
    
    # 检查测试运行
    log_review "INFO" "TESTING" "检查测试运行..."
    if [ -f "$CODE_DIR/package.json" ]; then
        if grep -q "\"test\"" "$CODE_DIR/package.json"; then
            if command -v npm &> /dev/null; then
                cd "$CODE_DIR" && npm test 2>&1 | grep -q "FAIL" && \
                log_review "HIGH" "TESTING" "测试运行失败" "package.json" "1" || \
                log_review "SUCCESS" "TESTING" "测试运行通过"
            fi
        fi
    fi
    
    log_review "SUCCESS" "TESTING" "测试审查完成"
}

# 函数：生成报告
generate_report() {
    if [ "$REPORT_MODE" = true ]; then
        echo ""
        echo "📈 生成详细报告..."
        echo "=================="
        
        # 汇总统计
        total_issues=$(wc -l < "$REPORT_DIR/review.log" 2>/dev/null || echo 0)
        critical_issues=$(grep -c "CRITICAL" "$REPORT_DIR/review.log" 2>/dev/null || echo 0)
        high_issues=$(grep -c "HIGH" "$REPORT_DIR/review.log" 2>/dev/null || echo 0)
        medium_issues=$(grep -c "MEDIUM" "$REPORT_DIR/review.log" 2>/dev/null || echo 0)
        low_issues=$(grep -c "LOW" "$REPORT_DIR/review.log" 2>/dev/null || echo 0)
        
        # 生成HTML报告
        cat > "$REPORT_DIR/report.html" << HTMLREPORT
<!DOCTYPE html>
<html>
<head>
    <title>电商AI Agents代码审查报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 5px 20px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        .summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; margin: 20px 0; }
        .stat-card { padding: 15px; border-radius: 8px; text-align: center; }
        .critical { background: #f8d7da; color: #721c24; }
        .high { background: #fff3cd; color: #856404; }
        .medium { background: #d1ecf1; color: #0c5460; }
        .low { background: #d4edda; color: #155724; }
        .total { background: #e2e3e5; color: #383d41; }
        .issues-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .issues-table th, .issues-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .issues-table th { background: #2c3e50; color: white; }
        .critical-row { background: #f8d7da; }
        .high-row { background: #fff3cd; }
        .medium-row { background: #d1ecf1; }
        .low-row { background: #d4edda; }
        .timestamp { color: #6c757d; font-size: 14px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 电商AI Agents代码审查报告</h1>
        
        <div class="summary">
            <h2>📊 审查概览</h2>
            <p><strong>审查目录:</strong> $CODE_DIR</p>
            <p><strong>审查模式:</strong> $REVIEW_MODE</p>
            <p><strong>审查时间:</strong> $(date '+%Y-%m-%d %H:%M:%S')</p>
        </div>
        
        <div class="stats">
            <div class="stat-card total">
                <h3>总计</h3>
                <div style="font-size: 24px; font-weight: bold;">$total_issues</div>
            </div>
            <div class="stat-card critical">
                <h3>严重</h3>
                <div style="font-size: 24px; font-weight: bold;">$critical_issues</div>
            </div>
            <div class="stat-card high">
                <h3>高危</h3>
                <div style="font-size: 24px; font-weight: bold;">$high_issues</div>
            </div>
            <div class="stat-card medium">
                <h3>中危</h3>
                <div style="font-size: 24px; font-weight: bold;">$medium_issues</div>
            </div>
            <div class="stat-card low">
                <h3>低危</h3>
                <div style="font-size: 24px; font-weight: bold;">$low_issues</div>
            </div>
        </div>
        
        <h2>📋 问题详情</h2>
        <table class="issues-table">
            <thead>
                <tr>
                    <th>级别</th>
                    <th>分类</th>
                    <th>问题描述</th>
                    <th>文件</th>
                    <th>行号</th>
                    <th>时间</th>
                </tr>
            </thead>
            <tbody>
HTMLREPORT

        # 添加问题行
        if [ -f "$REPORT_DIR/review.log" ]; then
            while IFS='|' read -r timestamp level category message file line; do
                row_class=""
                case $level in
                    "CRITICAL") row_class="critical-row" ;;
                    "HIGH") row_class="high-row" ;;
                    "MEDIUM") row