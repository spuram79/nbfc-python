/**
 * KYC Document API Route
 * Handles KYC document upload for customers
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { DocumentService, KYCDocument, DocumentType } from '@/lib/document-service';

// Helper to get company ID from request headers
function getCompanyId(request: NextRequest): string {
  return request.headers.get('x-company-id') || 'fintrust';
}

// POST /api/customers/[id]/kyc - Upload KYC documents
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const companyId = getCompanyId(request);
    const { id: customerId } = await params;
    const contentType = request.headers.get('content-type') || '';

    // Handle multipart form data for file uploads
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const files = formData.getAll('documents');
      
      if (!files || files.length === 0) {
        return NextResponse.json(
          { error: 'No documents uploaded' },
          { status: 400 }
        );
      }

      const documents: KYCDocument[] = [];
      
      for (const file of files) {
        // TypeScript file type for FormData
        const fileInfo = file as File;
        const buffer = Buffer.from(await fileInfo.arrayBuffer());
        
        const document = await DocumentService.uploadDocument({
          buffer,
          originalName: fileInfo.name || 'document',
          mimeType: fileInfo.type || 'application/pdf',
          customer_id: customerId,
          type: formData.get('type') as DocumentType || 'id_proof',
          company_id: companyId,
        });
        
        documents.push(document);
      }

      return NextResponse.json({
        success: true,
        documents,
      }, { status: 201 });
    }

    // Handle JSON body for legacy/simple uploads
    const body = await request.json();
    const { documents: docList } = body;

    if (!docList || docList.length === 0) {
      return NextResponse.json(
        { error: 'No documents provided' },
        { status: 400 }
      );
    }

    // For now, return mock response since actual file upload requires form data
    const documents: KYCDocument[] = docList.map((doc: any) => ({
      document_id: uuidv4(),
      customer_id: customerId,
      type: doc.type || 'id_proof',
      original_name: doc.name || 'document',
      s3_key: `kyc/${companyId}/${customerId}/${uuidv4()}_${doc.name}`,
      s3_url: `https://nbfc-kyc-documents.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/kyc/${companyId}/${customerId}/${uuidv4()}_${doc.name}`,
      mime_type: doc.mime_type || 'application/pdf',
      size: doc.size || 0,
      uploaded_at: new Date(),
      verified: false,
      company_id: companyId,
    }));

    return NextResponse.json({
      success: true,
      documents,
    }, { status: 201 });

  } catch (error) {
    console.error('Error uploading KYC documents:', error);
    return NextResponse.json(
      { error: 'Failed to upload documents' },
      { status: 500 }
    );
  }
}

// GET /api/customers/[id]/kyc - Get customer's KYC documents
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const companyId = getCompanyId(request);
    const { id: customerId } = await params;

    // List documents from S3
    const documents = await DocumentService.listCustomerDocuments(customerId, companyId);

    return NextResponse.json({ documents, total: documents.length });
  } catch (error) {
    console.error('Error listing KYC documents:', error);
    return NextResponse.json(
      { error: 'Failed to list documents' },
      { status: 500 }
    );
  }
}