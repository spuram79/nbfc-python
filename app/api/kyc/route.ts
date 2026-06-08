/**
 * KYC Verification API
 * Handles KYC status verification, risk scoring, and compliance
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Helper to get company ID from request headers
function getCompanyId(request: NextRequest): string {
  return request.headers.get('x-company-id') || 'fintrust';
}

// GET /api/kyc - Get KYC status for customers
export async function GET(request: NextRequest) {
  try {
    const companyId = getCompanyId(request);
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customer_id') || undefined;
    const status = searchParams.get('status') || undefined;

    let query = 'SELECT * FROM customers WHERE company_id = $1';
    const params: unknown[] = [companyId];
    let paramIndex = 2;

    if (customerId) {
      query += ` AND customer_id = $${paramIndex++}`;
      params.push(customerId);
    }

    if (status) {
      query += ` AND kyc_status = $${paramIndex++}`;
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);

    return NextResponse.json({
      customers: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error('Error fetching KYC status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KYC status' },
      { status: 500 }
    );
  }
}

// POST /api/kyc/verify - Verify KYC for a customer
export async function POST(request: NextRequest) {
  try {
    const companyId = getCompanyId(request);
    const body = await request.json();
    const { customer_id, document_data } = body;

    if (!customer_id) {
      return NextResponse.json(
        { error: 'Missing customer_id' },
        { status: 400 }
      );
    }

    // Get customer
    const customer = await db.getCustomer(customer_id, companyId);
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Calculate risk score based on KYC verification
    let riskScore = 50; // Base score
    if (document_data?.id_verified) riskScore += 20;
    if (document_data?.address_verified) riskScore += 15;
    if (document_data?.income_verified) riskScore += 25;
    if (document_data?.pan_verified) riskScore += 20;

    // Determine KYC status
    const kycStatus = riskScore >= 80 ? 'verified' : riskScore >= 50 ? 'pending' : 'rejected';

    // Update customer KYC status
    await db.query(
      'UPDATE customers SET kyc_status = $1, risk_score = $2, updated_at = NOW() WHERE customer_id = $3',
      [kycStatus, riskScore, customer_id]
    );

    // Log the KYC verification
    await db.createAuditLog({
      entity_type: 'customer',
      entity_id: customer_id,
      action: 'kyc_verification',
      performed_by: 'system',
      company_id: companyId,
      after_data: { kyc_status: kycStatus, risk_score: riskScore, document_data },
    });

    return NextResponse.json({
      success: true,
      customer_id,
      kyc_status: kycStatus,
      risk_score: riskScore,
    });
  } catch (error) {
    console.error('Error verifying KYC:', error);
    return NextResponse.json(
      { error: 'Failed to verify KYC' },
      { status: 500 }
    );
  }
}