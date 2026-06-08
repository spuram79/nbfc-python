/**
 * Underwriting Engine API
 * Handles risk assessment, document verification, and decision making
 */

import { NextRequest, NextResponse } from 'next/server';
import { db, LoanApplication } from '@/lib/db';

// Helper to get company ID from request headers
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

// Calculate interest rate based on risk score and product
function calculateInterestRate(application: LoanApplication, score: number): number {
  const baseRate = 12; // Base interest rate
  const riskPremium = (100 - score) / 10; // Higher risk = higher rate
  return baseRate + riskPremium;
}

// POST /api/underwriting - Run full underwriting assessment
export async function POST(request: NextRequest) {
  try {
    const companyId = getCompanyId(request);
    const body = await request.json();
    const { loan_id, application_id, trigger } = body;

    // Get the loan application
    const application = application_id 
      ? await db.getLoanApplication(application_id, companyId)
      : await db.getLoan(loan_id, companyId);

    if (!application) {
      return NextResponse.json(
        { error: 'Loan application not found' },
        { status: 404 }
      );
    }

    // Calculate underwriting score
    const score = calculateUnderwritingScore(application as LoanApplication);
    const decision = score >= 70 ? 'APPROVE' : 'REJECT';
    const interestRate = calculateInterestRate(application as LoanApplication, score);

    // Update application with underwriting results
    const updatedApplication: LoanApplication = {
      ...application as LoanApplication,
      underwriting_status: decision === 'APPROVE' ? 'approved' : 'rejected',
      underwriting_score: score,
      interest_rate: interestRate,
      updated_at: new Date(),
    };

    await db.query('DELETE FROM loan_applications WHERE application_id = $1', [application.application_id]);
    await db.createLoanApplication(updatedApplication);

    // Log the underwriting decision
    await db.createAuditLog({
      entity_type: 'loan',
      entity_id: application.application_id,
      action: 'underwriting_complete',
      performed_by: 'system',
      company_id: companyId,
      after_data: {
        decision,
        score,
        interest_rate: interestRate,
        trigger,
      },
    });

    return NextResponse.json({
      success: true,
      loan_application_id: application.application_id,
      decision,
      score,
      interest_rate: interestRate,
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

// GET /api/underwriting/scorecard - Get risk scorecard
export async function GET(request: NextRequest) {
  try {
    const companyId = getCompanyId(request);
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('application_id');

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Missing application_id parameter' },
        { status: 400 }
      );
    }

    const application = await db.getLoanApplication(applicationId, companyId);
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const score = application.underwriting_score || calculateUnderwritingScore(application);
    const decision = score >= 70 ? 'APPROVE' : 'REJECT';

    // Calculate score breakdown
    const breakdown = {
      base_score: 50,
      amount_factor: application.requested_amount < 100000 ? 20 : application.requested_amount < 500000 ? 10 : 0,
      tenure_factor: application.tenure_months <= 12 ? 15 : application.tenure_months <= 36 ? 10 : 0,
      status_bonus: application.status === 'submitted' ? 5 : 0,
      total_score: score,
      decision,
    };

    return NextResponse.json({
      application_id: applicationId,
      score_breakdown: breakdown,
      risk_category: score >= 80 ? 'Low' : score >= 60 ? 'Medium' : score >= 40 ? 'High' : 'Very High',
    });
  } catch (error) {
    console.error('Error fetching scorecard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scorecard' },
      { status: 500 }
    );
  }
}