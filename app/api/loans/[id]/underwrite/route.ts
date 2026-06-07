import { NextRequest, NextResponse } from 'next/server';

// Mock database (shared with parent route)
declare global {
  var mockLoans: Record<string, Record<string, unknown>>;
}

const mockLoans = global.mockLoans || {};

// POST /api/loans/[id]/underwrite - Trigger underwriting
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const loan = mockLoans[id];
  
  if (!loan) {
    return NextResponse.json(
      { error: 'Loan not found' },
      { status: 404 }
    );
  }

  // Mock underwriting logic
  const score = Math.floor(Math.random() * 100) + 1;
  const decision = score >= 70 ? 'APPROVE' : 'REJECT';

  mockLoans[id] = {
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