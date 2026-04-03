// 简单的权限检查中间件
module.exports = function(req, res, next) {
    const url = require('url');
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    // 公开页面
    const publicPaths = ['/', '/login', '/health', '/api/auth/login', '/api/auth/logout'];
    if (publicPaths.includes(pathname)) {
        return next();
    }
    
    // 检查Cookie
    const cookies = {};
    if (req.headers.cookie) {
        req.headers.cookie.split(';').forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            cookies[name] = decodeURIComponent(value);
        });
    }
    
    const sessionId = cookies.session_id;
    
    // 简单的会话验证
    const sessions = {
        'admin_session': { role: 'admin', name: '系统管理员', email: 'admin@ecommerce-ai-agents.org' },
        'user_session': { role: 'customer', name: '示例客户', email: 'customer@example.com' }
    };
    
    const session = sessions[sessionId];
    
    if (!session) {
        // 未登录，重定向到登录页面
        res.writeHead(302, { 'Location': '/?error=请先登录' });
        res.end();
        return;
    }
    
    // 检查管理员权限
    if (pathname === '/admin' && session.role !== 'admin') {
        res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
<!DOCTYPE html>
<html>
<head><title>权限不足</title><style>body{font-family:Arial;padding:40px;text-align:center;}</style></head>
<body>
    <h1 style="color:#c00;">⚠️ 权限不足</h1>
    <p>只有管理员才能访问管理后台。</p>
    <p>当前角色: ${session.role}</p>
    <p><a href="/products">前往产品页面</a> | <a href="/">返回首页</a></p>
</body>
</html>`);
        return;
    }
    
    // 将会话信息附加到请求对象
    req.session = session;
    next();
};
