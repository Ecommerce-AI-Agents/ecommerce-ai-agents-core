// 测试文件 - 验证GitHub Actions工作流
// 这个文件用于测试自动化代码审查工作流

/**
 * 用户认证模块
 * 提供基本的用户登录和注册功能
 */
class AuthService {
  constructor() {
    this.users = new Map();
  }

  /**
   * 用户注册
   * @param {string} username - 用户名
   * @param {string} password - 密码（应该加密存储）
   * @returns {boolean} 注册是否成功
   */
  register(username, password) {
    // 安全检查：防止空用户名或密码
    if (!username || !password) {
      console.error('用户名和密码不能为空');
      return false;
    }

    // 检查用户是否已存在
    if (this.users.has(username)) {
      console.error('用户已存在');
      return false;
    }

    // 存储用户信息（生产环境应该加密密码）
    this.users.set(username, {
      username,
      password: this._hashPassword(password), // 密码应该哈希存储
      createdAt: new Date().toISOString()
    });

    console.log(`用户 ${username} 注册成功`);
    return true;
  }

  /**
   * 用户登录
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {boolean} 登录是否成功
   */
  login(username, password) {
    // 输入验证
    if (!username || !password) {
      console.error('用户名和密码不能为空');
      return false;
    }

    // 查找用户
    const user = this.users.get(username);
    if (!user) {
      console.error('用户不存在');
      return false;
    }

    // 验证密码（生产环境应该比较哈希值）
    const hashedPassword = this._hashPassword(password);
    if (user.password !== hashedPassword) {
      console.error('密码错误');
      return false;
    }

    console.log(`用户 ${username} 登录成功`);
    return true;
  }

  /**
   * 哈希密码（简化版，生产环境应该使用bcrypt等）
   * @param {string} password - 原始密码
   * @returns {string} 哈希后的密码
   * @private
   */
  _hashPassword(password) {
    // 注意：这只是示例，生产环境应该使用安全的哈希算法
    return Buffer.from(password).toString('base64');
  }

  /**
   * 获取用户数量
   * @returns {number} 用户数量
   */
  getUserCount() {
    return this.users.size;
  }

  /**
   * 清除所有用户（仅用于测试）
   */
  clearAllUsers() {
    this.users.clear();
    console.log('已清除所有用户');
  }
}

// 导出模块
module.exports = AuthService;

// 测试代码
if (require.main === module) {
  const auth = new AuthService();
  
  // 测试注册
  console.log('测试用户注册...');
  const registerResult = auth.register('testuser', 'Test123!');
  console.log(`注册结果: ${registerResult ? '成功' : '失败'}`);
  
  // 测试登录
  console.log('测试用户登录...');
  const loginResult = auth.login('testuser', 'Test123!');
  console.log(`登录结果: ${loginResult ? '成功' : '失败'}`);
  
  // 测试错误密码
  console.log('测试错误密码...');
  const wrongPasswordResult = auth.login('testuser', 'WrongPassword');
  console.log(`错误密码登录结果: ${wrongPasswordResult ? '成功' : '失败'}`);
  
  // 显示用户数量
  console.log(`总用户数: ${auth.getUserCount()}`);
}
