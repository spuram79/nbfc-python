/**
 * Company API Route
 * Handles company registration for new NBFC companies
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';

// GET /api/company - Get company configuration
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('id') || 'fintrust';
    
    const company = await db.getCompany(companyId);
    
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(company);
  } catch (error) {
    console.error('Error getting company:', error);
    return NextResponse.json(
      { error: 'Failed to get company' },
      { status: 500 }
    );
  }
}

// POST /api/company - Register new company
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, full_name, tagline, contact, theme } = body;

    // Validate required fields
    if (!id || !name || !full_name) {
      return NextResponse.json(
        { error: 'Missing required fields: id, name, full_name' },
        { status: 400 }
      );
    }

    // Check if company already exists
    const existingCompany = await db.getCompany(id);
    if (existingCompany) {
      return NextResponse.json(
        { error: 'Company with this ID already exists' },
        { status: 409 }
      );
    }

    // Create company
    const company = await db.createCompany({
      id,
      name,
      full_name,
    });

    // Set default theme
    const defaultTheme = {
      primary_color: '#1976d2',
      secondary_color: '#dc004e',
      accent_color: '#ff9800',
      ...theme,
    };

    // Update company with theme and tagline
    await db.query(
      'UPDATE companies SET theme = $1, tagline = $2 WHERE id = $3',
      [JSON.stringify(defaultTheme), tagline || `${name} - NBFC Lending Platform`, id]
    );

    return NextResponse.json({
      success: true,
      company: {
        id: company.id,
        name: company.name,
        full_name: company.full_name,
        subdomain: `${id}.nbfcapp.com`,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    );
  }
}