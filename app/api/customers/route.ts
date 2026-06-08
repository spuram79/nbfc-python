import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { db, Customer } from '@/lib/db';

// Helper to get company ID from request headers or defaults
function getCompanyId(request: NextRequest): string {
  // In production, this would come from JWT token or subdomain
  const companyId = request.headers.get('x-company-id') || 'fintrust';
  return companyId;
}

// GET /api/customers - List all customers
export async function GET(request: NextRequest) {
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

// POST /api/customers - Register new customer
export async function POST(request: NextRequest) {
  try {
    const companyId = getCompanyId(request);
    const body = await request.json();
    const { first_name, last_name, email, mobile, dob, address, city, state, pincode } = body;

    // Basic validation
    if (!first_name || !last_name || !email || !mobile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const customer: Customer = {
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
      kyc_status: 'pending',
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

// GET /api/customers/[id] - Get specific customer
export async function GET_customer(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const companyId = getCompanyId(request);
    const { id } = await params;
    
    const customer = await db.getCustomer(id, companyId);
    
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error getting customer:', error);
    return NextResponse.json(
      { error: 'Failed to get customer' },
      { status: 500 }
    );
  }
}

// PUT /api/customers/[id] - Update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const companyId = getCompanyId(request);
    const { id } = await params;
    const body = await request.json();
    
    const customer = await db.getCustomer(id, companyId);

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Update customer in database
    const updatedCustomer = {
      ...customer,
      ...body,
      updated_at: new Date(),
    };

    // Re-insert for now (in production, implement UPDATE query)
    const result = await db.createCustomer(updatedCustomer);
    await db.query('DELETE FROM customers WHERE customer_id = $1', [id]);

    return NextResponse.json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}