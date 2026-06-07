import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Mock database
const mockCustomers: Record<string, unknown> = {};

// GET /api/customers - List all customers
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');

  let results = Object.values(mockCustomers);
  
  if (search) {
    results = results.filter((customer: Record<string, unknown>) => 
      customer.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      customer.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      customer.mobile?.includes(search)
    );
  }

  return NextResponse.json({
    customers: results,
    total: results.length,
  });
}

// POST /api/customers - Register new customer
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { first_name, last_name, email, mobile, dob, address, city, state, pincode } = body;

  // Basic validation
  if (!first_name || !last_name || !email || !mobile) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

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
    kyc_status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  mockCustomers[customer.customer_id] = customer;

  return NextResponse.json(customer, { status: 201 });
}

// GET /api/customers/[id] - Get specific customer
export async function GET_customer(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const customer = mockCustomers[params.id];
  
  if (!customer) {
    return NextResponse.json(
      { error: 'Customer not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(customer);
}

// PUT /api/customers/[id] - Update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const customer = mockCustomers[params.id];

  if (!customer) {
    return NextResponse.json(
      { error: 'Customer not found' },
      { status: 404 }
    );
  }

  mockCustomers[params.id] = {
    ...customer,
    ...body,
    updated_at: new Date().toISOString(),
  };

  return NextResponse.json(mockCustomers[params.id]);
}