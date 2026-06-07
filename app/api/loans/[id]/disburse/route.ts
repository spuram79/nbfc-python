import { NextRequest, NextResponse } from 'next/server';

// Mock database (shared with parent route)
declare global {
  var mockLoans: Record<string, Record<string, unknown>>;
}

const mockLoans = global.mockLoans || {};

// POST /api/loans/[id]/disburse - Initiate disbursement
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const loan = mockLoans[id];
  
  if (!loan) {
    return NextResponse.json(
      { error: 'Loan not found' },
      { status: 404 }
    );
  }

  if (loan.underwriting_status !== 'approved') {
    return NextResponse.json(
      { error: 'Loan not approved for disbursement' },
      { status: 400 }
    );
  }

  // Mock disbursement
  mockLoans[id] = {
    ...loan,
    status: 'disbursed',
    disbursement_date: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return NextResponse.json({
    disbursement_id: `disp_${Date.now()}`,
    status: 'PENDING',
    message: 'Disbursement initiated successfully',
  });
}