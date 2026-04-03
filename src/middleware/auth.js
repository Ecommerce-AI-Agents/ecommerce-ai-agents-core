/**
 * 电商AI Agents权限验证中间件
 * 用于保护需要登录才能访问的页面
 */

// 用户会话存储（生产环境应该使用Redis或数据库）
const userSessions = new Map();

// 创建会话
function createSession(user) {
    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const session = {
        id: sessionId,
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时过期
    };
    
    userSessions.set(sessionId, session);
    return sessionId;
}

// 验证会话
function validateSession(sessionId) {
    if (!sessionId) return null;
    
    const session = userSessions.get(sessionId);
    if (!session) return null;
    
    // 检查是否过期
    if (new Date() > new Date(session.expiresAt)) {
        userSessions.delete(sessionId);
        return null;
    }
    
    // 更新过期时间
    session.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return session;
}

// 删除会话
function deleteSession(sessionId) {
    userSessions.delete(sessionId);
}

// 权限检查中间件
function requireAuth(req, res, next) {
    const cookies = parseCookies(req.headers.cookie || '');
    const sessionId = cookies.session_id;
    const session = validateSession(sessionId);
    
    if (!session) {
        // 未登录，重定向到登录页面
        res.writeHead(302, { 'Location': '/?error=请先登录' });
        res.end();
        return;
    }
    
    // 将会话信息附加到请求对象
    req.session = session;
    next();
}

// 检查角色权限
function requireRole(requiredRole) {
    return function(req, res, next) {
        const cookies = parseCookies(req.headers.cookie || '');
        const sessionId = cookies.session_id;
        const session = validateSession(sessionId);
        
        if (!session) {
            res.writeHead(302, { 'Location': '/?error=请先登录' });
            res.end();
            return;
        }
        
        // 检查角色权限
        if (session.role !== requiredRole && session.role !== 'admin') {
            // 权限不足
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
                        <p>您没有权限访问此页面。</p>
                        <p>当前角色: ${session.role} | 所需角色: ${requiredRole}</p>
                        <p><a href="/">返回首页</a></p>
                    </div>
                </body>
                </html>
            `);
            return;
        }
        
        req.session = session;
        next();
    };
}

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

// 设置Cookie
function setSessionCookie(res, sessionId) {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
    res.setHeader('Set-Cookie', `session_id=${sessionId}; Path=/; HttpOnly; Expires=${expires}; SameSite=Strict`);
}

// 清除Cookie
function clearSessionCookie(res) {
    res.setHeader('Set-Cookie', 'session_id=; Path=/; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict');
}

// 用户数据
const users = [
    { id: 'admin_001', email: 'admin@ecommerce-ai-agents.org', password: 'Admin123!', role: 'admin', name: '系统管理员' },
    { id: 'merchant_001', email: 'merchant@example.com', password: 'Merchant123!', role: 'merchant', name: '示例商家' },
    { id: 'customer_001', email: 'customer@example.com', password: 'Customer123!', role: 'customer', name: '示例客户' }
];

// 验证用户凭据
function authenticateUser(email, password) {
    return users.find(user => user.email === email && user.password === password);
}

module.exports = {
    createSession,
    validateSession,
    deleteSession,
    requireAuth,
    requireRole,
    setSessionCookie,
    clearSessionCookie,
    authenticateUser,
    parseCookies
};