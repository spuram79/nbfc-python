import { NextRequest, NextResponse } from 'next/server';

// Mock database
const mockLoans: Record<string, Record<string, unknown>> = {};

// GET /api/loans/[id] - Get specific loan
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const loan = mockLoans[params.id];
  
  if (!loan) {
    return NextResponse.json(
      { error: 'Loan not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(loan);
}

// POST /api/loans/[id]/underwrite - Trigger underwriting
export async function POST_underwrite(request: NextRequest, { params }: { params: { id: string } }) {
  const loan = mockLoans[params.id];
  
  if (!loan) {
    return NextResponse.json(
      { error: 'Loan not found' },
      { status: 404 }
    );
  }

  // Mock underwriting logic
  const score = Math.floor(Math.random() * 100) + 1;
  const decision = score >= 70 ? 'APPROVE' : 'REJECT';

  mockLoans[params.id] = {
    ...loan,
    underwriting_status: decision === 'APPROVE' ? 'approved' : 'rejected',
    underwriting_score: score,
    updated_at: new Date().toISOString(),
  };

  return NextResponse.json({
    decision,
    score,
  });
}

// POST /api/loans/[id]/disburse - Initiate disbursement
export async function POST_disburse(request: NextRequest, { params }: { params: { id: string } }) {
  const loan = mockLoans[params.id];
  
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
  mockLoans[params.id] = {
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