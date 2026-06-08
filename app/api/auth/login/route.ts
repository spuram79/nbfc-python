/**
 * Authentication API Route
 * Handles login, logout, and token management
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRES_IN = '7d'; // 7 days

// User roles and permissions
export type UserRole = 'admin' | 'branch_manager' | 'loan_officer' | 'collections' | 'customer';

export interface AuthUser {
  user_id: string;
  username: string;
  email: string;
  role: UserRole;
  company_id: string;
  is_active: boolean;
}

// Helper to get company ID from request headers
function getCompanyId(request: NextRequest): string {
  return request.headers.get('x-company-id') || 'fintrust';
}

// Generate JWT token
function generateAccessToken(user: AuthUser): string {
  const payload = {
    sub: user.user_id,
    email: user.email,
    role: user.role,
    company_id: user.company_id,
    scope: getScopeForRole(user.role),
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Generate refresh token
function generateRefreshToken(user: AuthUser): string {
  const payload = { sub: user.user_id };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
}

// Get scopes for each role
function getScopeForRole(role: UserRole): string {
  const scopes: Record<UserRole, string> = {
    admin: 'user:read user:write user:delete loan:read loan:create loan:update loan:disburse payment:read payment:create customer:read customer:write kyc:read kyc:verify',
    branch_manager: 'loan:read loan:create loan:approve customer:read customer:write',
    loan_officer: 'loan:read loan:create loan:update customer:read kyc:read',
    collections: 'loan:read loan:update payment:read payment:create',
    customer: 'loan:read loan:create payment:read self:read',
  };
  return scopes[role];
}

// POST /api/auth/login - Authenticate user
export async function POST(request: NextRequest) {
  try {
    const { username, password, role } = await request.json();
    const companyId = getCompanyId(request);

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // In production, verify against database with hashed passwords
    // For now, we create a mock user based on role or email
    const user: AuthUser = {
      user_id: 'user-' + Math.random().toString(36).substring(7),
      username,
      email: username.includes('@') ? username : `${username}@${companyId}.com`,
      role: (role as UserRole) || 'customer',
      company_id: companyId,
      is_active: true,
    };

    // Mock authentication - in production, verify password against hash
    // if (password !== 'admin123') {
    //   return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    // }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Return response with tokens
    return NextResponse.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 900, // 15 minutes in seconds
      token_type: 'Bearer',
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        company_id: user.company_id,
      },
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// POST /api/auth/logout - Invalidate session
export async function DELETE(request: NextRequest) {
  try {
    // In production, invalidate refresh token in database
    // For now, just return success
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}