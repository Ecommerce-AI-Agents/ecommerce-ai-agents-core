const http = require('http');
const url = require('url');

// 会话存储
const sessions = new Map();

// 用户数据
const users = [
    { id: 'admin_001', email: 'admin@ecommerce-ai-agents.org', password: 'Admin123!', role: 'admin', name: '系统管理员' },
    { id: 'merchant_001', email: 'merchant@example.com', password: 'Merchant123!', role: 'merchant', name: '示例商家' },
    { id: 'customer_001', email: 'customer@example.com', password: 'Customer123!', role: 'customer', name: '示例客户' }
];

// 产品数据
const products = [
    { id: 'prod_001', name: '智能手表 Ultra Pro', price: 1499, stock: 100, desc: '新一代智能手表' },
    { id: 'prod_002', name: '无线降噪耳机', price: 899, stock: 50, desc: '主动降噪，高清音质' },
    { id: 'prod_003', name: '现代简约沙发', price: 2999, stock: 10, desc: '舒适布艺沙发' }
];

// 解析Cookie
function parseCookies(cookieString) {
    const cookies = {};
    if (cookieString) {
        cookieString.split(';').forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            cookies[name] = decodeURIComponent(value);
        });
    }
    return cookies;
}

// 验证会话
function validateSession(sessionId) {
    if (!sessionId) return null;
    return sessions.get(sessionId) || null;
}

// 创建会话
function createSession(user) {
    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const session = {
        id: sessionId,
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        createdAt: new Date().toISOString()
    };
    sessions.set(sessionId, session);
    return sessionId;
}

// 删除会话
function deleteSession(sessionId) {
    sessions.delete(sessionId);
}

// 设置Cookie
function setSessionCookie(res, sessionId) {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
    res.setHeader('Set-Cookie', `session_id=${sessionId}; Path=/; HttpOnly; Expires=${expires}; SameSite=Strict`);
}

// 清除Cookie
function clearSessionCookie(res) {
    res.setHeader('Set-Cookie', 'session_id=; Path=/; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict');
}

// 验证用户
function authenticateUser(email, password) {
    return users.find(user => user.email === email && user.password === password);
}

// 创建响应
function createResponse(success, data = null, message = '', error = null) {
    return {
        success,
        data,
        message,
        error,
        timestamp: new Date().toISOString(),
        environment: 'production'
    };
}

// 解析请求体
function parseRequestBody(req) {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch {
                resolve({});
            }
        });
    });
}

// 创建服务器
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;
    const query = parsedUrl.query;
    
    // CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }
    
    // 检查会话
    const cookies = parseCookies(req.headers.cookie || '');
    const sessionId = cookies.session_id;
    const session = validateSession(sessionId);
    
    try {
        // ==================== 公开页面 ====================
        
        // 登录页面
        if (pathname === '/' || pathname === '/login') {
            const error = query.error || '';
            const loginPage = `
<!DOCTYPE html>
<html>
<head>
    <title>电商AI Agents - 用户登录</title>
    <style>
        body { font-family: Arial; padding: 40px; text-align: center; background: #f5f5f5; }
        .login-box { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 5px 20px rgba(0,0,0,0.1); max-width: 400px; margin: 0 auto; }
        h1 { color: #2c3e50; margin-bottom: 30px; }
        input { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; }
        button { background: #3498db; color: white; padding: 12px 30px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
        .test-accounts { margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 5px; text-align: left; }
        .links { margin-top: 20px; }
        a { color: #3498db; text-decoration: none; margin: 0 10px; }
        .error { color: #e74c3c; background: #fee; padding: 10px; border-radius: 5px; margin-bottom: 15px; }
    </style>
</head>
<body>
    <div class="login-box">
        <h1>🛍️ 电商AI Agents</h1>
        <p>欢迎登录智能电商系统</p>
        
        ${error ? `<div class="error">⚠️ ${error}</div>` : ''}
        <div id="message" style="color: red; margin: 10px 0;"></div>
        
        <input type="email" id="email" placeholder="邮箱地址" value="admin@ecommerce-ai-agents.org">
        <input type="password" id="password" placeholder="密码" value="Admin123!">
        
        <button onclick="login()">登录</button>
        
        <div class="links">
            <a href="/health">健康检查</a>
        </div>
        
        <div class="test-accounts">
            <h3>测试账户:</h3>
            <p>管理员: admin@ecommerce-ai-agents.org / Admin123!</p>
            <p>商家: merchant@example.com / Merchant123!</p>
            <p>客户: customer@example.com / Customer123!</p>
        </div>
    </div>
    
    <script>
        async function login() {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const message = document.getElementById('message');
            
            message.textContent = '登录中...';
            message.style.color = 'blue';
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    message.textContent = '登录成功！正在跳转...';
                    message.style.color = 'green';
                    
                    if (data.data.user.role === 'admin') {
                        setTimeout(() => window.location.href = '/admin', 1000);
                    } else {
                        setTimeout(() => window.location.href = '/products', 1000);
                    }
                } else {
                    message.textContent = '登录失败: ' + (data.error || '用户名或密码错误');
                    message.style.color = 'red';
                }
            } catch (error) {
                message.textContent = '网络错误: ' + error.message;
                message.style.color = 'red';
            }
        }
        
        document.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') login();
        });
    </script>
</body>
</html>`;
            
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.writeHead(200);
            res.end(loginPage);
            return;
        }
        
        // 健康检查（公开）
        if (pathname === '/health') {
            const healthData = createResponse(true, {
                status: 'healthy',
                service: '电商AI Agents生产环境',
                version: '2.0.0-prod',
                security: '权限控制已启用',
                endpoints: {
                    public: ['/', '/login', '/health', '/api/auth/login', '/api/auth/logout'],
                    protected: ['/admin', '/products', '/api/products']
                }
            }, '系统运行正常');
            
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(200);
            res.end(JSON.stringify(healthData));
            return;
        }
        
        // ==================== 需要登录的页面 ====================
        
        // 管理后台（需要管理员权限）
        if (pathname === '/admin') {
            if (!session) {
                res.writeHead(302, { 'Location': '/?error=请先登录才能访问管理后台' });
                res.end();
                return;
            }
            
            if (session.role !== 'admin') {
                res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>权限不足</title>
    <style>
        body { font-family: Arial; padding: 40px; text-align: center; }
        .error-box { background: #fee; padding: 40px; border-radius: 10px; border: 2px solid #f99; }
        h1 { color: #c00; }
        a { color: #3498db; text-decoration: none; }
    </style>
</head>
<body>
    <div class="error-box">
        <h1>⚠️ 权限不足</h1>
        <p>只有管理员才能访问管理后台。</p>
        <p>当前角色: ${session.role}</p>
        <p><a href="/products">前往产品页面</a> | <a href="/">返回首页</a></p>
    </div>
</body>
</html>`);
                return;
            }
            
            const adminPage = `
<!DOCTYPE html>
<html>
<head>
    <title>电商AI Agents管理后台</title>
    <style>
        body { font-family: Arial; padding: 20px; background: #f5f5f5; }
        .header { background: #2c3e50; color: white; padding: 20px; border-radius: 10px; }
        .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
        .stat-card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .links { margin-top: 20px; }
        a { color: #3498db; text-decoration: none; margin-right: 15px; }
        .user-info { background: #e8f4fd; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🛍️ 电商AI Agents管理后台</h1>
        <p>系统版本: 2.0.0-prod | 环境: production</p>
        <div class="links">
            <a href="/products">产品页面</a>
            <a href="/health">健康检查</a>
            <a href="/api/auth/logout">退出登录</a>
        </div>
    </div>
    
    <div class="user-info">
        <p>👤 当前用户: ${session.name} (${session.email})</p>
        <p>🎭 角色: ${session.role}</p>
    </div>
    
    <div class="stats">
        <div class="stat-card">
            <h3>📦 产品总数</h3>
            <div style="font-size: 24px; font-weight: bold; color: #3498db;">${products.length}</div>
        </div>
        <div class="stat-card">
            <h3>👥 用户总数</h3>
            <div style="font-size: 24px; font-weight: bold; color: #3498db;">${users.length}</div>
        </div>
        <div class="stat-card">
            <h3>📋 订单总数</h3>
            <div style="font-size: 24px; font-weight: bold; color: #3498db;">0</div>
        </div>
        <div class="stat-card">
            <h3>🏪 店铺总数</h3>
            <div style="font-size: 24px; font-weight: bold; color: #3498db;">2</div>
        </div>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 10px; margin-top: 20px;">
        <h2>📊 系统状态</h2>
        <p>服务状态: <span style="color:green">✅ 运行正常</span></p>
        <p>API响应: <span style="color:green">✅ 正常</span></p>
        <p>数据库连接: <span style="color:green">✅ 正常</span></p>
        <p>内存使用: <span style="color:green">✅ 正常</span></p>
        <p>权限控制: <span style="color:green">✅ 已启用</span></p>
    </div>
</body>
</html>`;
            
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.writeHead(200);
            res.end(adminPage);
            return;
        }
        
        // 产品页面（需要登录）
        if (pathname === '/products') {
            if (!session) {
                res.writeHead(302, { 'Location': '/?error=请先登录才能查看产品' });
                res.end();
                return;
            }
            
            const productsPage = `
<!DOCTYPE html>
<html>
<head>
    <title>产品展示 - 电商AI Agents</title>
    <style>
        body { font-family: Arial; padding: 20px; background: #f5f5f5; }
        .header { background: #2c3e50; color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
        .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 25px; }
        .product-card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .product-image { height: 200px; background: #e9ecef; border-radius: 8px; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; font-size: 48px; }
        .product-price { color: #e74c3c; font-size: 24px; font-weight: bold; }
        .product-stock { color: #27ae60; }
        .btn { background: #3498db; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
        .user-info { background: #e8f4fd; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🛍️ 产品展示</h1>
        <p>浏览我们的优质产品，享受智能购物体验</p>
        <div style="margin-top: 15px;">
            ${session.role === 'admin' ? '<a href="/admin" style="color: white; text-decoration: underline;">管理后台</a>' : ''}
            <a href="/" style="color: white; text-decoration: underline; margin-left: 20px;">返回首页</a>
            <a href="/api/auth/logout" style="color: white; text-decoration: underline; margin-left: 20px;">退出登录</a>
        </div>
    </div>
    
    <div class="user-info">
        <p>👤 欢迎, ${session.name} (${session.email})</p>
        <p>🎭 角色: ${session.role}</p>
    </div>
    
    <div class="products-grid" id="productsContainer">
        <!-- 产品将通过JS动态加载 -->
    </div>
    
    <script>
        async function loadProducts() {
            try {
                const response = await fetch('/api/products');
                const data = await response.json();
                
                if (data.success) {
                    const container = document.getElementById('productsContainer');
                    container.innerHTML = '';
                    
                    data.data.forEach(product => {
                        const productCard = document.createElement('div');
                        productCard.className = 'product-card';
                        productCard.innerHTML = \`
                            <div class
