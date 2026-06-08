/**
 * Loan Closure API
 * Handles loan completion, pre-closure, and closure documentation
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';

// Helper to get company ID from request headers
function getCompanyId(request: NextRequest): string {
  const companyId = request.headers.get('x-company-id') || 'fintrust';
  return companyId;
}

// POST /api/loans/[id]/close - Close a loan (natural closure, pre-closure, or foreclosure)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const companyId = getCompanyId(request);
    const { id } = await params;
    const body = await request.json();
    const { action, amount, reason, notes } = body;

    // Get the loan
    const loan = await db.getLoan(id, companyId);
    if (!loan) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      );
    }

    if (action === 'closure') {
      // Calculate final settlement amount
      const schedules = await db.listLoanSchedules(id);
      let totalPending = 0;
      for (const schedule of schedules) {
        totalPending += parseFloat(schedule.total_payment) - parseFloat(schedule.paid_amount);
      }

      const closureAmount = amount || totalPending;
      
      // Close the loan
      await db.closeLoan(id, new Date());
      
      // Generate closure certificate
      const certificate = {
        certificate_id: uuidv4(),
        loan_id: id,
        customer_id: loan.customer_id || '',
        closure_date: new Date(),
        closure_amount: closureAmount,
        outstanding_clearance: closureAmount - totalPending,
        status: 'settled',
        issued_at: new Date(),
      };

      // Log the closure
      await db.createAuditLog({
        entity_type: 'loan',
        entity_id: id,
        action: 'loan_closure',
        performed_by: 'system',
        company_id: companyId,
        after_data: { action, amount: closureAmount, reason, notes },
      });

      return NextResponse.json({
        success: true,
        message: 'Loan closed successfully',
        certificate,
      });
    }

    if (action === 'pre_closure') {
      // Pre-closure with possible processing fee
      const processingFee = (amt: number) => amt * 0.02; // 2% fee
      const totalAmount = amount + processingFee(amount);

      await db.closeLoan(id, new Date());

      return NextResponse.json({
        success: true,
        message: 'Loan pre-closed successfully',
        amount: amount,
        processing_fee: processingFee(amount),
        total_paid: totalAmount,
      });
    }

    if (action === 'write_off') {
      // Mark loan as written off (NPA)
      await db.markLoanAsNpa(id);

      await db.createAuditLog({
        entity_type: 'loan',
        entity_id: id,
        action: 'loan_write_off',
        performed_by: 'system',
        company_id: companyId,
        after_data: { reason, notes },
      });

      return NextResponse.json({
        success: true,
        message: 'Loan written off successfully',
        loan_id: id,
      });
    }

    return NextResponse.json(
      { error: `Unknown action: ${action}` },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error closing loan:', error);
    return NextResponse.json(
      { error: 'Failed to close loan' },
      { status: 500 }
    );
  }
}