import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Mock database
const mockPayments: Record<string, Record<string, unknown>> = {};
const mockLoans: Record<string, Record<string, unknown>> = {};

// GET /api/payments - List all payments for a loan
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const loanId = searchParams.get('loan_id');

  if (loanId) {
    const payments = Object.values(mockPayments).filter(
      (payment: Record<string, unknown>) => payment.loan_id === loanId
    );
    return NextResponse.json({ payments, total: payments.length });
  }

  const payments = Object.values(mockPayments);
  return NextResponse.json({ payments, total: payments.length });
}

// POST /api/payments - Create new payment
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { loan_id, amount, method, schedule_id } = body;

  if (!loan_id || !amount || !method) {
    return NextResponse.json(
      { error: 'Missing required fields: loan_id, amount, method' },
      { status: 400 }
    );
  }

  const loan = mockLoans[loan_id];
  if (!loan) {
    return NextResponse.json(
      { error: 'Loan not found' },
      { status: 404 }
    );
  }

  const payment = {
    payment_id: uuidv4(),
    loan_id,
    amount,
    method,
    status: 'success',
    transaction_date: new Date().toISOString(),
    reference_number: `TXN${Date.now()}`,
    schedule_id,
    created_at: new Date().toISOString(),
  };

  mockPayments[payment.payment_id] = payment;

  // Update loan balance (mock)
  if (loan.remaining_balance) {
    mockLoans[loan_id].remaining_balance = 
      (loan.remaining_balance as number) - amount;
  }

  return NextResponse.json(payment, { status: 201 });
}

// GET /api/payments/[id] - Get specific payment
export async function GET_payment(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const payment = mockPayments[params.id];

  if (!payment) {
    return NextResponse.json(
      { error: 'Payment not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(payment);
}

// DELETE /api/payments/[id] - Refund payment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const payment = mockPayments[params.id];

  if (!payment) {
    return NextResponse.json(
      { error: 'Payment not found' },
      { status: 404 }
    );
  }

  mockPayments[params.id].status = 'refunded';

  return NextResponse.json({
    success: true,
    message: 'Payment refunded successfully',
  });
}