/**
 * Collections API Routes
 * Handles NPA identification, dunning, and recovery workflows
 */

import { NextRequest, NextResponse } from 'next/server';
import CollectionsService, { CollectionsStatus } from '@/lib/collections-service';

// Helper to get company ID from request headers
function getCompanyId(request: NextRequest): string {
  return request.headers.get('x-company-id') || 'fintrust';
}

// GET /api/collections/overdue - List overdue loans
export async function GET(request: NextRequest) {
  try {
    const companyId = getCompanyId(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as CollectionsStatus | null;

    const overdueLoans = await CollectionsService.identifyOverdueLoans(companyId);
    
    let filtered = overdueLoans;
    if (status) {
      filtered = overdueLoans.filter(loan => loan.status === status);
    }

    return NextResponse.json({
      loans: filtered,
      total: filtered.length,
    });
  } catch (error) {
    console.error('Error listing overdue loans:', error);
    return NextResponse.json(
      { error: 'Failed to list overdue loans' },
      { status: 500 }
    );
  }
}

// POST /api/collections/initiate - Start collections process
export async function POST(request: NextRequest) {
  try {
    const companyId = getCompanyId(request);
    const body = await request.json();
    const { loan_id, action } = body;

    if (!loan_id || !action) {
      return NextResponse.json(
        { error: 'Missing loan_id or action' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'dunning':
        await CollectionsService.initiateDunning(loan_id, companyId);
        break;
      case 'npa_identify':
        // Trigger NPA identification
        console.log(`Identifying NPA for loan ${loan_id}`);
        break;
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Action '${action}' initiated for loan ${loan_id}`,
    });
  } catch (error) {
    console.error('Error initiating collections:', error);
    return NextResponse.json(
      { error: 'Failed to initiate collections' },
      { status: 500 }
    );
  }
}

// GET /api/collections/report - Recovery report
export async function GET_report(request: NextRequest) {
  try {
    const companyId = getCompanyId(request);
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const report = await CollectionsService.generateRecoveryReport(
      companyId,
      startDate,
      endDate
    );

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating recovery report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

// GET /api/collections/npa-ratio - NPA ratio calculation
export async function GET_npaRatio(request: NextRequest) {
  try {
    const companyId = getCompanyId(request);
    const ratio = await CollectionsService.calculateNpaRatio(companyId);

    return NextResponse.json(ratio);
  } catch (error) {
    console.error('Error calculating NPA ratio:', error);
    return NextResponse.json(
      { error: 'Failed to calculate NPA ratio' },
      { status: 500 }
    );
  }
}