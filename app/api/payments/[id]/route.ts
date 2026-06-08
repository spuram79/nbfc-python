import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Helper to get company ID from request headers or defaults
function getCompanyId(request: NextRequest): string {
  const companyId = request.headers.get('x-company-id') || 'fintrust';
  return companyId;
}

// GET /api/payments/[id] - Get specific payment
export async function GET(
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