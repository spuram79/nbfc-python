/**
 * Shared Utility Functions
 * Common utilities used across the NBFC platform
 */

import { format, parseISO } from 'date-fns';
import jwt from 'jsonwebtoken';
import { CONFIG, JWT_CONFIG, RolePermissions, UserRole, Permission, ApiResponse } from '@nbfc/config';
import { AuthToken, ErrorResponse } from '@nbfc/types';

// ============================================================================
// DATE UTILITIES
// ============================================================================

export const formatDate = (date: string | Date, formatStr: string = 'yyyy-MM-dd'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
};

export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy-MM-dd HH:mm:ss');
};

export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPercent = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

export const isValidAadhaar = (aadhaar: string): boolean => {
  return /^\d{12}$/.test(aadhaar);
};

export const isValidPAN = (pan: string): boolean => {
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
};

export const isValidGST = (gst: string): boolean => {
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst);
};

// ============================================================================
// STRING UTILITIES
// ============================================================================

export const generateCustomerId = (counter: number): string => {
  return `CUST${counter.toString().padStart(6, '0')}`;
};

export const generateLoanId = (counter: number): string => {
  return `LOAN${counter.toString().padStart(8, '0')}`;
};

export const generateApplicationId = (counter: number): string => {
  return `APP${counter.toString().padStart(10, '0')}`;
};

export const generateAccountId = (counter: number): string => {
  return `ACC${counter.toString().padStart(12, '0')}`;
};

export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

// ============================================================================
// NUMBER UTILITIES
// ============================================================================

export const roundToTwoDecimals = (num: number): number => {
  return Math.round(num * 100) / 100;
};

export const roundToFourDecimals = (num: number): number => {
  return Math.round(num * 10000) / 10000;
};

/**
 * Calculate EMI using standard formula
 * EMI = P * R * (1+R)^N / [(1+R)^N - 1]
 */
export const calculateEMI = (principal: number, annualRate: number, tenureMonths: number): number => {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return principal / tenureMonths;
  
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) / 
              (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return Math.round(emi);
};

/**
 * Calculate total interest for a loan
 */
export const calculateTotalInterest = (principal: number, annualRate: number, tenureMonths: number): number => {
  const emi = calculateEMI(principal, annualRate, tenureMonths);
  return Math.round(emi * tenureMonths - principal);
};

/**
 * Calculate processing fee
 */
export const calculateProcessingFee = (amount: number, fee: number, feeType: 'fixed' | 'percentage'): number => {
  if (feeType === 'percentage') {
    return Math.round((amount * fee) / 100);
  }
  return fee;
};

// ============================================================================
// OBJECT UTILITIES
// ============================================================================

export const deepMerge = <T>(target: T, source: Partial<T>): T => {
  const output = { ...target };
  if (source && typeof source === 'object') {
    Object.keys(source).forEach(key => {
      const sourceValue = source[key as keyof T];
      const targetValue = target[key as keyof T];
      if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
        output[key] = deepMerge(targetValue as T, sourceValue as Partial<T>);
      } else {
        output[key] = sourceValue;
      }
    });
  }
  return output;
};

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class AppError extends Error {
  statusCode: number;
  code: string;
  
  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || 'INTERNAL_ERROR';
    this.name = this.constructor.name;
  }
}

export const createErrorResponse = (
  message: string,
  code: string,
  statusCode: number = 500,
  details?: unknown
): ErrorResponse => {
  return {
    error: {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
    },
  };
};

// ============================================================================
// AUTH UTILITIES
// ============================================================================

export const generateAccessToken = (user: { id: string; role: UserRole; branchId?: string; tenantId?: string; permissions?: Permission[] }): string => {
  const payload: AuthToken = {
    sub: user.id,
    tenantId: user.tenantId || '',
    branchId: user.branchId,
    role: user.role,
    permissions: user.permissions || [],
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (15 * 60), // 15 minutes
    tokenType: 'access',
  };
  
  return jwt.sign(payload, JWT_CONFIG.secret, { expiresIn: JWT_CONFIG.accessExpiresIn });
};

export const generateRefreshToken = (userId: string): string => {
  const payload = {
    sub: userId,
    tokenId: `${userId}-${Date.now()}`,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
    tokenType: 'refresh',
  };
  
  return jwt.sign(payload, JWT_CONFIG.secret, { expiresIn: JWT_CONFIG.refreshExpiresIn });
};

export const verifyToken = (token: string): AuthToken => {
  return jwt.verify(token, JWT_CONFIG.secret) as AuthToken;
};

export const hashPassword = async (password: string): Promise<string> => {
  const bcrypt = await import('bcrypt');
  return bcrypt.hash(password, 12);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  const bcrypt = await import('bcrypt');
  return bcrypt.compare(password, hash);
};

// ============================================================================
// SERVICE CLIENT UTILITIES
// ============================================================================

export const createServiceClient = async <T = unknown>(
  servicePath: string,
  token?: string
): Promise<T> => {
  const baseUrl = CONFIG.services[servicePath.replace('/', '')] || servicePath;
  const url = `${baseUrl}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new AppError(`Service request failed: ${response.statusText}`, response.status);
  }
  
  return response.json() as Promise<T>;
};

export const serviceRequest = async <T = unknown>(
  url: string,
  options: RequestInit = {},
  token?: string
): Promise<ApiResponse<T>> => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new AppError(data.message || 'Service request failed', response.status);
  }
  
  return data;
};

// ============================================================================
// PAGINATION UTILITIES
// ============================================================================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export const getPaginationParams = (query: Record<string, string | undefined>): PaginationParams => {
  return {
    page: query.page ? parseInt(query.page, 10) : 1,
    limit: query.limit ? parseInt(query.limit, 10) : 10,
  };
};

export const paginate = <T>(
  items: T[],
  page: number,
  limit: number
): { data: T[]; total: number; page: number; totalPages: number } => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const totalPages = Math.ceil(items.length / limit);
  
  return {
    data: items.slice(startIndex, endIndex),
    total: items.length,
    page,
    totalPages,
  };
};

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
  formatDate,
  formatDateTime,
  formatCurrency,
  formatPercent,
  isValidEmail,
  isValidPhone,
  isValidAadhaar,
  isValidPAN,
  isValidGST,
  generateCustomerId,
  generateLoanId,
  generateApplicationId,
  generateAccountId,
  truncateString,
  roundToTwoDecimals,
  roundToFourDecimals,
  calculateEMI,
  calculateTotalInterest,
  calculateProcessingFee,
  deepMerge,
  AppError,
  createErrorResponse,
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  hashPassword,
  comparePassword,
  createServiceClient,
  serviceRequest,
  getPaginationParams,
  paginate,
};