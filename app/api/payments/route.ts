import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { db, Payment } from '@/lib/db';

// Helper to get company ID from request headers or defaults
function getCompanyId(request: NextRequest): string {
  const companyId = request.headers.get('x-company-id') || 'fintrust';
  return companyId;
}

// GET /api/payments - List all payments for a loan
export async function GET(request: NextRequest) {
  try {
    const companyId = getCompanyId(request);
    const { searchParams } = new URL(request.url);
    const loanId = searchParams.get('loan_id') || undefined;

    const payments = loanId 
      ? await db.listPayments(companyId, loanId)
      : [];

    return NextResponse.json({ payments, total: payments.length });
  } catch (error) {
    console.error('Error listing payments:', error);
    return NextResponse.json(
      { error: 'Failed to list payments' },
      { status: 500 }
    );
  }
}

// POST /api/payments - Create new payment
export async function POST(request: NextRequest) {
  try {
    const companyId = getCompanyId(request);
    const body = await request.json();
    const { loan_id, amount, method, schedule_id } = body;

    if (!loan_id || !amount || !method) {
      return NextResponse.json(
        { error: 'Missing required fields: loan_id, amount, method' },
        { status: 400 }
      );
    }

    const payment: Payment = {
      payment_id: uuidv4(),
      loan_id,
      amount,
      method,
      status: 'success',
      transaction_date: new Date(),
      reference_number: `TXN${Date.now()}`,
      schedule_id,
      company_id: companyId,
    };

    const result = await db.createPayment(payment);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}

// GET /api/payments/[id] - Get specific payment
export async function GET_payment(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const companyId = getCompanyId(request);
    const { id } = await params;
    
    const payments = await db.listPayments(companyId);
    const payment = payments.find(p => p.payment_id === id);

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error getting payment:', error);
    return NextResponse.json(
      { error: 'Failed to get payment' },
      { status: 500 }
    );
  }
}

// DELETE /api/payments/[id] - Refund payment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // In production, implement refund logic in database
    return NextResponse.json({
      success: true,
      message: 'Payment refund initiated',
    });
  } catch (error) {
    console.error('Error refunding payment:', error);
    return NextResponse.json(
      { error: 'Failed to refund payment' },
      { status: 500 }
    );
  }
}