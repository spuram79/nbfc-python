/**
 * NPA Management API
 * Handles write-off, legal recovery, and provision booking
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Helper to get company ID from request headers
function getCompanyId(request: NextRequest): string {
  const companyId = request.headers.get('x-company-id') || 'fintrust';
  return companyId;
}

// POST /api/loans/[id]/writeoff - Write-off a loan as NPA
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const companyId = getCompanyId(request);
    const { id } = await params;
    const body = await request.json();
    const { reason, provision_percentage } = body;

    // Get the loan
    const loan = await db.getLoan(id, companyId);
    if (!loan) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      );
    }

    // Calculate provision amount
    const principalAmount = loan.actual_amount || 0;
    const provisionAmount = principalAmount * (provision_percentage || 0.5) / 100;

    // Mark loan as NPA
    await db.markLoanAsNpa(id);

    // Log the write-off
    await db.createAuditLog({
      entity_type: 'loan',
      entity_id: id,
      action: 'loan_write_off',
      performed_by: 'system',
      company_id: companyId,
      after_data: {
        reason,
        provision_amount: provisionAmount,
        provision_percentage: provision_percentage || 0.5,
        status: 'npa',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Loan written off and classified as NPA',
      loan_id: id,
      provision_amount: provisionAmount,
      status: 'npa',
    });
  } catch (error) {
    console.error('Error writing off loan:', error);
    return NextResponse.json(
      { error: 'Failed to write off loan' },
      { status: 500 }
    );
  }
}

// GET /api/loans/[id]/writeoff - Get write-off details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const companyId = getCompanyId(request);
    const { id } = await params;

    // Get loan details
    const loan = await db.getLoan(id, companyId);
    if (!loan) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      );
    }

    // Get audit logs for write-off
    const logs = await db.listAuditLogs(companyId, 'loan', id);
    const writeOffLog = logs.find(log => log.action === 'loan_write_off');

    return NextResponse.json({
      loan_id: id,
      status: loan.status,
      write_off_details: writeOffLog?.after_data || null,
    });
  } catch (error) {
    console.error('Error fetching write-off details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch write-off details' },
      { status: 500 }
    );
  }
}