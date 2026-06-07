import { NextRequest, NextResponse } from 'next/server';

// Mock metrics data
const mockMetrics = {
  portfolio_health: {
    total_loan_book: 45000000,
    active_loans: 16000000,
    npa_loans: 1020000,
    npa_ratio: 2.3,
    provision_coverage: 75,
    avg_loan_size: 357143,
  },
  risk_analysis: {
    high_risk: 1250000,
    medium_risk: 2500000,
    low_risk: 12250000,
    score_distribution: {
      '90-100': 45,
      '80-89': 25,
      '70-79': 15,
      '60-69': 10,
      'below-60': 5,
    },
  },
  collections: {
    collection_efficiency: 94.5,
    overdue_90_days: 1500000,
    overdue_180_days: 800000,
    write_offs: 250000,
  },
  product_performance: [
    { product: 'personal', count: 420, amount: 12500000, npa: 1.2 },
    { product: 'home', count: 280, amount: 18500000, npa: 0.8 },
    { product: 'vehicle', count: 195, amount: 8200000, npa: 1.5 },
    { product: 'gold', count: 120, amount: 2800000, npa: 0.5 },
    { product: 'msme', count: 89, amount: 6500000, npa: 2.1 },
    { product: 'mortgage', count: 45, amount: 3200000, npa: 0.3 },
    { product: 'topup', count: 63, amount: 2350000, npa: 0.9 },
  ],
};

// GET /api/metrics - Get portfolio metrics
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (type) {
    const metric = mockMetrics[type as keyof typeof mockMetrics];
    if (!metric) {
      return NextResponse.json(
        { error: 'Invalid metric type' },
        { status: 400 }
      );
    }
    return NextResponse.json({ [type]: metric });
  }

  return NextResponse.json(mockMetrics);
}

// GET /api/metrics/portfolio - Get portfolio health
export async function GET_portfolio(request: NextRequest) {
  return NextResponse.json(mockMetrics.portfolio_health);
}

// GET /api/metrics/risk - Get risk analysis
export async function GET_risk(request: NextRequest) {
  return NextResponse.json(mockMetrics.risk_analysis);
}

// GET /api/metrics/collections - Get collections metrics
export async function GET_collections(request: NextRequest) {
  return NextResponse.json(mockMetrics.collections);
}

// GET /api/metrics/products - Get product performance
export async function GET_products(request: NextRequest) {
  return NextResponse.json(mockMetrics.product_performance);
}

// POST /api/metrics/score - Calculate risk score for customer
export async function POST_score(request: NextRequest) {
  const body = await request.json();
  const { 
    customer_id, 
    monthly_income, 
    existing_emis, 
    credit_history, 
    employment_type,
    loan_amount,
    tenure 
  } = body;

  // Mock risk scoring algorithm
  let score = 50;

  // Income to EMI ratio (max 30% of income)
  const proposed_emi = (loan_amount * 0.01) / tenure; // Simplified EMI calculation
  const income_ratio = (proposed_emi + existing_emis) / monthly_income;
  if (income_ratio < 0.3) score += 20;
  else if (income_ratio < 0.5) score += 10;
  else score -= 20;

  // Credit history
  if (credit_history === 'excellent') score += 15;
  else if (credit_history === 'good') score += 10;
  else if (credit_history === 'average') score += 5;
  else score -= 10;

  // Employment type
  if (employment_type === 'salaried') score += 10;
  else if (employment_type === 'business') score += 5;

  // Clamp score to 0-100
  score = Math.max(0, Math.min(100, score));

  const decision = score >= 70 ? 'APPROVE' : score >= 50 ? 'REVIEW' : 'REJECT';

  return NextResponse.json({
    customer_id,
    risk_score: score,
    decision,
    factors: {
      income_ratio,
      credit_history,
      employment_type,
      score_breakdown: {
        income_component: income_ratio < 0.3 ? 20 : income_ratio < 0.5 ? 10 : -20,
        credit_component: credit_history === 'excellent' ? 15 : credit_history === 'good' ? 10 : credit_history === 'average' ? 5 : -10,
        employment_component: employment_type === 'salaried' ? 10 : employment_type === 'business' ? 5 : 0,
        base_score: 35,
        total_score: score,
      },
    },
  });
}