import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import PaymentService from '@/lib/payment-service';

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';

// POST /api/webhook - Handle Razorpay webhooks
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-razorpay-signature');
    const body = await request.text();

    // Validate webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);

    // Handle different event types
    switch (event.event) {
      case 'payment.captured':
        // Payment successful - update database
        console.log('Payment captured:', event.payload.payment);
        break;
      
      case 'payment.failed':
        // Payment failed - update status
        console.log('Payment failed:', event.payload.payment);
        break;
      
      case 'order.paid':
        // Order fully paid
        console.log('Order paid:', event.payload.order);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
