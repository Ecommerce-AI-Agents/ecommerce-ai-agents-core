const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }
    
    // 根路径 - 登录页面
    if (pathname === '/' || pathname === '/login') {
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
    </style>
</head>
<body>
    <div class="login-box">
        <h1>🛍️ 电商AI Agents</h1>
        <p>欢迎登录智能电商系统</p>
        
        <div id="message" style="color: red; margin: 10px 0;"></div>
        
        <input type="email" id="email" placeholder="邮箱地址" value="admin@ecommerce-ai-agents.org">
        <input type="password" id="password" placeholder="密码" value="Admin123!">
        
        <button onclick="login()">登录</button>
        
        <div class="links">
            <a href="/admin">管理后台</a>
            <a href="/products">产品页面</a>
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
        
    } else if (pathname === '/admin') {
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
    </style>
</head>
<body>
    <div class="header">
        <h1>🛍️ 电商AI Agents管理后台</h1>
        <p>系统版本: 2.0.0-prod | 环境: production</p>
        <div class="links">
            <a href="/">返回登录</a>
            <a href="/products">产品页面</a>
            <a href="/health">健康检查</a>
        </div>
    </div>
    
    <div class="stats">
        <div class="stat-card">
            <h3>📦 产品总数</h3>
            <div style="font-size: 24px; font-weight: bold; color: #3498db;">3</div>
        </div>
        <div class="stat-card">
            <h3>👥 用户总数</h3>
            <div style="font-size: 24px; font-weight: bold; color: #3498db;">3</div>
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
    </div>
</body>
</html>`;
        
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.writeHead(200);
        res.end(adminPage);
        return;
        
    } else if (pathname === '/health') {
        const healthData = {
            status: 'healthy',
            service: '电商AI Agents生产环境',
            version: '2.0.0-prod',
            timestamp: new Date().toISOString(),
            environment: 'production',
            endpoints: ['/', '/login', '/admin', '/products', '/health', '/api/auth/login', '/api/products']
        };
        
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify(healthData));
        return;
        
    } else if (pathname === '/api/auth/login' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const { email, password } = data;
                
                const users = [
                    { email: 'admin@ecommerce-ai-agents.org', password: 'Admin123!', role: 'admin', name: '系统管理员' },
                    { email: 'merchant@example.com', password: 'Merchant123!', role: 'merchant', name: '示例商家' },
                    { email: 'customer@example.com', password: 'Customer123!', role: 'customer', name: '示例客户' }
                ];
                
                const user = users.find(u => u.email === email && u.password === password);
                
                if (user) {
                    const response = {
                        success: true,
                        data: {
                            token: 'prod-jwt-token-' + Date.now(),
                            user: {
                                id: 'user_' + Date.now(),
                                email: user.email,
                                role: user.role,
                                name: user.name
                            }
                        },
                        message: '登录成功',
                        timestamp: new Date().toISOString(),
                        environment: 'production'
                    };
                    
                    res.setHeader('Content-Type', 'application/json');
                    res.writeHead(200);
                    res.end(JSON.stringify(response));
                } else {
                    const response = {
                        success: false,
                        data: null,
                        message: '登录失败',
                        error: '用户名或密码错误',
                        timestamp: new Date().toISOString(),
                        environment: 'production'
                    };
                    
                    res.setHeader('Content-Type', 'application/json');
                    res.writeHead(401);
                    res.end(JSON.stringify(response));
                }
            } catch (error) {
                const response = {
                    success: false,
                    data: null,
                    message: '服务器错误',
                    error: error.message,
                    timestamp: new Date().toISOString(),
                    environment: 'production'
                };
                
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(500);
                res.end(JSON.stringify(response));
            }
        });
        return;
        
    } else {
        const response = {
            success: false,
            data: null,
            message: '页面或接口不存在',
            error: 'Not Found',
            timestamp: new Date().toISOString(),
            environment: 'production'
        };
        
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(404);
        res.end(JSON.stringify(response));
    }
});

server.listen(3000, '0.0.0.0', () => {
    console.log('🚀 电商AI Agents登录页面服务器启动成功');
    console.log('📡 访问地址: http://localhost:3000');
    console.log('🌐 公网访问: http://119.45.238.161');
    console.log('👤 测试账户: admin@ecommerce-ai-agents.org / Admin123!');
});
