/**
 * Protected Customer API Route
 * Requires authentication with appropriate scope
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, JwtPayload } from '@/lib/middleware';

// Helper to get company ID from request headers
function getCompanyId(request: NextRequest): string {
  return request.headers.get('x-company-id') || 'fintrust';
}

// GET /api/customers - List all customers (requires customer:read scope)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing or invalid authorization header' },
      { status: 401 }
    );
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }

  // Check required scope
  const tokenScopes = payload.scope?.split(' ') || [];
  if (!tokenScopes.includes('customer:read')) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  try {
    const companyId = getCompanyId(request);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;

    const result = await db.listCustomers(companyId, search);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error listing customers:', error);
    return NextResponse.json(
      { error: 'Failed to list customers' },
      { status: 500 }
    );
  }
}

// POST /api/customers - Register new customer (requires customer:write scope)
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing or invalid authorization header' },
      { status: 401 }
    );
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }

  // Check required scope
  const tokenScopes = payload.scope?.split(' ') || [];
  if (!tokenScopes.includes('customer:write')) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  try {
    const companyId = getCompanyId(request);
    const body = await request.json();
    const { first_name, last_name, email, mobile, dob, address, city, state, pincode, kyc_status, risk_score } = body;

    // Basic validation
    if (!first_name || !last_name || !email || !mobile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { v4: uuidv4 } = await import('uuid');
    
    const customer = {
      customer_id: uuidv4(),
      first_name,
      last_name,
      email,
      mobile,
      dob,
      address,
      city,
      state,
      pincode,
      kyc_status: kyc_status || 'pending',
      risk_score,
      company_id: companyId,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await db.createCustomer(customer);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}