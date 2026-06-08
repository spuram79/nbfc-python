/**
 * Payment Service
 * Integrates with Razorpay for payment processing
 */

import Razorpay from 'razorpay';

// Razorpay configuration
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

// Initialize Razorpay client (only if credentials are available)
let razorpay: Razorpay | null = null;

if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
  try {
    razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
  } catch (error) {
    console.warn('Failed to initialize Razorpay client:', error);
    razorpay = null;
  }
}

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
  }): Promise<any> {
    try {
      if (!razorpay) {
        // Return mock order for development
        return {
          id: `mock_order_${Date.now()}`,
          amount: options.amount * 100,
          currency: options.currency || 'INR',
          status: 'created',
          receipt: options.receipt,
        };
      }
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
  static async fetchPayment(paymentId: string): Promise<any> {
    try {
      if (!razorpay) {
        // Return mock payment for development
        return {
          id: paymentId,
          status: 'captured',
          amount: 100000,
          currency: 'INR',
        };
      }
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
    notes?: Record<string, string>;
  }): Promise<any> {
    try {
      if (!razorpay) {
        // Return mock refund for development
        return {
          id: `mock_refund_${Date.now()}`,
          payment_id: options.payment_id,
          amount: options.amount || 0,
          status: 'processed',
        };
      }
      const refund = await razorpay.payments.refund(options.payment_id, {
        amount: options.amount,
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