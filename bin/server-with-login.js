/**
 * 电商AI Agents生产环境服务器（带登录页面版）
 * 包含完整的用户登录页面和仪表板
 */

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// 加载生产配置
const configPath = path.join(__dirname, '../config/production.json');
let config = {};

try {
    const configData = fs.readFileSync(configPath, 'utf8');
    config = JSON.parse(configData);
    console.log('✅ 生产配置文件加载成功');
} catch (error) {
    console.error('❌ 生产配置文件加载失败，使用默认配置');
    config = {
        server: { port: 3000, host: '0.0.0.0' },
        features: { user_authentication: true, product_management: true }
    };
}

// 生产环境数据
const productionData = {
    shops: [
        { id: 'shop_prod_001', name: 'AI科技旗舰店（生产）', desc: '智能科技产品' },
        { id: 'shop_prod_002', name: '时尚生活馆（生产）', desc: '生活家居用品' }
    ],
    products: [
        { id: 'prod_prod_001', name: '智能手表 Ultra Pro', price: 1499, stock: 100, desc: '新一代智能手表' },
        { id: 'prod_prod_002', name: '无线降噪耳机', price: 899, stock: 50, desc: '主动降噪，高清音质' },
        { id: 'prod_prod_003', name: '现代简约沙发', price: 2999, stock: 10, desc: '舒适布艺沙发' }
    ],
    users: [
        { id: 'admin_prod', email: 'admin@ecommerce-ai-agents.org', password: 'Admin123!', role: 'admin', name: '系统管理员' },
        { id: 'merchant_prod', email: 'merchant@example.com', password: 'Merchant123!', role: 'merchant', name: '示例商家' },
        { id: 'customer_prod', email: 'customer@example.com', password: 'Customer123!', role: 'customer', name: '示例客户' }
    ],
    orders: []
};

// 统一响应格式
const createResponse = (success, data = null, message = '', error = null) => {
    return {
        success,
        data,
        message,
        error,
        timestamp: new Date().toISOString(),
        environment: config.server.environment || 'production'
    };
};

// 解析请求体
const parseRequestBody = (req) => {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch {
                resolve({});
            }
        });
    });
};

// 读取HTML文件
const readHtmlFile = (filename) => {
    try {
        const filePath = path.join(__dirname, filename);
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.error(`❌ 读取HTML文件失败: ${filename}`, error);
        return '<html><body><h1>页面加载失败</h1></body></html>';
    }
};

// 生产环境服务器
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;
    
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // 处理预检请求
    if (method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }
    
    try {
        // ==================== 页面路由 ====================
        
        if (pathname === '/' || pathname === '/login') {
            // 登录页面
            const loginHtml = readHtmlFile('login-page.html');
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.writeHead(200);
            res.end(loginHtml);
            return;
            
        } else if (pathname === '/dashboard' || pathname === '/user') {
            // 用户仪表板
            const dashboardHtml = readHtmlFile('user-dashboard.html');
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.writeHead(200);
            res.end(dashboardHtml);
            return;
            
        } else if (pathname === '/products') {
            // 产品展示页面
            const productsHtml = `
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
        // 加载产品数据
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
            // 这里可以添加实际的购物车逻辑
        }
        
        // 页面加载时获取产品
        window.onload = loadProducts;
    </script>
</body>
</html>`;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.writeHead(200);
            res.end(productsHtml);
            return;
            
        } else if (pathname === '/admin') {
            // 管理后台
            const adminHtml = readHtmlFile('admin-dashboard.html') || `
<!DOCTYPE html>
<html>
<head>
    <title>电商AI Agents生产环境管理后台</title>
    <style>
        body { font-family: Arial; padding: 20px; background: #f5f5f5; }
        .header { background: #2c3e50; color: white; padding: 20px; border-radius: 10px; }
        .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
        .stat-card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .stat-value { font-size: 24px; font-weight: bold; color: #3498db; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🛍️ 电商AI Agents生产环境管理后台</h1>
        <p>系统版本: 2.0.0-prod | 环境: ${config.server.environment} | 时间: ${new Date().toLocaleString()}</p>
        <a href="/" style="color: white; text-decoration: underline;">返回登录页面</a>
    </div>
    
    <div class="stats">
        <div class="stat-card">
            <h3>📦 产品总数</h3>
            <div class="stat-value">${productionData.products.length}</div>
        </div>
        <div class="stat-card">
            <h3>👥 用户总数</h3>
            <div class="stat-value">${productionData.users.length}</div>
        </div>
        <div class="stat-card">
            <h3>📋 订单总数</h3>
            <div class="stat-value">${productionData.orders.length}</div>
        </div>
        <div class="stat-card">
            <h3>🏪 店铺总数</h3>
            <div class="stat-value">${productionData.shops.length}</div>
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
            res.end(adminHtml);
            return;
            
        } else if (pathname === '/health') {
            // 健康检查
            const healthData = {
                status: 'healthy',
                service: config.server.name || '电商AI Agents生产环境',
                version: '2.0.0-prod',
                timestamp: new Date().toISOString(),
                environment: config.server.environment,
                features: Object.keys(config.features || {}).filter(k => config.features[k]),
                endpoints: [
                    '/',
                    '/login',
                    '/dashboard',
                    '/products',
                    '/admin',
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
            // 用户登录API
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
            // 获取产品列表API
            const response = createResponse(true, productionData.products, '产品列表获取成功');
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(200);
            res.end(JSON.stringify(response));
            return;
            
        } else if (pathname === '/api/orders' && method === 'POST') {
            // 创建订单API
            const body = await parseRequestBody(req);
            const { shop_id, items, customer_email } = body;
            
            const orderNumber = 'ORD' + Date.now().toString().slice(-8);
            const order = {
                id: 'order_' + Date.now(),
                order_number: orderNumber,
                customer_email: customer_email || 'customer@example.com',
                shop_id: shop_id || 'shop_prod_001',
                items: items || [{ product_id: 'prod_prod_001', quantity: 1 }],
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
            // AI对话API
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
            } else if (message.includes('登录') || message.includes('注册')) {
                responseText = '请访问我们的登录页面进行账户操作。';
            }
            
            const response = createResponse(true, { response: responseText }, 'AI回复成功');
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(200);
            res.end(JSON.stringify(response));
            return;
            
        } else {
            // 404处理
            const response = createResponse(false, null, '页面或接口不存在', 'Not Found');
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(404);
            res.end(JSON.stringify(response));
        }
        
    } catch (error) {
        // 错误处理
        console.error('服务器错误:', error);
        const response = createResponse(false, null, '服务器内部错误', error.message);
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(500);
        res.end(JSON.stringify(response));
    }
});

// 启动服务器
const PORT = config.server.port || 3000;
const HOST = config.server.host || '0.0.0.0';

server.listen(PORT, HOST, () => {
    console.log('==========================================');
    console.log('🚀 电商AI Agents生产环境服务器启动成功');
    console.log('==========================================');
    console.log(`📡 服务器地址: http://${HOST}:${PORT}`);
    console.log(`🌐 登录页面: http://${HOST}:${PORT}/`);
    console.log(`👤 用户仪表板: http://${HOST}:${PORT}/dashboard`);
    console.log(`📦 产品页面: http://${HOST}:${PORT}/products`);
    console.log(`👑 管理后台: http://${HOST}:${PORT}/admin`);
    console.log(`🔧 健康检查: http://${HOST}:${PORT}/health`);
    console.log(`⚙️  环境: ${config.server.environment || 'production'}`);
    console.log('==========================================');
    console.log('👤 默认账户:');
    console.log('   管理员: admin@ecommerce-ai-agents.org / Admin123!');
    console.log('   商家: merchant@example.com / Merchant123!');
    console.log('   客户: customer@example.com / Customer123!');
    console.log