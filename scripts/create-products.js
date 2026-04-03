/**
 * 创建内部测试产品数据
 */

const testProducts = [
    // 电子产品
    {
        id: 'test_prod_001',
        name: '测试智能手表',
        price: 999,
        stock: 50,
        desc: '测试用智能手表，功能齐全',
        category: 'electronics',
        tags: ['智能', '手表', '测试']
    },
    {
        id: 'test_prod_002',
        name: '测试降噪耳机',
        price: 499,
        stock: 100,
        desc: '测试用降噪耳机，音质优秀',
        category: 'electronics',
        tags: ['耳机', '降噪', '测试']
    },
    {
        id: 'test_prod_003',
        name: '测试蓝牙音箱',
        price: 299,
        stock: 80,
        desc: '测试用蓝牙音箱，便携设计',
        category: 'electronics',
        tags: ['音箱', '蓝牙', '测试']
    },
    // 家居产品
    {
        id: 'test_prod_004',
        name: '测试简约沙发',
        price: 1999,
        stock: 20,
        desc: '测试用简约沙发，舒适耐用',
        category: 'home',
        tags: ['沙发', '家居', '测试']
    },
    {
        id: 'test_prod_005',
        name: '测试智能台灯',
        price: 199,
        stock: 150,
        desc: '测试用智能台灯，可调光色',
        category: 'home',
        tags: ['台灯', '智能', '测试']
    },
    // 服装产品
    {
        id: 'test_prod_006',
        name: '测试T恤衫',
        price: 89,
        stock: 200,
        desc: '测试用纯棉T恤，舒适透气',
        category: 'clothing',
        tags: ['T恤', '服装', '测试']
    },
    {
        id: 'test_prod_007',
        name: '测试运动鞋',
        price: 399,
        stock: 60,
        desc: '测试用运动鞋，轻便舒适',
        category: 'clothing',
        tags: ['鞋子', '运动', '测试']
    },
    // 高价产品（测试支付）
    {
        id: 'test_prod_008',
        name: '测试高端手机',
        price: 5999,
        stock: 10,
        desc: '测试用高端智能手机',
        category: 'electronics',
        tags: ['手机', '高端', '测试']
    },
    // 低价产品（测试促销）
    {
        id: 'test_prod_009',
        name: '测试数据线',
        price: 19,
        stock: 500,
        desc: '测试用Type-C数据线',
        category: 'electronics',
        tags: ['数据线', '配件', '测试']
    },
    // 零库存产品（测试库存管理）
    {
        id: 'test_prod_010',
        name: '测试限量商品',
        price: 999,
        stock: 0,
        desc: '测试用限量商品，已售罄',
        category: 'special',
        tags: ['限量', '售罄', '测试']
    }
];

console.log('📦 测试产品列表：');
console.log('======================');
console.log(`总计: ${testProducts.length}个测试产品`);
console.log('');

// 按分类显示
const categories = {};
testProducts.forEach(product => {
    if (!categories[product.category]) {
        categories[product.category] = [];
    }
    categories[product.category].push(product);
});

Object.keys(categories).forEach(category => {
    console.log(`🏷️  ${category.toUpperCase()} 分类 (${categories[category].length}个产品):`);
    categories[category].forEach(product => {
        console.log(`   📦 ${product.name} - ¥${product.price} (库存: ${product.stock})`);
    });
    console.log('');
});

console.log('🎯 测试场景覆盖：');
console.log('1. 价格区间测试：¥19 - ¥5999');
console.log('2. 库存测试：0库存、低库存、充足库存');
console.log('3. 分类测试：电子产品、家居、服装、特殊商品');
console.log('4. 支付测试：不同价格段的支付流程');
console.log('5. 库存管理测试：售罄商品处理');

console.log('\n✅ 测试产品数据创建完成');
console.log('测试团队可以使用这些产品进行全面的功能测试');