import { NextRequest, NextResponse } from 'next/server';
import { db, LoanApplication } from '@/lib/db';

// Helper to get company ID from request headers or defaults
function getCompanyId(request: NextRequest): string {
  const companyId = request.headers.get('x-company-id') || 'fintrust';
  return companyId;
}

// GET /api/loans/[id] - Get specific loan
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const companyId = getCompanyId(request);
    const { id } = await params;
    
    const loan = await db.getLoanApplication(id, companyId);
    
    if (!loan) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(loan);
  } catch (error) {
    console.error('Error getting loan:', error);
    return NextResponse.json(
      { error: 'Failed to get loan' },
      { status: 500 }
    );
  }
}

// PUT /api/loans/[id] - Update loan application
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const companyId = getCompanyId(request);
    const { id } = await params;
    const body = await request.json();
    
    const loan = await db.getLoanApplication(id, companyId);

    if (!loan) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      );
    }

    const updatedLoan: LoanApplication = {
      ...loan,
      ...body,
      updated_at: new Date(),
    };

    // Re-insert for now (in production, implement UPDATE query)
    await db.query('DELETE FROM loan_applications WHERE application_id = $1', [id]);
    const result = await db.createLoanApplication(updatedLoan);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating loan:', error);
    return NextResponse.json(
      { error: 'Failed to update loan' },
      { status: 500 }
    );
  }
}