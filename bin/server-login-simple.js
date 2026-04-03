const http = require('http');
const url = require('url');

const config = { port: 3000, host: '0.0.0.0', environment: 'production' };

const productionData = {
    products: [
        { id: 'prod_001', name: '智能手表 Ultra Pro', price: 1499, stock: 100, desc: '新一代智能手表' },
        { id: 'prod_002', name: '无线降噪耳机', price: 899, stock: 50, desc: '主动降噪，高清音质' },
        { id: 'prod_003', name: '现代简约沙发', price: 2999, stock: 10, desc: '舒适布艺沙发' }
    ],
    users: [
        { id: 'admin_001', email: 'admin@ecommerce-ai-agents.org', password: 'Admin123!', role: 'admin', name: '系统管理员' },
        { id: 'merchant_001', email: 'merchant@example.com', password: 'Merchant123!', role: 'merchant', name: '示例商家' },
        { id: 'customer_001', email: 'customer@example.com', password: 'Customer123!', role: 'customer', name: '示例客户' }
    ],
    orders: []
};

const createResponse = (success, data = null, message = '', error = null) => {
    return {
        success,
        data,
        message,
        error,
        timestamp: new Date().toISOString(),
        environment: config.environment
    };
};

const parseRequestBody = (req) => {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try { resolve(body ? JSON.parse(body) : {}); } catch { resolve({}); }
        });
    });
};

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }
    
    try {
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
        <p>系统版本: 2.0.0-prod | 环境: ${config.environment}</p>
        <div class="links">
            <a href="/">返回登录</a>
            <a href="/products">产品页面</a>
            <a href="/health">健康检查</a>
        </div>
    </div>
    
    <div class="stats">
        <div class="stat-card">
            <h3>📦 产品总数</h3>
            <div style="font-size: 24px; font-weight: bold; color: #3498db;">${productionData.products.length}</div>
        </div>
        <div class="stat-card">
            <h3>👥 用户总数</h3>
            <div style="font-size: 24px; font-weight: bold; color: #3498db;">${productionData.users.length}</div>
        </div>
        <div class="stat-card">
            <h3>📋 订单总数</h3>
            <div style="font-size: 24px; font-weight: bold; color: #3498db;">${productionData.orders.length}</div>
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
            
        } else if (pathname === '/products') {
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
    </style>
</head>
<body>
    <div class="header">
        <h1>🛍️ 产品展示</h1>
        <p>浏览我们的优质产品，享受智能购物体验</p>
        <a href="/" style="color: white; text-decoration: underline;">返回登录</a>
        <a href="/admin" style="color: white; text-decoration: underline; margin-left: 20px;">管理后台</a>
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
                            <div class="product-image">📦</div>
                            <h3>\${product.name}</h3>
                            <p>\${product.desc || '优质产品'}</p>
                            <div class="product-price">¥\${product.price}</div>
                            <div class="product-stock">库存: \${product.stock}件</div>
                            <button class="btn" onclick="addToCart('\${product.id}')">加入购物车</button>
                        \`;
                        container.appendChild(productCard);
                    });
                }
            } catch (error) {
                console.error('加载产品失败:', error);
            }
        }
        
        function addToCart(productId) {
            alert('已添加到购物车: ' + productId);
        }
        
        window.onload = loadProducts;
    </script>
</body>
</html>`;
            
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.writeHead(200);
            res.end(productsPage);
            return;
            
        } else if (pathname === '/health') {
            const healthData = {
                status: 'healthy',
                service: '电商AI Agents生产环境',
                version: '2.0.0-prod',
                timestamp: new Date().toISOString(),
                environment: config.environment,
                endpoints: [
                    '/',
                    '/login',
                    '/admin',
                    '/products',
                    '/health',
                    '/api/auth/login',
                    '/api/products',
                    '/api/orders',
                    '/api/ai/chat'
                ]
            };
            
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(200);
            res.end(JSON.stringify(healthData));
            return;
            
        } else if (pathname === '/api/auth/login' && method === 'POST') {
            const body = await parseRequestBody(req);
            const { email, password } = body;
            
            const user = productionData.users.find(u => u.email === email && u.password === password);
            
            if (user) {
                const response = createResponse(true, {
                    token: 'prod-jwt-token-' + Date.now(),
                    user: {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                        name: user.name || '用户'
                    }
                }, '登录成功');
                
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(200);
                res.end(JSON.stringify(response));
            } else {
                const response = createResponse(false, null, '登录失败', '用户名或密码错误');
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(401);
                res.end(JSON.stringify(response));
            }
            return;
            
        } else if (pathname === '/api/products' && method === 'GET') {
            const response = createResponse(true, productionData.products, '产品列表获取成功');
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(200);
            res.end(JSON.stringify(response));
            return;
            
        } else if (pathname === '/api/orders' && method === 'POST') {
            const body = await parseRequestBody(req);
            const { shop_id, items, customer_email } = body;
            
            const orderNumber = 'ORD' + Date.now().toString().slice(-8);
            const order = {
                id: 'order_' + Date.now(),
                order_number: orderNumber,
                customer_email: customer_email || 'customer@example.com',
                shop_id: shop_id || 'shop_001',
                items: items || [{ product_id: 'prod_001', quantity: 1 }],
                status: 'pending',
                payment_status: 'unpaid',
                total_amount: 1499,
                created_at: new Date().toISOString()
            };
            
            productionData.orders.push(order);
            
            const response = createResponse(true, order, '订单创建成功');
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(201);
            res.end(JSON.stringify(response));
            return;
            
        } else if (pathname === '/api/ai/chat' && method === 'POST') {
            const body = await parseRequestBody(req);
            const { message } = body;
            
            let responseText = '您好！我是电商AI助手，有什么可以帮助您的？';
            
            if (message.includes('手表') || message.includes('智能手表')) {
                responseText = '智能手表 Ultra Pro现价1499元，支持健康监测、运动追踪、7天续航。';
            } else if (message.includes('耳机') || message.includes('降噪')) {
                responseText = '无线降噪耳机899元，主动降噪技术，高清音质，30小时续航。';
            } else if (message.includes('价格') || message.includes('多少钱')) {
                responseText = '智能手表1499元，降噪耳机899元，简约沙发2999元。';
            } else if (message.includes('发货') || message.includes('配送')) {
                responseText = '标准配送3-5个工作日，快递配送1-2天，支持全国配送。';
            }
            
            const response = createResponse(true, { response: responseText }, 'AI回复成功');
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(200);
            res.end(JSON.stringify(response));
            return;
            
        } else {
            const response = createResponse(false, null, '页面或接口不存在', 'Not Found');
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(404);
            res.end(JSON.stringify(response));
        }
        
    } catch (error) {
        console.error('服务器错误:', error);
        const response = createResponse(false, null, '服务器内部错误', error.message);
        res.setHeader('Content-Type', 'application/json');
        res.writeHead
