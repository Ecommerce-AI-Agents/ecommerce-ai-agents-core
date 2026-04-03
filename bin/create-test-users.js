/**
 * 创建内部测试用户脚本
 */

const testUsers = [
    // 管理员测试账户
    {
        id: 'test_admin_001',
        email: 'test.admin@ecommerce-ai-agents.org',
        password: 'TestAdmin123!',
        role: 'admin',
        name: '测试管理员'
    },
    // 商家测试账户
    {
        id: 'test_merchant_001',
        email: 'test.merchant@example.com',
        password: 'TestMerchant123!',
        role: 'merchant',
        name: '测试商家'
    },
    {
        id: 'test_merchant_002',
        email: 'test.shop@example.com',
        password: 'TestShop123!',
        role: 'merchant',
        name: '测试店铺'
    },
    // 客户测试账户
    {
        id: 'test_customer_001',
        email: 'test.customer1@example.com',
        password: 'TestCustomer123!',
        role: 'customer',
        name: '测试客户1'
    },
    {
        id: 'test_customer_002',
        email: 'test.customer2@example.com',
        password: 'TestCustomer123!',
        role: 'customer',
        name: '测试客户2'
    },
    {
        id: 'test_customer_003',
        email: 'test.customer3@example.com',
        password: 'TestCustomer123!',
        role: 'customer',
        name: '测试客户3'
    },
    // VIP客户
    {
        id: 'test_vip_001',
        email: 'test.vip@example.com',
        password: 'TestVip123!',
        role: 'customer',
        name: 'VIP测试客户'
    }
];

console.log('📋 测试用户列表：');
console.log('======================');
testUsers.forEach(user => {
    console.log(`👤 ${user.name}`);
    console.log(`   邮箱: ${user.email}`);
    console.log(`   密码: ${user.password}`);
    console.log(`   角色: ${user.role}`);
    console.log('---');
});

console.log('\n🎯 测试建议：');
console.log('1. 管理员账户：测试管理后台功能');
console.log('2. 商家账户：测试店铺管理功能');
console.log('3. 客户账户：测试购物流程功能');
console.log('4. VIP账户：测试特殊权限功能');

console.log('\n🔗 测试地址：');
console.log('管理后台: http://119.45.238.161/admin');
console.log('健康检查: http://119.45.238.161/health');
console.log('API文档: 查看健康检查返回的endpoints');

console.log('\n✅ 测试用户创建脚本完成');
console.log('请将以上账户信息分发给测试团队');