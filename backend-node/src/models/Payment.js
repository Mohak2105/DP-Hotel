const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Payment {
  // Payment methods enum
  static PAYMENT_METHODS = {
    GOOGLE_PAY: 'google_pay',
    PHONE_PAY: 'phone_pay',
    CREDIT_CARD: 'credit_card',
    DEBIT_CARD: 'debit_card',
    NET_BANKING: 'net_banking',
    UPI: 'upi',
    CASH: 'cash'
  };

  // Payment status enum
  static PAYMENT_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded'
  };

  // Create payment
  static async create(paymentData) {
    const id = uuidv4();
    const { 
      bookingId, 
      userId, 
      amount, 
      paymentMethod, 
      cardLastFour, 
      cardBrand, 
      upiId 
    } = paymentData;

    await pool.query(
      `INSERT INTO payments (id, booking_id, user_id, amount, payment_method, card_last_four, card_brand, upi_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, bookingId, userId, amount, paymentMethod, cardLastFour || null, cardBrand || null, upiId || null]
    );

    return this.findById(id);
  }

  // Find payment by ID
  static async findById(id) {
    const [rows] = await pool.query(`
      SELECT p.*, 
             b.check_in_date, b.check_out_date, b.status as booking_status,
             u.email as user_email, u.first_name as user_first_name, u.last_name as user_last_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [id]);
    return rows[0] || null;
  }

  // Find payment by booking ID
  static async findByBooking(bookingId) {
    const [rows] = await pool.query('SELECT * FROM payments WHERE booking_id = ?', [bookingId]);
    return rows[0] || null;
  }

  // Find payments by user
  static async findByUser(userId) {
    const [rows] = await pool.query(`
      SELECT p.*, b.check_in_date, b.check_out_date, r.room_number, r.name as room_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN rooms r ON b.room_id = r.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `, [userId]);
    return rows;
  }

  // Update payment status
  static async updateStatus(id, status, transactionId = null, gatewayResponse = null) {
    const updates = ['payment_status = ?'];
    const params = [status];

    if (transactionId) {
      updates.push('transaction_id = ?');
      params.push(transactionId);
    }

    if (gatewayResponse) {
      updates.push('payment_gateway_response = ?');
      params.push(JSON.stringify(gatewayResponse));
    }

    if (status === this.PAYMENT_STATUS.COMPLETED) {
      updates.push('paid_at = CURRENT_TIMESTAMP');
    }

    params.push(id);

    await pool.query(`UPDATE payments SET ${updates.join(', ')} WHERE id = ?`, params);
    return this.findById(id);
  }

  // Process payment (simulated gateway integration)
  static async processPayment(paymentId, paymentDetails) {
    const payment = await this.findById(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    // Update status to processing
    await this.updateStatus(paymentId, this.PAYMENT_STATUS.PROCESSING);

    // Simulate payment gateway processing
    // In production, this would integrate with actual payment gateways
    const success = await this.simulateGatewayProcess(payment, paymentDetails);

    if (success) {
      const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      return await this.updateStatus(
        paymentId, 
        this.PAYMENT_STATUS.COMPLETED, 
        transactionId,
        { gateway: payment.payment_method, status: 'success', timestamp: new Date().toISOString() }
      );
    } else {
      return await this.updateStatus(
        paymentId, 
        this.PAYMENT_STATUS.FAILED,
        null,
        { gateway: payment.payment_method, status: 'failed', error: 'Payment declined' }
      );
    }
  }

  // Simulate payment gateway processing
  static async simulateGatewayProcess(payment, paymentDetails) {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For demo purposes, always return success
    // In production, this would call actual payment gateway APIs
    switch (payment.payment_method) {
      case this.PAYMENT_METHODS.GOOGLE_PAY:
        return this.processGooglePay(paymentDetails);
      case this.PAYMENT_METHODS.PHONE_PAY:
        return this.processPhonePay(paymentDetails);
      case this.PAYMENT_METHODS.CREDIT_CARD:
      case this.PAYMENT_METHODS.DEBIT_CARD:
        return this.processCard(paymentDetails);
      case this.PAYMENT_METHODS.UPI:
        return this.processUPI(paymentDetails);
      case this.PAYMENT_METHODS.NET_BANKING:
        return this.processNetBanking(paymentDetails);
      case this.PAYMENT_METHODS.CASH:
        return true; // Cash payments are always successful
      default:
        return true;
    }
  }

  // Simulated Google Pay processing
  static async processGooglePay(details) {
    console.log('Processing Google Pay payment...');
    return true;
  }

  // Simulated PhonePe processing
  static async processPhonePay(details) {
    console.log('Processing PhonePe payment...');
    return true;
  }

  // Simulated Card processing
  static async processCard(details) {
    console.log('Processing Card payment...');
    // Validate card details in production
    return true;
  }

  // Simulated UPI processing
  static async processUPI(details) {
    console.log('Processing UPI payment...');
    return true;
  }

  // Simulated Net Banking processing
  static async processNetBanking(details) {
    console.log('Processing Net Banking payment...');
    return true;
  }

  // Refund payment
  static async refund(paymentId, reason = null) {
    const payment = await this.findById(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.payment_status !== this.PAYMENT_STATUS.COMPLETED) {
      throw new Error('Can only refund completed payments');
    }

    return await this.updateStatus(
      paymentId,
      this.PAYMENT_STATUS.REFUNDED,
      null,
      { refund_reason: reason, refunded_at: new Date().toISOString() }
    );
  }

  // Get all payments (admin)
  static async findAll(filters = {}) {
    let query = `
      SELECT p.*, 
             u.email as user_email, u.first_name as user_first_name, u.last_name as user_last_name,
             b.check_in_date, b.check_out_date
      FROM payments p
      JOIN users u ON p.user_id = u.id
      JOIN bookings b ON p.booking_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      query += ' AND p.payment_status = ?';
      params.push(filters.status);
    }

    if (filters.method) {
      query += ' AND p.payment_method = ?';
      params.push(filters.method);
    }

    if (filters.fromDate) {
      query += ' AND DATE(p.created_at) >= ?';
      params.push(filters.fromDate);
    }

    if (filters.toDate) {
      query += ' AND DATE(p.created_at) <= ?';
      params.push(filters.toDate);
    }

    query += ' ORDER BY p.created_at DESC';

    const [rows] = await pool.query(query, params);
    return rows;
  }

  // Get payment statistics (admin)
  static async getStats() {
    const [rows] = await pool.query(`
      SELECT 
        COUNT(*) as total_payments,
        SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END) as total_collected,
        SUM(CASE WHEN payment_status = 'pending' THEN amount ELSE 0 END) as pending_amount,
        SUM(CASE WHEN payment_status = 'refunded' THEN amount ELSE 0 END) as refunded_amount,
        COUNT(CASE WHEN payment_method = 'google_pay' THEN 1 END) as google_pay_count,
        COUNT(CASE WHEN payment_method = 'phone_pay' THEN 1 END) as phone_pay_count,
        COUNT(CASE WHEN payment_method = 'credit_card' THEN 1 END) as credit_card_count,
        COUNT(CASE WHEN payment_method = 'debit_card' THEN 1 END) as debit_card_count,
        COUNT(CASE WHEN payment_method = 'upi' THEN 1 END) as upi_count,
        COUNT(CASE WHEN payment_method = 'net_banking' THEN 1 END) as net_banking_count,
        COUNT(CASE WHEN payment_method = 'cash' THEN 1 END) as cash_count
      FROM payments
    `);
    return rows[0];
  }

  // Get available payment methods
  static getAvailablePaymentMethods() {
    return [
      { id: 'upi_qr', name: 'Scan & Pay (UPI)', icon: 'upi', type: 'upi_qr' },
      { id: 'pay_at_hotel', name: 'Pay at Hotel', icon: 'cash', type: 'cash' }
    ];
  }
}

module.exports = Payment;
