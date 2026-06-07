import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Mock database
const mockReports: Record<string, Record<string, unknown>> = {};

// GET /api/reports - List all reports
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  const reports = type 
    ? Object.values(mockReports).filter((r: Record<string, unknown>) => r.type === type)
    : Object.values(mockReports);

  return NextResponse.json({ reports, total: reports.length });
}

// POST /api/reports - Generate new report
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { type, period, format = 'pdf' } = body;

  const validTypes = ['mis', 'capital_adequacy', 'gl_return', 'credit_appraisal', 'npa'];
  if (!type || !validTypes.includes(type)) {
    return NextResponse.json(
      { error: 'Invalid report type. Valid types: ' + validTypes.join(', ') },
      { status: 400 }
    );
  }

  const report = {
    report_id: uuidv4(),
    type,
    period,
    format,
    status: 'processing',
    created_at: new Date().toISOString(),
    download_url: null as string | null,
  };

  mockReports[report.report_id] = report;

  // Simulate async processing
  setTimeout(() => {
    mockReports[report.report_id].status = 'ready';
    mockReports[report.report_id].download_url = `/api/reports/${report.report_id}/download`;
    mockReports[report.report_id].generated_at = new Date().toISOString();
  }, 3000);

  return NextResponse.json(report, { status: 201 });
}

// GET /api/reports/[id] - Get specific report
export async function GET_report(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const report = mockReports[params.id];

  if (!report) {
    return NextResponse.json(
      { error: 'Report not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(report);
}

// GET /api/reports/[id]/download - Download report
export async function GET_download(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const report = mockReports[params.id];

  if (!report) {
    return NextResponse.json(
      { error: 'Report not found' },
      { status: 404 }
    );
  }

  if (report.status !== 'ready') {
    return NextResponse.json(
      { error: 'Report not ready for download' },
      { status: 400 }
    );
  }

  // Return mock download response
  return NextResponse.json({
    download_url: report.download_url,
    filename: `${report.type}_${report.period}.${report.format}`,
    size: '2.3 MB',
  });
}