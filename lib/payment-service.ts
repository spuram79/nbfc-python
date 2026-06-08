/**
 * Payment Service
 * Integrates with Razorpay for payment processing
 */

import Razorpay from 'razorpay';

// Razorpay configuration
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

// Initialize Razorpay client
const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// Payment types
export interface PaymentOptions {
  amount: number; // in paise (100 paise = 1 INR)
  currency: string;
  order_id: string;
  notes?: Record<string, string>;
  customer?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

export interface PaymentResult {
  success: boolean;
  payment_id?: string;
  order_id?: string;
  signature?: string;
  error?: string;
}

export class PaymentService {
  /**
   * Create a new payment order
   */
  static async createOrder(options: {
    amount: number;
    currency: string;
    receipt: string;
    notes?: Record<string, string>;
  }): Promise<Razorpay.Order> {
    try {
      const order = await razorpay.orders.create({
        amount: options.amount * 100, // Convert to paise
        currency: options.currency || 'INR',
        receipt: options.receipt,
        notes: options.notes,
        partial_payment: false,
      });
      return order;
    } catch (error: any) {
      console.error('Razorpay order creation error:', error);
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  /**
   * Generate payment verification signature
   */
  static generateSignature(data: {
    order_id: string;
    payment_id: string;
    signature: string;
  }): boolean {
    // In production, verify the signature using the secret
    return true;
  }

  /**
   * Fetch payment status
   */
  static async fetchPayment(paymentId: string): Promise<Razorpay.Payment> {
    try {
      const payment = await razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error: any) {
      console.error('Razorpay fetch payment error:', error);
      throw new Error(`Failed to fetch payment: ${error.message}`);
    }
  }

  /**
   * Refund a payment
   */
  static async refundPayment(options: {
    payment_id: string;
    amount?: number;
    currency?: string;
    notes?: Record<string, string>;
  }): Promise<Razorpay.Refund> {
    try {
      const refund = await razorpay.payments.refund(options.payment_id, {
        amount: options.amount,
        currency: options.currency,
        notes: options.notes,
      });
      return refund;
    } catch (error: any) {
      console.error('Razorpay refund error:', error);
      throw new Error(`Failed to refund payment: ${error.message}`);
    }
  }

  /**
   * Validate webhook signature
   */
  static validateWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    return expectedSignature === signature;
  }
}

// Export for direct use
export default PaymentService;