/**
 * Loan Schedule API Route
 * Handles repayment schedule generation and management
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';

// Helper to get company ID
function getCompanyId(request: NextRequest): string {
  return request.headers.get('x-company-id') || 'fintrust';
}

// GET /api/schedules - List schedules for a loan
export async function GET(request: NextRequest) {
  try {
    const companyId = getCompanyId(request);
    const { searchParams } = new URL(request.url);
    const loanId = searchParams.get('loan_id');

    if (!loanId) {
      return NextResponse.json(
        { error: 'loan_id is required' },
        { status: 400 }
      );
    }

    const schedules = await db.listLoanSchedules(loanId);
    const total = schedules.length;
    const paidAmount = schedules.reduce((sum, s: any) => sum + (s.paid_amount || 0), 0);
    const totalAmount = schedules.reduce((sum, s: any) => sum + (s.total_payment || 0), 0);

    return NextResponse.json({
      schedules,
      summary: {
        total,
        total_amount: totalAmount,
        paid_amount: paidAmount,
        pending_amount: totalAmount - paidAmount,
        completion_rate: totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0,
      },
    });
  } catch (error) {
    console.error('Error listing schedules:', error);
    return NextResponse.json(
      { error: 'Failed to list schedules' },
      { status: 500 }
    );
  }
}

// POST /api/schedules/generate - Generate repayment schedule
export async function POST(request: NextRequest) {
  try {
    const companyId = getCompanyId(request);
    const body = await request.json();
    const { loan_id, amount, interest_rate, tenure_months, disbursement_date } = body;

    if (!loan_id || !amount || !tenure_months) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const schedules = [];
    const disbursementDate = new Date(disbursement_date || new Date());
    const monthlyInterestRate = (interest_rate || 0) / 12 / 100;
    
    // Calculate EMI
    const emi = (amount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, tenure_months)) / 
                (Math.pow(1 + monthlyInterestRate, tenure_months) - 1);

    const principalPerInstallment = amount / tenure_months;

    for (let i = 1; i <= tenure_months; i++) {
      const dueDate = new Date(disbursementDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      const interestPerInstallment = emi - principalPerInstallment;

      const schedule = await db.createLoanSchedule({
        schedule_id: uuidv4(),
        loan_id,
        installment_no: i,
        due_date: dueDate,
        principal: Math.round(principalPerInstallment * 100) / 100,
        interest: Math.round(interestPerInstallment * 100) / 100,
        total_payment: Math.round(emi * 100) / 100,
        status: 'pending',
        paid_amount: 0,
      });
      
      schedules.push(schedule);
    }

    return NextResponse.json({
      success: true,
      loan_id,
      schedules_generated: tenure_months,
      emi: Math.round(emi * 100) / 100,
      schedules,
    });
  } catch (error) {
    console.error('Error generating schedules:', error);
    return NextResponse.json(
      { error: 'Failed to generate schedules' },
      { status: 500 }
    );
  }
}