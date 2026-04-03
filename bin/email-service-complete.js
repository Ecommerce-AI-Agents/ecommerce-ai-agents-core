/**
 * 电商AI Agents邮件通知服务（完整版）
 */

class EmailService {
  constructor() {
    // 邮件配置
    this.config = {
      enabled: true,
      from: {
        name: '电商AI Agents系统',
        email: 'noreply@ecommerce-ai-agents.org'
      }
    };
    
    // 邮件模板（续接）
    this.templates = {
      // 续接之前的模板...
    };
    
    // 邮件队列
    this.emailQueue = [];
    this.isProcessing = false;
  }
  
  /**
   * 发送邮件
   */
  async sendEmail(templateName, to, data) {
    if (!this.config.enabled) {
      console.log(`[邮件模拟] ${templateName} 发送给 ${to}`);
      return { success: true, simulated: true };
    }
    
    const template = this.templates[templateName];
    if (!template) {
      throw new Error(`邮件模板不存在: ${templateName}`);
    }
    
    // 替换模板变量
    let subject = template.subject;
    let html = template.html;
    
    for (const [key, value] of Object.entries(data)) {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
      html = html.replace(new RegExp(placeholder, 'g'), value);
    }
    
    // 添加到队列
    const emailJob = {
      id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      template: templateName,
      to: to,
      subject: subject,
      html: html,
      data: data,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    this.emailQueue.push(emailJob);
    
    // 异步处理队列
    this.processQueue();
    
    return {
      success: true,
      email_id: emailJob.id,
      to: to,
      subject: subject,
      status: 'queued'
    };
  }
  
  /**
   * 处理邮件队列
   */
  async processQueue() {
    if (this.isProcessing || this.emailQueue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    while (this.emailQueue.length > 0) {
      const emailJob = this.emailQueue.shift();
      
      try {
        emailJob.status = 'sending';
        
        // 模拟发送（实际应调用邮件服务）
        console.log(`[邮件发送] ${emailJob.template} -> ${emailJob.to}`);
        console.log(`主题: ${emailJob.subject}`);
        
        // 模拟延迟
        await new Promise(resolve => setTimeout(resolve, 100));
        
        emailJob.status = 'sent';
        emailJob.sent_at = new Date().toISOString();
        
        console.log(`[邮件成功] ${emailJob.id} 发送完成`);
      } catch (error) {
        emailJob.status = 'failed';
        emailJob.error = error.message;
        console.error(`[邮件失败] ${emailJob.id}: ${error.message}`);
      }
    }
    
    this.isProcessing = false;
  }
  
  /**
   * 发送订单确认邮件
   */
  async sendOrderConfirmation(order, customer) {
    const data = {
      order_number: order.order_number,
      order_date: new Date(order.created_at).toLocaleString('zh-CN'),
      customer_name: customer.name || customer.email.split('@')[0],
      customer_phone: customer.phone || '未提供',
      shipping_address: order.shipping_address || '待填写',
      products: order.items.map(item => ({
        name: item.product_name,
        quantity: item.quantity,
        price: item.unit_price,
        subtotal: item.total
      })),
      total_amount: order.total_amount,
      shipping_fee: order.shipping_fee || 0,
      final_amount: order.total_amount,
      shipping_method: order.shipping_method || '标准配送',
      estimated_delivery: '3-5个工作日',
      order_tracking_url: `http://localhost:9000/orders/${order.id}`,
      shop_url: 'http://localhost:9000'
    };
    
    return this.sendEmail('order_confirmation', customer.email, data);
  }
  
  /**
   * 发送发货通知邮件
   */
  async sendShippingNotification(order, customer, trackingInfo) {
    const data = {
      order_number: order.order_number,
      shipping_company: trackingInfo.company || '顺丰速运',
      tracking_number: trackingInfo.tracking_number || 'SF1234567890',
      shipping_date: new Date().toLocaleString('zh-CN'),
      estimated_delivery: '1-2个工作日',
      tracking_url: trackingInfo.tracking_url || `https://www.sf-express.com/tracking/${trackingInfo.tracking_number}`
    };
    
    return this.sendEmail('shipping_notification', customer.email, data);
  }
  
  /**
   * 发送密码重置邮件
   */
  async sendPasswordReset(customer, resetToken) {
    const data = {
      customer_name: customer.name || customer.email.split('@')[0],
      reset_url: `http://localhost:9000/reset-password?token=${resetToken}`
    };
    
    return this.sendEmail('password_reset', customer.email, data);
  }
  
  /**
   * 发送欢迎邮件
   */
  async sendWelcomeEmail(customer) {
    const data = {
      customer_name: customer.name || customer.email.split('@')[0],
      customer_email: customer.email,
      registration_date: new Date().toLocaleString('zh-CN'),
      account_type: customer.role === 'admin' ? '管理员' : '普通用户',
      shop_url: 'http://localhost:9000'
    };
    
    return this.sendEmail('welcome_email', customer.email, data);
  }
  
  /**
   * 发送营销邮件
   */
  async sendMarketingEmail(customer, coupon) {
    const data = {
      customer_name: customer.name || customer.email.split('@')[0],
      discount_amount: coupon.discount_amount,
      coupon_code: coupon.code,
      expiry_date: new Date(coupon.expiry_date).toLocaleDateString('zh-CN'),
      min_order_amount: coupon.min_order_amount || 0,
      product1_image: 'https://via.placeholder.com/100',
      product1_name: '智能手表 Ultra Pro',
      product1_price: '1499',
      product2_image: 'https://via.placeholder.com/100',
      product2_name: '降噪耳机 Pro',
      product2_price: '899',
      shop_url: 'http://localhost:9000'
    };
    
    return this.sendEmail('marketing_promotion', customer.email, data);
  }
  
  /**
   * 获取邮件统计
   */
  getEmailStats() {
    const stats = {
      total_queued: this.emailQueue.length,
      total_sent: this.emailQueue.filter(e => e.status === 'sent').length,
      total_failed: this.emailQueue.filter(e => e.status === 'failed').length,
      by_template: {},
      recent_emails: this.emailQueue.slice(-10).reverse()
    };
    
    // 按模板统计
    this.emailQueue.forEach(email => {
      stats.by_template[email.template] = (stats.by_template[email.template] || 0) + 1;
    });
    
    return stats;
  }
  
  /**
   * 获取邮件队列状态
   */
  getQueueStatus() {
    return {
      queue_length: this.emailQueue.length,
      is_processing: this.isProcessing,
      emails: this.emailQueue.map(email => ({
        id: email.id,
        template: email.template,
        to: email.to,
        status: email.status,
        created_at: email.created_at,
        sent_at: email.sent_at
      }))
    };
  }
  
  /**
   * 清理旧邮件记录
   */
  cleanupOldEmails(days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const initialLength = this.emailQueue.length;
    this.emailQueue = this.emailQueue.filter(email => {
      const emailDate = new Date(email.created_at);
      return emailDate > cutoffDate;
    });
    
    return {
      removed: initialLength - this.emailQueue.length,
      remaining: this.emailQueue.length
    };
  }
}

// 导出单例
const emailService = new EmailService();
module.exports = emailService;