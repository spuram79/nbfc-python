/**
 * Middleware for JWT Authentication
 * Validates tokens on protected routes
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  company_id: string;
  scope: string;
  iat?: number;
  exp?: number;
}

// Verify JWT token
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
}

// Middleware to protect API routes
export function withAuth(handler: (request: NextRequest, payload: JwtPayload) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
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

    return handler(request, payload);
  };
}

// Protected API route wrapper
export function protectRoute(
  request: NextRequest,
  requiredScopes?: string | string[],
  requiredRoles?: string | string[]
): { success: true; payload: JwtPayload } | NextResponse {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { success: false, payload: null } as any;
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return { success: false, payload: null } as any;
  }

  // Check required scopes
  if (requiredScopes) {
    const scopes = Array.isArray(requiredScopes) ? requiredScopes : [requiredScopes];
    const tokenScopes = payload.scope?.split(' ') || [];
    const hasScope = scopes.some(s => tokenScopes.includes(s));
    if (!hasScope) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
  }

  // Check required roles
  if (requiredRoles) {
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    if (!roles.includes(payload.role)) {
      return NextResponse.json(
        { error: 'Forbidden: insufficient role' },
        { status: 403 }
      );
    }
  }

  return { success: true, payload };
}