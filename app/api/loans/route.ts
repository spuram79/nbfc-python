import { NextRequest, NextResponse } from 'next/server';
import { loanProducts } from '@/lib/loan-products';
import { v4 as uuidv4 } from 'uuid';
import { db, LoanApplication } from '@/lib/db';

// Helper to get company ID from request headers or defaults
function getCompanyId(request: NextRequest): string {
  const companyId = request.headers.get('x-company-id') || 'fintrust';
  return companyId;
}

// GET /api/loans - List all loans
export async function GET(request: NextRequest) {
  try {
    const companyId = getCompanyId(request);
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customer_id') || undefined;
    const status = searchParams.get('status') || undefined;

    const result = await db.listLoans(companyId, { customerId, status });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error listing loans:', error);
    return NextResponse.json(
      { error: 'Failed to list loans' },
      { status: 500 }
    );
  }
}

// POST /api/loans - Create new loan application
export async function POST(request: NextRequest) {
  try {
    const companyId = getCompanyId(request);
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

    const application: LoanApplication = {
      application_id: uuidv4(),
      customer_id,
      product_id,
      requested_amount: amount,
      tenure_months,
      status: 'draft',
      company_id: companyId,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await db.createLoanApplication(application);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating loan application:', error);
    return NextResponse.json(
      { error: 'Failed to create loan application' },
      { status: 500 }
    );
  }
}