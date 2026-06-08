/**
 * Document Storage Service
 * Handles KYC document upload and management using AWS S3
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-signature';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

// S3 Configuration
const S3_BUCKET = process.env.AWS_S3_BUCKET || 'nbfc-kyc-documents';
const S3_REGION = process.env.AWS_REGION || 'ap-south-1';
const S3_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID || '';
const S3_SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';

// Initialize S3 client
const s3Client = new S3Client({
  region: S3_REGION,
  credentials: {
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: S3_SECRET_KEY,
  },
});

// Document types
export type DocumentType = 'id_proof' | 'address_proof' | 'income_proof' | 'pan' | 'bank_statement';

export interface KYCDocument {
  document_id: string;
  customer_id: string;
  type: DocumentType;
  original_name: string;
  s3_key: string;
  s3_url: string;
  mime_type: string;
  size: number;
  uploaded_at: Date;
  verified: boolean;
  verification_result?: {
    score: number;
    ocr_text?: string;
  };
  company_id: string;
}

export class DocumentService {
  /**
   * Upload document to S3
   */
  static async uploadDocument(options: {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
    customer_id: string;
    type: DocumentType;
    company_id: string;
  }): Promise<KYCDocument> {
    const documentId = uuidv4();
    const s3Key = `kyc/${options.company_id}/${options.customer_id}/${documentId}_${options.originalName}`;
    
    // Upload to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
      Body: options.buffer,
      ContentType: options.mimeType,
      Metadata: {
        customer_id: options.customer_id,
        document_type: options.type,
        company_id: options.company_id,
      },
    });

    try {
      await s3Client.send(uploadCommand);
    } catch (error: any) {
      // If S3 credentials are not available, store locally for development
      if (!S3_ACCESS_KEY) {
        const localPath = path.join(process.cwd(), 'uploads', s3Key);
        const dir = path.dirname(localPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(localPath, options.buffer);
        s3Key = `uploads/${s3Key}`;
      } else {
        throw error;
      }
    }

    // Construct document record
    const document: KYCDocument = {
      document_id: documentId,
      customer_id: options.customer_id,
      type: options.type,
      original_name: options.originalName,
      s3_key: s3Key,
      s3_url: `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${s3Key}`,
      mime_type: options.mimeType,
      size: options.buffer.length,
      uploaded_at: new Date(),
      verified: false,
      company_id: options.company_id,
    };

    // In production, save to database
    // await db.createDocument(document);

    return document;
  }

  /**
   * Get signed URL for document download
   */
  static async getDownloadUrl(s3Key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: S3_BUCKET,
        Key: s3Key,
      });
      
      const url = await getSignedUrl(s3Client, command, { expiresIn });
      return url;
    } catch (error) {
      // For local development, return the local path
      return `/uploads/${s3Key}`;
    }
  }

  /**
   * Delete document from S3
   */
  static async deleteDocument(s3Key: string): Promise<void> {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
    });
    
    await s3Client.send(deleteCommand);
  }

  /**
   * List documents for a customer
   */
  static async listCustomerDocuments(customerId: string, companyId: string): Promise<KYCDocument[]> {
    const listCommand = new ListObjectsV2Command({
      Bucket: S3_BUCKET,
      Prefix: `kyc/${companyId}/${customerId}/`,
    });

    const response = await s3Client.send(listCommand);
    
    if (!response.Contents) return [];

    return response.Contents.map((item, index) => ({
      document_id: `doc-${index}`,
      customer_id: customerId,
      type: this.extractDocumentType(item.Key || ''),
      original_name: path.basename(item.Key || ''),
      s3_key: item.Key || '',
      s3_url: `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${item.Key}`,
      mime_type: 'application/pdf',
      size: item.Size || 0,
      uploaded_at: item.LastModified || new Date(),
      verified: false,
      company_id: companyId,
    }));
  }

  /**
   * Extract document type from S3 key
   */
  private static extractDocumentType(key: string): DocumentType {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('id_proof') || lowerKey.includes('aadhaar')) return 'id_proof';
    if (lowerKey.includes('address')) return 'address_proof';
    if (lowerKey.includes('income')) return 'income_proof';
    if (lowerKey.includes('pan')) return 'pan';
    if (lowerKey.includes('bank')) return 'bank_statement';
    return 'id_proof';
  }
}

export default DocumentService;