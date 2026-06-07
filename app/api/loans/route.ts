import { NextRequest, NextResponse } from 'next/server';
import { loanProducts } from '@/lib/loan-products';
import { v4 as uuidv4 } from 'uuid';

// Mock database
const mockLoans: Record<string, unknown> = {};
const mockCustomers: Record<string, unknown> = {};
const mockPayments: Record<string, unknown> = {};

// GET /api/loans - List all loans
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customer_id');
  const status = searchParams.get('status');

  // Simulate filtering
  let results: unknown[] = Object.values(mockLoans);
  
  if (customerId) {
    results = results.filter((loan: unknown) => (loan as Record<string, unknown>).customer_id === customerId);
  }
  if (status) {
    results = results.filter((loan: unknown) => (loan as Record<string, unknown>).status === status);
  }

  return NextResponse.json({
    loans: results,
    total: results.length,
  });
}

// POST /api/loans - Create new loan application
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { customer_id, product_id, amount, tenure_months } = body;

  // Validate product exists
  const product = loanProducts.find(p => p.id === product_id);
  if (!product) {
    return NextResponse.json(
      { error: 'Invalid product ID' },
      { status: 400 }
    );
  }

  // Validate amount
  if (amount < product.min_amount || amount > product.max_amount) {
    return NextResponse.json(
      { error: 'Amount out of valid range' },
      { status: 400 }
    );
  }

  // Validate tenure
  if (tenure_months < product.min_tenure || tenure_months > product.max_tenure) {
    return NextResponse.json(
      { error: 'Tenure out of valid range' },
      { status: 400 }
    );
  }

  const application = {
    application_id: uuidv4(),
    customer_id,
    product_id,
    requested_amount: amount,
    tenure_months,
    status: 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  mockLoans[application.application_id] = application;

  return NextResponse.json(application, { status: 201 });
}