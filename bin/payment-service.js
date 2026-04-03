/**
 * 电商AI Agents支付服务模块
 * 支持支付宝、微信支付、测试支付
 */

const crypto = require('crypto');

class PaymentService {
  constructor() {
    // 支付配置（实际应从环境变量读取）
    this.config = {
      alipay: {
        enabled: true,
        appId: '2021000123456789', // 沙箱appId
        gateway: 'https://openapi.alipaydev.com/gateway.do',
        privateKey: 'MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC4...', // 示例私钥
        alipayPublicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...'
      },
      wechat: {
        enabled: true,
        appId: 'wx1234567890abcdef',
        mchId: '1234567890',
        apiKey: 'your-wechat-api-key-32-characters-long'
      },
      test: {
        enabled: true, // 测试支付，无需真实支付
        successRate: 1.0 // 100%成功
      }
    };
    
    // 支付状态
    this.paymentStatus = {
      PENDING: 'pending',      // 等待支付
      PROCESSING: 'processing', // 处理中
      SUCCESS: 'success',      // 支付成功
      FAILED: 'failed',        // 支付失败
      REFUNDED: 'refunded',    // 已退款
      CLOSED: 'closed'         // 已关闭
    };
    
    // 内存存储支付记录（生产环境应使用数据库）
    this.payments = new Map();
  }

  /**
   * 创建支付订单
   * @param {Object} order - 订单信息
   * @param {string} paymentMethod - 支付方式: alipay, wechat, test
   * @returns {Object} 支付信息
   */
  createPayment(order, paymentMethod = 'test') {
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const amount = order.total_amount || order.amount;
    
    if (!amount || amount <= 0) {
      throw new Error('支付金额必须大于0');
    }
    
    const payment = {
      id: paymentId,
      order_id: order.id || order.order_id,
      order_number: order.order_number,
      payment_method: paymentMethod,
      amount: amount,
      currency: order.currency || 'CNY',
      status: this.paymentStatus.PENDING,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {
        customer_id: order.customer_id,
        customer_email: order.customer_email,
        products: order.items || []
      }
    };
    
    // 根据支付方式生成支付参数
    let paymentData;
    switch (paymentMethod) {
      case 'alipay':
        paymentData = this.createAlipayPayment(payment);
        break;
      case 'wechat':
        paymentData = this.createWechatPayment(payment);
        break;
      case 'test':
        paymentData = this.createTestPayment(payment);
        break;
      default:
        throw new Error(`不支持的支付方式: ${paymentMethod}`);
    }
    
    // 保存支付记录
    this.payments.set(paymentId, payment);
    
    return {
      payment_id: paymentId,
      order_id: payment.order_id,
      order_number: payment.order_number,
      amount: payment.amount,
      currency: payment.currency,
      payment_method: paymentMethod,
      status: payment.status,
      payment_data: paymentData,
      created_at: payment.created_at
    };
  }

  /**
   * 创建支付宝支付
   */
  createAlipayPayment(payment) {
    if (!this.config.alipay.enabled) {
      throw new Error('支付宝支付未启用');
    }
    
    const params = {
      app_id: this.config.alipay.appId,
      method: 'alipay.trade.page.pay',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, ''),
      version: '1.0',
      biz_content: JSON.stringify({
        out_trade_no: payment.id,
        product_code: 'FAST_INSTANT_TRADE_PAY',
        total_amount: payment.amount.toFixed(2),
        subject: `订单支付 - ${payment.order_number}`,
        body: `支付订单 ${payment.order_number}`,
        timeout_express: '30m'
      }),
      return_url: 'http://localhost:8080/payment/return',
      notify_url: 'http://localhost:8080/api/payment/notify/alipay'
    };
    
    // 生成签名（简化版，实际需要完整实现）
    params.sign = this.generateAlipaySign(params);
    
    return {
      type: 'redirect',
      url: `${this.config.alipay.gateway}?${this.buildQueryString(params)}`,
      method: 'GET',
      params: params
    };
  }

  /**
   * 创建微信支付
   */
  createWechatPayment(payment) {
    if (!this.config.wechat.enabled) {
      throw new Error('微信支付未启用');
    }
    
    const nonceStr = crypto.randomBytes(16).toString('hex');
    const timeStamp = Math.floor(Date.now() / 1000).toString();
    
    const params = {
      appId: this.config.wechat.appId,
      timeStamp: timeStamp,
      nonceStr: nonceStr,
      package: `prepay_id=wx${Date.now()}`,
      signType: 'MD5'
    };
    
    // 生成签名（简化版）
    params.paySign = this.generateWechatSign(params);
    
    return {
      type: 'jsapi',
      params: params,
      qr_code_url: `https://api.mch.weixin.qq.com/pay/unifiedorder?out_trade_no=${payment.id}`
    };
  }

  /**
   * 创建测试支付
   */
  createTestPayment(payment) {
    return {
      type: 'test',
      test_url: `http://localhost:8080/api/payment/test/${payment.id}`,
      instructions: '这是测试支付，点击链接模拟支付成功',
      success_rate: this.config.test.successRate
    };
  }

  /**
   * 处理支付回调
   */
  handlePaymentCallback(paymentId, callbackData) {
    const payment = this.payments.get(paymentId);
    if (!payment) {
      throw new Error('支付记录不存在');
    }
    
    // 验证回调数据（简化版，实际需要验证签名）
    let isValid = false;
    let status = this.paymentStatus.FAILED;
    
    switch (payment.payment_method) {
      case 'alipay':
        isValid = this.verifyAlipayCallback(callbackData);
        status = isValid ? this.paymentStatus.SUCCESS : this.paymentStatus.FAILED;
        break;
      case 'wechat':
        isValid = this.verifyWechatCallback(callbackData);
        status = isValid ? this.paymentStatus.SUCCESS : this.paymentStatus.FAILED;
        break;
      case 'test':
        isValid = true; // 测试支付总是成功
        status = this.paymentStatus.SUCCESS;
        break;
    }
    
    if (isValid) {
      payment.status = status;
      payment.updated_at = new Date().toISOString();
      payment.paid_at = new Date().toISOString();
      payment.transaction_id = callbackData.transaction_id || `tx_${Date.now()}`;
      
      // 更新支付记录
      this.payments.set(paymentId, payment);
      
      return {
        success: true,
        payment_id: paymentId,
        order_id: payment.order_id,
        status: payment.status,
        transaction_id: payment.transaction_id,
        paid_at: payment.paid_at
      };
    } else {
      return {
        success: false,
        error: '支付验证失败',
        payment_id: paymentId
      };
    }
  }

  /**
   * 查询支付状态
   */
  getPaymentStatus(paymentId) {
    const payment = this.payments.get(paymentId);
    if (!payment) {
      throw new Error('支付记录不存在');
    }
    
    return {
      payment_id: paymentId,
      order_id: payment.order_id,
      amount: payment.amount,
      currency: payment.currency,
      payment_method: payment.payment_method,
      status: payment.status,
      created_at: payment.created_at,
      updated_at: payment.updated_at,
      paid_at: payment.paid_at,
      transaction_id: payment.transaction_id
    };
  }

  /**
   * 退款处理
   */
  refundPayment(paymentId, refundAmount, reason = '用户申请退款') {
    const payment = this.payments.get(paymentId);
    if (!payment) {
      throw new Error('支付记录不存在');
    }
    
    if (payment.status !== this.paymentStatus.SUCCESS) {
      throw new Error('只有支付成功的订单才能退款');
    }
    
    if (refundAmount > payment.amount) {
      throw new Error('退款金额不能超过支付金额');
    }
    
    const refundId = `refund_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    payment.status = this.paymentStatus.REFUNDED;
    payment.updated_at = new Date().toISOString();
    payment.refunded_at = new Date().toISOString();
    payment.refund_amount = refundAmount;
    payment.refund_reason = reason;
    payment.refund_id = refundId;
    
    this.payments.set(paymentId, payment);
    
    return {
      success: true,
      refund_id: refundId,
      payment_id: paymentId,
      order_id: payment.order_id,
      refund_amount: refundAmount,
      original_amount: payment.amount,
      status: payment.status,
      refunded_at: payment.refunded_at
    };
  }

  /**
   * 获取所有支付记录（管理用）
   */
  getAllPayments(limit = 100, offset = 0) {
    const allPayments = Array.from(this.payments.values());
    const paginated = allPayments.slice(offset, offset + limit);
    
    return {
      payments: paginated,
      pagination: {
        total: allPayments.length,
        limit: limit,
        offset: offset,
        pages: Math.ceil(allPayments.length / limit)
      }
    };
  }

  /**
   * 生成支付宝签名（简化版）
   */
  generateAlipaySign(params) {
    // 实际实现需要按照支付宝文档生成RSA2签名
    const signStr = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    return crypto.createHash('sha256').update(signStr).digest('hex').substring(0, 32);
  }

  /**
   * 生成微信签名（简化版）
   */
  generateWechatSign(params) {
    const signStr = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    return crypto.createHash('md5').update(signStr + this.config.wechat.apiKey).digest('hex');
  }

  /**
   * 验证支付宝回调（简化版）
   */
  verifyAlipayCallback(callbackData) {
    // 实际实现需要验证支付宝签名
    return callbackData.trade_status === 'TRADE_SUCCESS';
  }

  /**
   * 验证微信回调（简化版）
   */
  verifyWechatCallback(callbackData) {
    // 实际实现需要验证微信签名
    return callbackData.return_code === 'SUCCESS' && callbackData.result_code === 'SUCCESS';
  }

  /**
   * 构建查询字符串
   */
  buildQueryString(params) {
    return Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
  }

  /**
   * 获取支付统计
   */
  getPaymentStats() {
    const allPayments = Array.from(this.payments.values());
    
    const stats = {
      total_payments: allPayments.length,
      total_amount: 0,
      successful_payments: 0,
      successful_amount: 0,
      failed_payments: 0,
      pending_payments: 0,
      by_method: {},
      by_status: {}
    };
    
    allPayments.forEach(payment => {
      stats.total_amount += payment.amount;
      
      // 按状态统计
      stats.by_status[payment.status] = (stats.by_status[payment.status] || 0) + 1;
      
      // 按支付方式统计
      stats.by_method[payment.payment_method] = (stats.by_method[payment.payment_method] || 0) + 1;
      
      // 成功支付统计
      if (payment.status === this.paymentStatus.SUCCESS) {
        stats.successful_payments++;
        stats.successful_amount += payment.amount;
      } else if (payment.status === this.paymentStatus.FAILED) {
        stats.failed_payments++;
      } else if (payment.status === this.paymentStatus.PENDING) {
        stats.pending_payments++;
      }
    });
    
    return stats;
  }
}

// 导出单例
const paymentService = new PaymentService();
module.exports = paymentService;