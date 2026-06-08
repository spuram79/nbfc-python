import { NextRequest, NextResponse } from 'next/server';
import { db, LoanApplication } from '@/lib/db';

// Helper to get company ID from request headers or defaults
function getCompanyId(request: NextRequest): string {
  const companyId = request.headers.get('x-company-id') || 'fintrust';
  return companyId;
}

// Mock underwriting logic (in production, integrate with actual underwriting engine)
function calculateUnderwritingScore(application: LoanApplication): number {
  // Simplified scoring - in production, use ML models and external data
  let score = 50;
  
  // Amount factor (lower amounts = lower risk)
  if (application.requested_amount < 100000) score += 20;
  else if (application.requested_amount < 500000) score += 10;
  
  // Tenure factor (shorter tenures = lower risk)
  if (application.tenure_months <= 12) score += 15;
  else if (application.tenure_months <= 36) score += 10;
  
  // Status check
  if (application.status === 'submitted') score += 5;
  
  return Math.min(100, Math.max(1, score));
}

// POST /api/loans/[id]/underwrite - Trigger underwriting
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const companyId = getCompanyId(request);
    const { id } = await params;
    
    const application = await db.getLoanApplication(id, companyId);
    
    if (!application) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      );
    }

    // Calculate underwriting score
    const score = calculateUnderwritingScore(application);
    const decision = score >= 70 ? 'APPROVE' : 'REJECT';

    // Update application with underwriting results
    const updatedApplication: LoanApplication = {
      ...application,
      underwriting_status: decision === 'APPROVE' ? 'approved' : 'rejected',
      underwriting_score: score,
      updated_at: new Date(),
    };

    await db.query('DELETE FROM loan_applications WHERE application_id = $1', [id]);
    await db.createLoanApplication(updatedApplication);

    return NextResponse.json({
      decision,
      score,
      message: decision === 'APPROVE' 
        ? 'Loan approved for sanction' 
        : 'Loan rejected - contact for details',
    });
  } catch (error) {
    console.error('Error in underwriting:', error);
    return NextResponse.json(
      { error: 'Underwriting process failed' },
      { status: 500 }
    );
  }
}