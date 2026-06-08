/**
 * Shared Utility Functions
 * Common utilities used across the NBFC platform
 */

import { format, formatDistance, parseISO } from 'date-fns';

// Date formatting utilities
export const formatDate = (date: string | Date, formatStr: string = 'yyyy-MM-dd'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
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

// Validation utilities
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

// String utilities
export const generateCustomerId = (counter: number): string => {
  return `CUST${counter.toString().padStart(3, '0')}`;
};

export const generateLoanId = (counter: number): string => {
  return `LOAN${counter.toString().padStart(3, '0')}`;
};

export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

// Number utilities
export const roundToTwoDecimals = (num: number): number => {
  return Math.round(num * 100) / 100;
};

export const calculateEMI = (principal: number, rate: number, tenure: number): number => {
  const monthlyRate = rate / 12 / 100;
  const denominator = 1 - Math.pow(1 + monthlyRate, -tenure);
  return (principal * monthlyRate) / denominator;
};

// Object utilities
export const deepMerge = <T>(target: T, source: Partial<T>): T => {
  const output = { ...target };
  if (source && typeof source === 'object') {
    Object.keys(source).forEach(key => {
      if (source[key as keyof T] && typeof source[key as keyof T] === 'object') {
        output[key] = deepMerge(target[key] as T, source[key as keyof T] as Partial<T>);
      } else {
        output[key] = source[key as keyof T];
      }
    });
  }
  return output;
};

// Error handling
export class AppError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}

export const handleError = (error: unknown): { message: string; statusCode: number } => {
  if (error instanceof AppError) {
    return { message: error.message, statusCode: error.statusCode };
  }
  if (error instanceof Error) {
    return { message: error.message, statusCode: 500 };
  }
  return { message: 'An unknown error occurred', statusCode: 500 };
};