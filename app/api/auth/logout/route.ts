import { NextRequest, NextResponse } from 'next/server';

// POST /api/auth/logout - Invalidate session
export async function POST(request: NextRequest) {
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
