import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import { loanProducts } from '@/lib/loan-products';

// Helper to get company ID from request headers
function getCompanyId(request: NextRequest): string {
  const companyId = request.headers.get('x-company-id') || 'fintrust';
  return companyId;
}

// POST /api/loans/[id]/disburse - Initiate loan disbursement
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const companyId = getCompanyId(request);
    const { id } = await params;
    const body = await request.json();
    const { amount, disbursement_date } = body;

    // Get the loan application
    const loanApp = await db.getLoanApplication(id, companyId);
    if (!loanApp) {
      return NextResponse.json(
        { error: 'Loan application not found' },
        { status: 404 }
      );
    }

    // Check if already approved
    if (loanApp.underwriting_status !== 'approved') {
      return NextResponse.json(
        { error: 'Loan not approved for disbursement' },
        { status: 400 }
      );
    }

    // Get product details
    const product = loanProducts.find(p => p.id === loanApp.product_id);
    if (!product) {
      return NextResponse.json(
        { error: 'Invalid loan product' },
        { status: 400 }
      );
    }

    // Use requested amount if no specific amount provided
    const disbursementAmount = amount || loanApp.requested_amount;
    const disbursementDate = disbursement_date ? new Date(disbursement_date) : new Date();

    // Create loan record
    const loanId = uuidv4();
    await db.createLoan({
      loan_id: loanId,
      application_id: id,
      disbursement_date: disbursementDate,
      actual_amount: disbursementAmount,
      status: 'active',
      company_id: companyId,
    });

    // Generate repayment schedule
    const interestRate = loanApp.interest_rate || 0;
    const tenureMonths = loanApp.tenure_months;
    const monthlyInterestRate = interestRate / 12 / 100;
    
    for (let i = 1; i <= tenureMonths; i++) {
      const dueDate = new Date(disbursementDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      const monthlyPayment = (disbursementAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, tenureMonths)) / 
                             (Math.pow(1 + monthlyInterestRate, tenureMonths) - 1);
      const principalPerInstallment = disbursementAmount / tenureMonths;
      const interestPerInstallment = monthlyPayment - principalPerInstallment;

      await db.createLoanSchedule({
        schedule_id: uuidv4(),
        loan_id: loanId,
        installment_no: i,
        due_date: dueDate,
        principal: principalPerInstallment,
        interest: interestPerInstallment,
        total_payment: monthlyPayment,
        status: 'pending',
      });
    }

    // Update application status
    await db.query(
      'UPDATE loan_applications SET status = $1, underwriting_status = $2 WHERE application_id = $3',
      ['disbursed', 'approved', id]
    );

    return NextResponse.json({
      success: true,
      loan_id: loanId,
      disbursement_date: disbursementDate,
      amount: disbursementAmount,
      schedules_generated: tenureMonths,
    });
  } catch (error) {
    console.error('Error disbursing loan:', error);
    return NextResponse.json(
      { error: 'Failed to disburse loan' },
      { status: 500 }
    );
  }
}