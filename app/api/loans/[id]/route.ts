import { NextRequest, NextResponse } from 'next/server';

// Mock database
declare global {
  var mockLoans: Record<string, Record<string, unknown>>;
}

const mockLoans = global.mockLoans || {};

// GET /api/loans/[id] - Get specific loan
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const loan = mockLoans[id];
  
  if (!loan) {
    return NextResponse.json(
      { error: 'Loan not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(loan);
}

// PUT /api/loans/[id] - Update loan application
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const loan = mockLoans[id];

  if (!loan) {
    return NextResponse.json(
      { error: 'Loan not found' },
      { status: 404 }
    );
  }

  mockLoans[id] = {
    ...loan,
    ...body,
    updated_at: new Date().toISOString(),
  };

  return NextResponse.json(mockLoans[id]);
}