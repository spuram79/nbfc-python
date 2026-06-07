import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Mock database
const mockUsers: Record<string, Record<string, unknown>> = {
  'admin@nbfc.com': {
    user_id: uuidv4(),
    username: 'admin',
    email: 'admin@nbfc.com',
    password: 'admin123', // In production, use hashed passwords
    role: 'admin',
    is_active: true,
  },
};

// POST /api/auth/login - Login user
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { username, password, mfa_code } = body;

  const user = Object.values(mockUsers).find(
    (u: Record<string, unknown>) => u.username === username || u.email === username
  );

  if (!user || user.password !== password) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }

  // In production, verify MFA code
  if (mfa_code && mfa_code !== '123456') {
    return NextResponse.json(
      { error: 'Invalid MFA code' },
      { status: 401 }
    );
  }

  const token = {
    access_token: `mock_token_${uuidv4()}`,
    refresh_token: `mock_refresh_${uuidv4()}`,
    expires_in: 900,
    token_type: 'Bearer',
  };

  return NextResponse.json({
    ...token,
    user: {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
}

// POST /api/auth/register - Register new user
export async function POST_register(request: NextRequest) {
  const body = await request.json();
  const { username, email, password, role } = body;

  // Check if user exists
  const existingUser = Object.values(mockUsers).find(
    (u: Record<string, unknown>) => u.email === email || u.username === username
  );

  if (existingUser) {
    return NextResponse.json(
      { error: 'User already exists' },
      { status: 409 }
    );
  }

  const user = {
    user_id: uuidv4(),
    username,
    email,
    password,
    role: role || 'loan_officer',
    is_active: true,
  };

  mockUsers[email] = user;

  return NextResponse.json(
    { user_id: user.user_id, email: user.email, username: user.username, role: user.role },
    { status: 201 }
  );
}